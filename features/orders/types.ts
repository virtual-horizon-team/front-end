export interface UserOrderItemDto {
    courseId: string | null;
    courseTitle: string | null;
    assetId: string | null;
    assetFileName: string | null;
    priceAtPurchase: number;
    isCourseAvailable: boolean;
    isAssetAvailable: boolean;
}

export interface UserOrderDto {
    id: string;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
    items: UserOrderItemDto[];
}
