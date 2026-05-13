import {
    LayoutDashboard,
    Upload,
    BookOpen,
    ClipboardList,
    Glasses,
    Settings,
    HelpCircle,
    LogOut,
    type LucideIcon,
} from "lucide-react";

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/instructor/dashboard", icon: LayoutDashboard },
    { label: "Media Hub", href: "/instructor/media-hub", icon: Upload },
    { label: "Courses", href: "/instructor/courses", icon: BookOpen },
    { label: "Assessments", href: "/instructor/assessments", icon: ClipboardList },
    { label: "VR Scenarios", href: "/instructor/vr-scenarios", icon: Glasses },
    { label: "Settings", href: "/instructor/settings", icon: Settings },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
    { label: "Help & Support", href: "/instructor/help", icon: HelpCircle },
];
