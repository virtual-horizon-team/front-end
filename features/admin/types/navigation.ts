import {
    LayoutDashboard,
    UserCheck,
    BookOpen,
    FolderTree,
    Layers,
    type LucideIcon,
} from "lucide-react";

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
    { label: "Instructor Requests", href: "/admin/instructor-requests", icon: UserCheck },
    { label: "Course Reviews", href: "/admin/course-reviews", icon: BookOpen },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "App Versions", href: "/admin/app-versions", icon: Layers },
];
