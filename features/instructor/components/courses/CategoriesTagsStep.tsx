"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, X, Loader2, Search, Tag, Plus, FolderTree } from "lucide-react";
import { courseApi } from "@/features/instructor/lib/course-api";
import { CategoryTreeNode, CourseCategoryDto, CourseTagDto } from "@/features/instructor/types/course";
import { showToast } from "../Toast";

interface CategoriesTagsStepProps {
    courseId: string;
    categories: CourseCategoryDto[];
    tags: CourseTagDto[];
    onSaved: (data: { categories?: CourseCategoryDto[]; tags?: CourseTagDto[] }) => void;
}

function CategoryNode({ node, depth, onSelect }: { node: CategoryTreeNode; depth: number; onSelect: (id: string, name: string) => void }) {
    const [open, setOpen] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    return (
        <div>
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand-bg transition-colors cursor-pointer"
                style={{ paddingLeft: `${12 + depth * 20}px` }}
                onClick={() => { if (hasChildren) setOpen(!open); else onSelect(node.id, node.name); }}
            >
                {hasChildren ? (
                    <>
                        {open ? <ChevronDown size={14} className="text-brand-muted shrink-0" /> : <ChevronRight size={14} className="text-brand-muted shrink-0" />}
                        {open ? <FolderOpen size={14} className="text-amber-500 shrink-0" /> : <Folder size={14} className="text-amber-500 shrink-0" />}
                    </>
                ) : (
                    <span className="w-[14px] shrink-0" />
                )}
                <span className={`text-sm ${hasChildren ? "font-medium text-brand-text" : "text-brand-text hover:text-brand-primary"}`}>{node.name}</span>
                {!hasChildren && <Plus size={12} className="text-brand-muted ml-auto shrink-0" />}
            </div>
            {open && hasChildren && node.children.map((child) => (
                <CategoryNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
            ))}
        </div>
    );
}

export default function CategoriesTagsStep({ courseId, categories: initCats, tags: initTags, onSaved }: CategoriesTagsStepProps) {
    const [categories, setCategories] = useState<CourseCategoryDto[]>(initCats);
    const [tags, setTags] = useState<CourseTagDto[]>(initTags);
    const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
    const [loadingTree, setLoadingTree] = useState(true);
    const [tagInput, setTagInput] = useState("");
    const [tagSuggestions, setTagSuggestions] = useState<{ id: string; name: string }[]>([]);
    const [searchingTags, setSearchingTags] = useState(false);
    const [addingCat, setAddingCat] = useState<string | null>(null);
    const [addingTag, setAddingTag] = useState(false);
    const [removingCat, setRemovingCat] = useState<string | null>(null);
    const [removingTag, setRemovingTag] = useState<string | null>(null);
    const MAX_TAGS = 10;

    useEffect(() => {
        (async () => {
            try {
                const tree = await courseApi.getCategories();
                setCategoryTree(Array.isArray(tree) ? tree : []);
            } catch {
                showToast("error", "Failed to load categories");
            } finally {
                setLoadingTree(false);
            }
        })();
    }, []);

    const searchTagsDebounced = useCallback(async (q: string) => {
        if (!q.trim()) { setTagSuggestions([]); return; }
        setSearchingTags(true);
        try {
            const res = await courseApi.searchTags(q);
            setTagSuggestions(Array.isArray(res) ? res : []);
        } catch { setTagSuggestions([]); }
        finally { setSearchingTags(false); }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => searchTagsDebounced(tagInput), 300);
        return () => clearTimeout(t);
    }, [tagInput, searchTagsDebounced]);

    const handleAddCategory = async (catId: string, catName: string) => {
        if (categories.some((c) => c.id === catId)) { showToast("info", "Category already assigned"); return; }
        setAddingCat(catId);
        try {
            await courseApi.addCourseCategory(courseId, catId);
            const newCats = [...categories, { id: catId, name: catName, parentId: null }];
            setCategories(newCats);
            onSaved({ categories: newCats });
            showToast("success", `Category "${catName}" added`);
        } catch (err: any) {
            showToast("error", err.message || "Failed to add category");
        } finally { setAddingCat(null); }
    };

    const handleRemoveCategory = async (catId: string) => {
        setRemovingCat(catId);
        try {
            await courseApi.removeCourseCategory(courseId, catId);
            const newCats = categories.filter((c) => c.id !== catId);
            setCategories(newCats);
            onSaved({ categories: newCats });
        } catch (err: any) { showToast("error", err.message || "Failed to remove category"); }
        finally { setRemovingCat(null); }
    };

    const handleAddTag = async (name: string) => {
        if (tags.length >= MAX_TAGS) { showToast("warning", `Maximum ${MAX_TAGS} tags allowed`); return; }
        if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) { showToast("info", "Tag already added"); return; }
        setAddingTag(true);
        try {
            const res = await courseApi.addCourseTag(courseId, name);
            const newTags = [...tags, res];
            setTags(newTags);
            onSaved({ tags: newTags });
            setTagInput("");
            setTagSuggestions([]);
            showToast("success", `Tag "${name}" added`);
        } catch (err: any) { showToast("error", err.message || "Failed to add tag"); }
        finally { setAddingTag(false); }
    };

    const handleRemoveTag = async (tagId: string) => {
        setRemovingTag(tagId);
        try {
            await courseApi.removeCourseTag(courseId, tagId);
            const newTags = tags.filter((t) => t.id !== tagId);
            setTags(newTags);
            onSaved({ tags: newTags });
        } catch (err: any) { showToast("error", err.message || "Failed to remove tag"); }
        finally { setRemovingTag(null); }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
                <div className="p-2.5 bg-brand-soft text-brand-primary rounded-xl">
                    <FolderTree size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-brand-text">Categories & Tags</h2>
                    <p className="text-sm text-brand-muted mt-0.5">Organize your course for better discoverability.</p>
                </div>
            </div>

            {/* Categories */}
            <div>
                <label className="block text-sm font-medium text-brand-text mb-3">Categories</label>
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {categories.map((cat) => (
                            <span key={cat.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-brand-soft text-teal-700 border border-brand-primary">
                                {cat.name}
                                <button onClick={() => handleRemoveCategory(cat.id)} disabled={removingCat === cat.id} className="p-0.5 hover:bg-teal-100 rounded-full cursor-pointer">
                                    {removingCat === cat.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <div className="border border-brand-border rounded-xl max-h-64 overflow-y-auto bg-white">
                    {loadingTree ? (
                        <div className="flex items-center justify-center py-8"><Loader2 size={20} className="text-brand-primary animate-spin" /></div>
                    ) : categoryTree.length === 0 ? (
                        <p className="text-center text-sm text-brand-muted py-6">No categories available.</p>
                    ) : (
                        categoryTree.map((node) => <CategoryNode key={node.id} node={node} depth={0} onSelect={handleAddCategory} />)
                    )}
                </div>
            </div>

            <div className="border-t border-brand-border" />

            {/* Tags */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-brand-text">Tags</label>
                    <span className="text-xs text-brand-muted">{tags.length}/{MAX_TAGS}</span>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag) => (
                            <span key={tag.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                <Tag size={10} /> {tag.name}
                                <button onClick={() => handleRemoveTag(tag.id)} disabled={removingTag === tag.id} className="p-0.5 hover:bg-blue-100 rounded-full cursor-pointer">
                                    {removingTag === tag.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                {tags.length >= MAX_TAGS ? (
                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">Maximum of {MAX_TAGS} tags reached. Remove a tag to add a new one.</p>
                ) : (
                    <div className="relative">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                                <input
                                    type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); handleAddTag(tagInput.trim()); } }}
                                    placeholder="Search or type a new tag..."
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-0 focus:shadow-sm placeholder:text-brand-muted transition-all hover:border-brand-border shadow-sm"
                                />
                            </div>
                            <button onClick={() => tagInput.trim() && handleAddTag(tagInput.trim())} disabled={addingTag || !tagInput.trim()} className="px-4 py-2.5 rounded-xl border border-brand-border text-sm font-medium text-brand-text hover:bg-brand-bg cursor-pointer disabled:opacity-40">
                                {addingTag ? <Loader2 size={16} className="animate-spin" /> : "Add"}
                            </button>
                        </div>
                        {tagSuggestions.length > 0 && tagInput.trim() && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-brand-border rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                                {tagSuggestions.map((s) => (
                                    <button key={s.id} onClick={() => handleAddTag(s.name)} className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-soft hover:text-brand-primary cursor-pointer">
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
