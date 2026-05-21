import {
    UserCheck,
    BookOpen,
    FolderTree,
    Layers,
    Users,
    Percent,
    ShieldAlert,
    HelpCircle,
    Settings,
    FileText,
    Activity,
    type LucideIcon,
} from "lucide-react";

export interface NavItem {
    label: string;
    href?: string;
    icon: LucideIcon;
    isComingSoon?: boolean;
}

export interface NavSection {
    title: string;
    items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
    {
        title: "Requests & Admissions",
        items: [
            { label: "Instructor Requests", href: "/admin/instructor-requests", icon: UserCheck },
            { label: "Identity Verification", icon: ShieldAlert, isComingSoon: true },
            { label: "Refund Disputes", icon: HelpCircle, isComingSoon: true },
        ]
    },
    {
        title: "Courses & Curriculums",
        items: [
            { label: "Course Reviews", href: "/admin/course-reviews", icon: BookOpen },
            { label: "Categories", href: "/admin/categories", icon: FolderTree },
            { label: "Promotion Coupons", icon: Percent, isComingSoon: true },
        ]
    },
    {
        title: "User Management",
        items: [
            { label: "Student Directory", icon: Users, isComingSoon: true },
            { label: "Instructor Roster", icon: UserCheck, isComingSoon: true },
        ]
    },
    {
        title: "System Config",
        items: [
            { label: "App Versions", href: "/admin/app-versions", icon: Layers },
            { label: "System Health", icon: Activity, isComingSoon: true },
            { label: "Global Settings", icon: Settings, isComingSoon: true },
        ]
    }
];
