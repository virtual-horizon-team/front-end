import OrdersPageClient from "./orders-client";

export const metadata = {
  title: "My Orders | Virtual Horizon Marketplace",
  description: "View your purchase history and order details."
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
