import { api } from "@/features/auth/lib/api-client";
import { UserOrderDto } from "../types";

export const ordersApi = {
    getMyOrders: () => {
        return api<UserOrderDto[]>("/api/Order/my-orders");
    }
};
