"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

interface ProfileHeaderProps {
    isInstructor: boolean;
}

export default function ProfileHeader({ isInstructor }: ProfileHeaderProps) {
    return (
        <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-text">My Profile</h1>
            <p className="text-brand-muted mt-1">Manage your identity, personal details, and account preferences.</p>
        </div>
    );
}
