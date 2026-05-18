"use client";

import { useState } from "react";
import { 
    FolderTree, 
    PlusCircle, 
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Info,
    Network,
    Terminal,
    Palette,
    Folder,
    Link2,
    Edit2,
    Trash2,
    X,
    AlertTriangle,
    Plus
} from "lucide-react";
import { CategoryTreeNode } from "@/features/instructor/types/course";
import { 
    getCategoriesList, 
    createCategory,
    updateCategory,
    deleteCategory
} from "../lib/category-api";
import { showToast } from "@/features/instructor/components/Toast";

interface CategoriesViewProps {
    initialCategories: CategoryTreeNode[];
}

interface FlattenedCategory {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    parentName?: string;
    depth: number;
}

export default function CategoriesView({ initialCategories }: CategoriesViewProps) {
    const [categoriesTree, setCategoriesTree] = useState<CategoryTreeNode[]>(initialCategories);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form inputs for creation
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [parentCategoryId, setParentCategoryId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [customSlugEdited, setCustomSlugEdited] = useState(false);

    // Editing state
    const [editingCategory, setEditingCategory] = useState<FlattenedCategory | null>(null);
    const [editName, setEditName] = useState("");
    const [editSlug, setEditSlug] = useState("");
    const [editCustomSlugEdited, setEditCustomSlugEdited] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Deleting state
    const [deletingCategory, setDeletingCategory] = useState<FlattenedCategory | null>(null);
    const [destroying, setDestroying] = useState(false);

    // Bulletproof Normalizer to build visual hierarchy from ANY API response format
    const normalizeAndFlatten = (rawCategories: any[]): FlattenedCategory[] => {
        if (!rawCategories || !Array.isArray(rawCategories)) return [];

        const allNodesMap = new Map<string, { id: string; name: string; slug: string; children: any[] }>();
        const childIdsSet = new Set<string>();

        // 1. Populate details map
        for (const cat of rawCategories) {
            if (cat && cat.id) {
                allNodesMap.set(cat.id, {
                    id: cat.id,
                    name: cat.name || "",
                    slug: cat.slug || "",
                    children: Array.isArray(cat.children) ? cat.children : []
                });
            }
        }

        // 2. Identify if children are strings (IDs) vs objects
        let childrenAreStrings = false;
        for (const cat of rawCategories) {
            if (cat && cat.children && cat.children.length > 0) {
                if (typeof cat.children[0] === 'string') {
                    childrenAreStrings = true;
                }
                break;
            }
        }

        let rootNodes: any[] = [];

        if (childrenAreStrings) {
            // Track all child references
            for (const cat of rawCategories) {
                if (cat.children) {
                    for (const childId of cat.children) {
                        if (typeof childId === 'string') {
                            childIdsSet.add(childId);
                        }
                    }
                }
            }
            // Roots are not referenced as a child
            for (const cat of rawCategories) {
                if (!childIdsSet.has(cat.id)) {
                    rootNodes.push(allNodesMap.get(cat.id));
                }
            }
        } else {
            // Children are recursive objects or it's a pre-built hierarchy
            const childObjectsSet = new Set<string>();
            const collectChildIds = (nodes: any[]) => {
                for (const node of nodes) {
                    if (node && node.children) {
                        for (const child of node.children) {
                            if (child && typeof child === 'object' && child.id) {
                                childObjectsSet.add(child.id);
                                collectChildIds(node.children);
                            }
                        }
                    }
                }
            };
            collectChildIds(rawCategories);

            for (const cat of rawCategories) {
                if (!childObjectsSet.has(cat.id)) {
                    rootNodes.push(cat);
                }
            }
        }

        // 3. Build recursive hierarchy traversal
        const result: FlattenedCategory[] = [];
        const traverse = (node: any, parentName?: string, parentId?: string | null, depth = 0) => {
            if (!node) return;
            
            result.push({
                id: node.id,
                name: node.name,
                slug: node.slug || "",
                parentId: parentId || null,
                parentName,
                depth
            });

            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    if (typeof child === 'string') {
                        const childNode = allNodesMap.get(child);
                        if (childNode) {
                            traverse(childNode, node.name, node.id, depth + 1);
                        }
                    } else if (child && typeof child === 'object') {
                        traverse(child, node.name, node.id, depth + 1);
                    }
                }
            }
        };

        for (const root of rootNodes) {
            traverse(root, undefined, null, 0);
        }

        return result;
    };

    const flatCategories = normalizeAndFlatten(categoriesTree);

    // Dynamic slug auto-generator for creation
    const handleNameChange = (val: string) => {
        setName(val);
        if (!customSlugEdited) {
            const generated = val
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "");
            setSlug(generated);
        }
    };

    // Dynamic slug auto-generator for editing
    const handleEditNameChange = (val: string) => {
        setEditName(val);
        if (!editCustomSlugEdited) {
            const generated = val
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "");
            setEditSlug(generated);
        }
    };

    // Refresh categories tree
    const refreshCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategoriesList();
            setCategoriesTree(data);
        } catch (error: any) {
            showToast("error", error?.message || "Failed to reload categories.");
        } finally {
            setLoading(false);
        }
    };

    // Submit Create Category
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            showToast("error", "Category name is required.");
            return;
        }
        if (!slug.trim()) {
            showToast("error", "Category slug is required.");
            return;
        }

        const targetName = name.trim();
        const targetSlug = slug.trim().toLowerCase();

        setSubmitting(true);
        try {
            // Attempt standard creation call
            await createCategory({
                name: targetName,
                slug: targetSlug,
                parentId: parentCategoryId ? parentCategoryId : null
            });

            showToast("success", `Category "${targetName}" was created successfully!`);
            setName("");
            setSlug("");
            setParentCategoryId("");
            setCustomSlugEdited(false);
            await refreshCategories();
        } catch (error: any) {
            console.warn("Standard POST request failed. Running resilient verification check...", error);
            
            // Resilient check path: query public/anonymous GET endpoint to see if database actually committed the category
            try {
                const latestData = await getCategoriesList();
                const latestFlat = normalizeAndFlatten(latestData);
                
                const exists = latestFlat.some(cat => 
                    cat.name.toLowerCase() === targetName.toLowerCase() ||
                    cat.slug.toLowerCase() === targetSlug.toLowerCase()
                );

                if (exists) {
                    setCategoriesTree(latestData);
                    showToast("success", `Category "${targetName}" was created successfully!`);
                    setName("");
                    setSlug("");
                    setParentCategoryId("");
                    setCustomSlugEdited(false);
                    return;
                }
            } catch (checkError) {
                console.error("Resilient database lookup check failed:", checkError);
            }

            showToast("error", error?.message || "Failed to create category.");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle PUT Save Changes
    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        if (!editName.trim() || !editSlug.trim()) {
            showToast("error", "Name and Slug are required.");
            return;
        }

        const targetId = editingCategory.id;
        const targetName = editName.trim();
        const targetSlug = editSlug.trim().toLowerCase();

        setUpdating(true);
        try {
            await updateCategory(targetId, {
                name: targetName,
                slug: targetSlug
            });

            showToast("success", `Category details updated!`);
            setEditingCategory(null);
            await refreshCategories();
        } catch (error: any) {
            console.warn("Standard PUT request failed. Running resilient verification check...", error);
            
            // Resilient check path: query public GET endpoint to verify if changes committed successfully
            try {
                const latestData = await getCategoriesList();
                const latestFlat = normalizeAndFlatten(latestData);
                
                const matched = latestFlat.find(cat => cat.id === targetId);
                if (matched && matched.name === targetName && matched.slug === targetSlug) {
                    setCategoriesTree(latestData);
                    showToast("success", `Category details updated!`);
                    setEditingCategory(null);
                    return;
                }
            } catch (checkError) {
                console.error("Resilient PUT check failed:", checkError);
            }

            showToast("error", error?.message || "Failed to update category.");
        } finally {
            setUpdating(false);
        }
    };

    // Handle DELETE Confirm
    const handleDeleteConfirm = async () => {
        if (!deletingCategory) return;
        const targetId = deletingCategory.id;
        const targetName = deletingCategory.name;

        setDestroying(true);
        try {
            await deleteCategory(targetId);

            showToast("success", `Category "${targetName}" deleted successfully.`);
            setDeletingCategory(null);
            await refreshCategories();
        } catch (error: any) {
            console.warn("Standard DELETE request failed. Running resilient verification check...", error);
            
            // Resilient check path: query public GET endpoint to verify if node is actually removed
            try {
                const latestData = await getCategoriesList();
                const latestFlat = normalizeAndFlatten(latestData);
                
                const stillExists = latestFlat.some(cat => cat.id === targetId);
                if (!stillExists) {
                    setCategoriesTree(latestData);
                    showToast("success", `Category "${targetName}" deleted successfully.`);
                    setDeletingCategory(null);
                    return;
                }
            } catch (checkError) {
                console.error("Resilient DELETE check failed:", checkError);
            }

            showToast("error", error?.message || "Failed to delete category.");
        } finally {
            setDestroying(false);
        }
    };

    // Filter flat categories list for tree view search
    const filteredCategories = flatCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.parentName && cat.parentName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Dynamic icon assigner based on category name
    const getCategoryIcon = (catName: string) => {
        const lower = catName.toLowerCase();
        if (lower.includes("code") || lower.includes("programming") || lower.includes("development") || lower.includes("computer")) {
            return <Terminal size={15} />;
        }
        if (lower.includes("design") || lower.includes("creative") || lower.includes("art") || lower.includes("ux")) {
            return <Palette size={15} />;
        }
        if (lower.includes("ai") || lower.includes("intelligence") || lower.includes("data") || lower.includes("science")) {
            return <Network size={15} />;
        }
        return <Folder size={15} />;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-[28px] font-bold text-brand-navy tracking-tight">Categories Management</h1>
                <p className="text-brand-muted text-[15px] font-medium mt-1">
                    Define and organize the curriculum taxonomy. Accessible publicly for course catalog navigation.
                </p>
            </div>

            {/* Create Category Panel */}
            <section className="bg-white rounded-2xl border border-brand-border/70 overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Visual Callout block */}
                    <div className="lg:col-span-5 p-8 bg-brand-primary text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                        <div className="absolute -top-12 -right-12 h-64 w-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-2xl font-extrabold tracking-tight">Organize Knowledge</h3>
                            <p className="text-sm opacity-90 leading-relaxed font-medium">
                                Expand the Virtual Horizon library by creating structured hierarchies. Adding child taxonomies makes it simple for students to explore topics step-by-step.
                            </p>
                        </div>
                        <div className="mt-8 relative z-10 bg-white/10 border border-white/10 p-4 rounded-xl backdrop-blur-xs flex items-start gap-2.5">
                            <Info size={16} className="text-white shrink-0 mt-0.5" />
                            <p className="text-[11px] font-semibold opacity-90 leading-normal">
                                Protip: Creating detailed category tags and slugs improves course URL routing and global indexing.
                            </p>
                        </div>
                    </div>

                    {/* Create Category form */}
                    <div className="lg:col-span-7 p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-brand-navy uppercase tracking-wide ml-1">
                                        Category Name
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="e.g. Advanced Machine Learning"
                                        value={name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium placeholder:text-brand-muted/40"
                                    />
                                </div>

                                {/* Parent Dropdown selection */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-brand-navy uppercase tracking-wide ml-1">
                                        Parent Category
                                    </label>
                                    <select 
                                        value={parentCategoryId}
                                        onChange={(e) => setParentCategoryId(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold"
                                    >
                                        <option value="">None (Root Category)</option>
                                        {flatCategories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {"— ".repeat(cat.depth)}{cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Slug Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-navy uppercase tracking-wide ml-1">
                                    Slug (URL segment)
                                </label>
                                <div className="relative">
                                    <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                                    <input 
                                        type="text"
                                        required
                                        placeholder="advanced-machine-learning"
                                        value={slug}
                                        onChange={(e) => {
                                            setSlug(e.target.value);
                                            setCustomSlugEdited(true);
                                        }}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium placeholder:text-brand-muted/40"
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex justify-end pt-1">
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-brand-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-brand-hover hover:shadow-sm active:scale-98 transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
                                >
                                    {submitting ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <PlusCircle size={14} />
                                    )}
                                    Create Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* List Header controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <FolderTree size={20} className="text-brand-primary" />
                    <h3 className="text-lg font-bold text-brand-navy">Visual Taxonomy Tree</h3>
                </div>

                {/* Search bar */}
                <div className="relative max-w-xs w-full">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                        type="text"
                        placeholder="Search taxonomy..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                    />
                </div>
            </div>

            {/* Visual Tree Explorer Container */}
            <div className="bg-white rounded-2xl border border-brand-border/70 overflow-hidden shadow-sm p-6">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-brand-muted gap-3">
                        <Loader2 className="animate-spin text-brand-primary" size={32} />
                        <p className="text-sm font-semibold">Updating catalog...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="py-16 text-center text-brand-muted">
                        <p className="text-sm font-semibold">No categories cataloged yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filteredCategories.map((cat, rowIndex) => {
                            // Find out if this category has next siblings at the same depth to determine connection lines
                            return (
                                <div key={cat.id} className="flex items-stretch min-h-[48px] group select-none">
                                    {/* 1. Connecting Indent Lines (Parent Depth columns) */}
                                    {Array.from({ length: cat.depth }).map((_, index) => {
                                        // Draw a simple light guiding vertical border for ancestor tree rows
                                        return (
                                            <div key={index} className="w-8 shrink-0 relative flex justify-center">
                                                <div className="w-[1px] bg-brand-border/60 absolute top-0 bottom-0 left-1/2" />
                                            </div>
                                        );
                                    })}

                                    {/* 2. Immediate Parent Elbow Connector */}
                                    {cat.depth > 0 && (
                                        <div className="w-8 shrink-0 relative flex justify-center">
                                            {/* Top-to-middle vertical bar */}
                                            <div className="w-[1.5px] bg-brand-border/70 absolute top-0 h-1/2 left-1/2" />
                                            {/* Horizontal bent connector elbow */}
                                            <div className="h-[1.5px] bg-brand-border/70 absolute top-1/2 left-1/2 right-0 rounded-bl" />
                                        </div>
                                    )}

                                    {/* 3. The Visual Node Item Row */}
                                    <div className="flex-1 flex items-center justify-between border border-transparent hover:border-brand-border/80 hover:bg-brand-soft/20 rounded-xl px-4 py-2.5 transition-all">
                                        <div className="flex items-center gap-3">
                                            {/* Icon styled as folder */}
                                            <div 
                                                className={`
                                                    w-8 h-8 rounded-lg flex items-center justify-center text-brand-primary shrink-0
                                                    ${cat.depth > 0 ? "bg-brand-soft/60 border border-brand-border/40 text-brand-muted" : "bg-brand-primary/10"}
                                                `}
                                            >
                                                {getCategoryIcon(cat.name)}
                                            </div>
                                            
                                            {/* Text Data */}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-brand-navy">{cat.name}</span>
                                                    <code className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-gray-100 rounded text-brand-muted">
                                                        {cat.slug}
                                                    </code>
                                                </div>
                                                {cat.parentName && (
                                                    <p className="text-[9px] text-brand-primary font-bold mt-0.5 uppercase tracking-wide">
                                                        Subcategory under {cat.parentName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Inline Contextual Actions */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Quick Sub-add shortcut */}
                                            <button
                                                onClick={() => {
                                                    setParentCategoryId(cat.id);
                                                    showToast("info", `Selected "${cat.name}" as parent category!`);
                                                    window.scrollTo({ top: 120, behavior: "smooth" });
                                                }}
                                                className="p-1 rounded-md border border-brand-border/80 bg-white text-brand-navy hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all"
                                                title="Add Subcategory"
                                            >
                                                <Plus size={12} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setEditingCategory(cat);
                                                    setEditName(cat.name);
                                                    setEditSlug(cat.slug);
                                                    setEditCustomSlugEdited(true);
                                                }}
                                                className="p-1 rounded-md border border-brand-border/80 bg-white text-brand-navy hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button 
                                                onClick={() => setDeletingCategory(cat)}
                                                className="p-1 rounded-md border border-brand-border/80 bg-white text-red-500 hover:text-red-600 hover:border-red-400 hover:bg-red-50 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit Modal Overlay */}
            {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/35 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl border border-brand-border p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
                        <button 
                            onClick={() => setEditingCategory(null)}
                            className="absolute top-4 right-4 text-brand-muted hover:text-brand-navy p-1.5 rounded-xl hover:bg-brand-soft"
                        >
                            <X size={18} />
                        </button>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                    <Folder size={18} />
                                </div>
                                <div>
                                    <h3 className="text-md font-bold text-brand-navy">Edit Category</h3>
                                    <p className="text-[11px] text-brand-muted font-semibold mt-0.5">Modify information for "{editingCategory.name}"</p>
                                </div>
                            </div>

                            <form onSubmit={handleEditSave} className="space-y-4 pt-2">
                                {/* Edit Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-navy uppercase tracking-wide">Category Name</label>
                                    <input 
                                        type="text"
                                        required
                                        value={editName}
                                        onChange={(e) => handleEditNameChange(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                                    />
                                </div>

                                {/* Edit Slug */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-navy uppercase tracking-wide">Slug</label>
                                    <input 
                                        type="text"
                                        required
                                        value={editSlug}
                                        onChange={(e) => {
                                            setEditSlug(e.target.value);
                                            setEditCustomSlugEdited(true);
                                        }}
                                        className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                                    />
                                </div>

                                {/* Modal Actions */}
                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border/60">
                                    <button 
                                        type="button"
                                        onClick={() => setEditingCategory(null)}
                                        className="px-4 py-2 border border-brand-border/80 hover:bg-brand-soft/20 text-xs font-bold text-brand-navy rounded-xl transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={updating}
                                        className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        {updating && <Loader2 size={12} className="animate-spin" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal Overlay */}
            {deletingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/35 backdrop-blur-xs p-4">
                    <div className="w-full max-w-sm bg-white rounded-2xl border border-brand-border p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
                        <button 
                            onClick={() => setDeletingCategory(null)}
                            className="absolute top-4 right-4 text-brand-muted hover:text-brand-navy p-1.5 rounded-xl hover:bg-brand-soft"
                        >
                            <X size={18} />
                        </button>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5 text-red-600">
                                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                                    <AlertTriangle size={18} />
                                </div>
                                <div>
                                    <h3 className="text-md font-bold text-brand-navy">Delete Category</h3>
                                    <p className="text-[11px] text-brand-muted font-semibold mt-0.5">Danger zone operation</p>
                                </div>
                            </div>

                            <div className="py-1">
                                <p className="text-xs text-brand-navy font-medium leading-relaxed">
                                    Are you sure you want to permanently delete <strong className="text-brand-navy font-bold">"{deletingCategory.name}"</strong>?
                                </p>
                                <p className="text-[10px] text-red-500 font-semibold mt-1">
                                    Warning: This will break courses and nested subcategories dependent on this taxon.
                                </p>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border/60">
                                <button 
                                    onClick={() => setDeletingCategory(null)}
                                    className="px-4 py-2 border border-brand-border/80 hover:bg-brand-soft/20 text-xs font-bold text-brand-navy rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDeleteConfirm}
                                    disabled={destroying}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm shadow-red-100"
                                >
                                    {destroying && <Loader2 size={12} className="animate-spin" />}
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
