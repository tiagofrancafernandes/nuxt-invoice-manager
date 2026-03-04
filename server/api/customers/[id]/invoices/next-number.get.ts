import { db } from '../../../utils/db';
import { invoices } from '../../../drizzle/schema';
import { eq, max } from 'drizzle-orm';
import type { ApiError } from '../../../../types';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        if (!id) {
            const error: ApiError = { error: 'Customer ID is required', code: 'BAD_REQUEST' };
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: error,
            });
        }

        const customerId = parseInt(id, 10);

        if (isNaN(customerId)) {
            const error: ApiError = { error: 'Invalid Customer ID', code: 'BAD_REQUEST' };
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: error,
            });
        }

        const maxResult = await db
            .select({ maxValue: max(invoices.number) })
            .from(invoices)
            .where(eq(invoices.customerId, customerId));

        const maxNumber = maxResult[0]?.maxValue;

        const nextNumber = maxNumber ? maxNumber + 1 : 1;

        return { next_number: nextNumber };
    } catch (err: any) {
        if (err.statusCode) {
            throw err;
        }

        const error: ApiError = { error: 'Failed to compute next invoice number', code: 'INTERNAL_ERROR' };
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
        });
    }
});
