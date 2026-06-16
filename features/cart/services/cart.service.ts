import { api } from "@/features/auth/lib/api-client";
import { CartResponseDto, CartViewResponseDto, CartItemCountDto } from "../types/cart";

export const getCart = async (pageNumber: number = 1, pageSize: number = 12): Promise<CartResponseDto<CartViewResponseDto>> => {
  return await api<CartResponseDto<CartViewResponseDto>>(`/api/cart?pageNumber=${pageNumber}&pageSize=${pageSize}&cartType=Course`);
};

export const addToCart = async (courseId: string): Promise<CartResponseDto> => {
  return await api<CartResponseDto>("/api/cart/add", {
    method: "POST",
    body: JSON.stringify({ courseId }),
  });
};

export const removeFromCart = async (cartItemId: string): Promise<CartResponseDto> => {
  return await api<CartResponseDto>("/api/cart/remove", {
    method: "DELETE",
    body: JSON.stringify({ cartItemId }),
  });
};

export const getCartCount = async (): Promise<CartResponseDto<CartItemCountDto>> => {
  return await api<CartResponseDto<CartItemCountDto>>("/api/cart/count?cartType=Course");
};

export const clearCart = async (): Promise<CartResponseDto> => {
  return await api<CartResponseDto>("/api/cart/clear", {
    method: "DELETE",
  });
};
