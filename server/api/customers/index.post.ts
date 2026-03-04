import { db } from '@@/server/utils/db';
import { customers } from '@@/server/drizzle/schema';
import type { ApiError } from '@@/types';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        if (!body || !body.businessName) {
            const error: ApiError = { error: 'businessName is required', code: 'BAD_REQUEST' };
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: error,
            });
        }

        const [newCustomer] = await db
            .insert(customers)
            .values({
                businessName: body.businessName,
                nameOnInvoice: body.nameOnInvoice || null,
                address: body.address || null,
                code: body.code || null,
                status: body.status || 'active',
                email: body.email || null,
                phone: body.phone || null,
            })
            .returning();

        return newCustomer;
    } catch (err: any) {
        if (err.statusCode) {
            throw err;
        }

        const error: ApiError = { error: 'Failed to create customer', code: 'INTERNAL_ERROR' };
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
        });
    }
});
