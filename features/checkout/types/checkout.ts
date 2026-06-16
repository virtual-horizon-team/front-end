export interface StripeCheckoutRequest {
  success_url: string;      
  cancel_url: string;       
  cart_type?: string;
  customer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;     
    };
  };
}

export interface CheckoutLineItemDto {
  courseId: string;
  orderItemId: string;
  title: string;
  unitPrice: number;
  currency: string | null;
}

export interface CheckoutOrderDto {
  orderId: string;
  totalAmount: number;
  currency: string | null;
  status: 'Pending' | 'Authorized' | 'Paid' | 'Failed' | 'Cancelled';
  items: CheckoutLineItemDto[];
}

export interface CheckoutSessionDto {
  orderId: string;
  gateway: 'Stripe';        
  redirectUrl: string;      
  gatewayPaymentId: string; 
}

export interface CheckoutResponse {
  success: boolean;
  data: {
    order: CheckoutOrderDto;
    session: CheckoutSessionDto;
  };
}
