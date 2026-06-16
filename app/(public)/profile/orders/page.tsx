"use client";

import React, { useEffect, useState } from "react";
import ProfileHeader from "@/features/profile/components/ProfileHeader";
import OrdersList from "@/features/orders/components/OrdersList";
import { ordersApi } from "@/features/orders/lib/orders-api";
import { profileApi } from "@/features/instructor/lib/profile-api";
import { UserOrderDto } from "@/features/orders/types";
import { showToast } from "@/features/instructor/components/Toast";

export default function OrdersPage() {
    const [isInstructor, setIsInstructor] = useState<boolean>(false);
    const [orders, setOrders] = useState<UserOrderDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const loadProfile = async () => {
        try {
            const profile = await profileApi.getProfile();
            setIsInstructor(profile?.profileType?.toLowerCase() === "instructor");
        } catch (err) {
            console.error("Failed to load profile", err);
        }
    };

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await ordersApi.getMyOrders();
            // Sort by creation date descending
            const sorted = data.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sorted);
        } catch (err: any) {
            console.error("Failed to load orders", err);
            showToast("error", "Failed to retrieve your order history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
        loadOrders();
    }, []);

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <ProfileHeader isInstructor={isInstructor} />

            <div className="mt-8 space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-brand-text mb-4 font-extrabold">Purchase & Order History</h3>
                    <OrdersList orders={orders} isLoading={loading} />
                </div>
            </div>
        </div>
    );
}
