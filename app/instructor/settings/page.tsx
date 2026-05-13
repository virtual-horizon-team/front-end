import { Settings as SettingsIcon, User, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="pt-12 lg:pt-0">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-brand-text">Settings</h1>
                <p className="text-brand-muted mt-1">Manage your account and preferences.</p>
            </div>

            {/* Settings Sections */}
            <div className="space-y-4">
                {[
                    { icon: User, label: "Profile", desc: "Update your name, bio, and profile picture" },
                    { icon: Bell, label: "Notifications", desc: "Configure email and push notification preferences" },
                    { icon: Shield, label: "Security", desc: "Change password and manage two-factor authentication" },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="bg-white rounded-xl p-6 shadow-sm border border-brand-border flex items-center gap-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    >
                        <div className="p-3 rounded-xl bg-brand-bg">
                            <item.icon size={22} className="text-brand-text" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-brand-text">{item.label}</h3>
                            <p className="text-sm text-brand-muted">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
