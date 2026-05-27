import { api } from "@/features/auth/lib/api-client";
import { CheckoutResponse, StripeCheckoutRequest } from "../types/checkout";

export const initiateCheckout = async (request: StripeCheckoutRequest): Promise<CheckoutResponse> => {
  return await api<CheckoutResponse>("/api/checkout", {
    method: "POST",
    body: JSON.stringify(request),
  });
};
