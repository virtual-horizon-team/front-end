export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'AllLevels';

export interface CartCourseDto {
  id: string;               // courseId (Guid)
  cartItemId: string;       // Guid — used to remove this item
  title: string;
  thumbnailUrl: string | null;
  price: number | null;
  currency: string | null;  // e.g. "USD", "EGP"
  averageRating: number;    // float 0–5
  level: CourseLevel;
  totalLectures: number;
  totalDurationMinutes: number;
  addedAt: string;          // ISO date string
}

export interface CartSummaryDto {
  cartId: string;
  totalPrice: number;
  itemCount: number;
  createdAt: string;
}

export interface CartViewResponseDto {
  summary: CartSummaryDto;
  items: CartCourseDto[];
}

export interface CartResponseDto<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface CartItemCountDto {
  count: number;
}
