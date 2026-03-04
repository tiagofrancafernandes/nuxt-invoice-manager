export type CustomerStatus = 'active' | 'standby' | 'archived' | 'inactive';

export type InvoiceCurrency = 'USD' | 'CAD' | 'EUR' | 'BRL';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type DiscountType = 'percent' | 'fixed';

export interface InvoiceItem {
    name: string;
    quantity: number;
    unit_price: number;
}

export interface InvoiceFee {
    name: string;
    value: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
}

export interface ApiError {
    error: string;
    code?: string;
}
