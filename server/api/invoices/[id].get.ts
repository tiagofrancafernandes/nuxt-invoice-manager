import { db } from '@@/server/utils/db';
import { invoices, customers } from '@@/server/drizzle/schema';
import { eq } from 'drizzle-orm';
import type { ApiError } from '@@/types';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        if (!id) {
            const error: ApiError = { error: 'Invoice ID is required', code: 'BAD_REQUEST' };
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: error,
            });
        }

        const invoiceId = parseInt(id, 10);

        if (isNaN(invoiceId)) {
            const error: ApiError = { error: 'Invalid Invoice ID', code: 'BAD_REQUEST' };
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: error,
            });
        }

        const [invoice] = await db
            .select({
                id: invoices.id,
                customerId: invoices.customerId,
                number: invoices.number,
                currency: invoices.currency,
                status: invoices.status,
                items: invoices.items,
                discountType: invoices.discountType,
                discountValue: invoices.discountValue,
                discountAmount: invoices.discountAmount,
                fees: invoices.fees,
                subtotal: invoices.subtotal,
                total: invoices.total,
                createdAt: invoices.createdAt,
                updatedAt: invoices.updatedAt,
                customer: {
                    id: customers.id,
                    businessName: customers.businessName,
                },
            })
            .from(invoices)
            .leftJoin(customers, eq(invoices.customerId, customers.id))
            .where(eq(invoices.id, invoiceId))
            .limit(1);

        if (!invoice) {
            const error: ApiError = { error: 'Invoice not found', code: 'NOT_FOUND' };
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found',
                data: error,
            });
        }

        return invoice;
    } catch (err: any) {
        if (err.statusCode) {
            throw err;
        }

        const error: ApiError = { error: 'Failed to fetch invoice', code: 'INTERNAL_ERROR' };
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
        });
    }
});
