
export interface OrderItemPayload {
    sellerMedicineId: string;
    quantity: number;
}

export interface PlaceOrderPayload {
    shippingAddress: string;
    items: OrderItemPayload[];
}

export interface ServiceResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
}
export interface UserServiceResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
}

