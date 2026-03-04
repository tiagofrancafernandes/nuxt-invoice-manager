import { db } from '../../utils/db';
import { invoices, customers } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import type { ApiError, InvoiceItem, InvoiceFee } from '../../../types';

interface CreateInvoiceBody {
    customerId: number;
    number: number;
    currency?: string;
    status?: string;
    items?: InvoiceItem[];
    discountType?: string;
    discountValue?: number;
    fees?: InvoiceFee[];
}

export default defineEventHandler(async (event) => {
    try {
        const body = (await readBody(event)) as CreateInvoiceBody;

        if (!body || !body.customerId || !body.number) {
            const error: ApiError = { error: 'customerId and number are required', code: 'BAD_REQUEST' };
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: error,
            });
        }

        // Validate customer
        const customer = await db.query.customers.findFirst({
            where: eq(customers.id, body.customerId),
        });

        if (!customer) {
            const error: ApiError = { error: 'Customer not found', code: 'NOT_FOUND' };
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found',
                data: error,
            });
        }

        const items: InvoiceItem[] = body.items || [];
        const fees: InvoiceFee[] = body.fees || [];

        // Calculate Subtotal
        let subtotalAmt = 0;
        for (const item of items) {
            subtotalAmt += item.quantity * item.unit_price;
        }

        // Calculate Discount
        let discountAmt = 0;
        if (body.discountType === 'percent' && body.discountValue) {
            discountAmt = subtotalAmt * (body.discountValue / 100);
        } else if (body.discountType === 'fixed' && body.discountValue) {
            discountAmt = body.discountValue;
        }

        // Calculate Fees
        let totalFees = 0;
        for (const fee of fees) {
            totalFees += fee.value;
        }

        const totalAmt = subtotalAmt - discountAmt + totalFees;

        const [newInvoice] = await db
            .insert(invoices)
            .values([
                {
                    customerId: body.customerId,
                    number: body.number,
                    currency: (body.currency as any) || 'USD',
                    status: (body.status as any) || 'draft',
                    items: items,
                    discountType: (body.discountType as any) || null,
                    discountValue: body.discountValue ? String(body.discountValue) : null,
                    discountAmount: String(discountAmt),
                    fees: fees,
                    subtotal: String(subtotalAmt),
                    total: String(totalAmt),
                },
            ])
            .returning();

        return newInvoice;
    } catch (err: any) {
        if (err.statusCode) {
            throw err;
        }

        // Check for unique constraint violation
        if (err.code === '23505') {
            const error: ApiError = { error: 'Invoice number must be unique for this customer', code: 'CONFLICT' };
            throw createError({
                statusCode: 409,
                statusMessage: 'Conflict',
                data: error,
            });
        }

        const error: ApiError = { error: 'Failed to create invoice', code: 'INTERNAL_ERROR' };
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
        });
    }
});
