import { db } from '../../utils/db';
import { customers } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import type { ApiError } from '../../../types';

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

        const body = await readBody(event);

        if (!body) {
            const error: ApiError = { error: 'Request body is required', code: 'BAD_REQUEST' };
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: error,
            });
        }

        // Filter keys that belong to typical updates
        const updateData: any = {};
        if (body.businessName !== undefined) updateData.businessName = body.businessName;
        if (body.nameOnInvoice !== undefined) updateData.nameOnInvoice = body.nameOnInvoice;
        if (body.address !== undefined) updateData.address = body.address;
        if (body.code !== undefined) updateData.code = body.code;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.phone !== undefined) updateData.phone = body.phone;

        updateData.updatedAt = new Date();

        if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
            const error: ApiError = { error: 'No fields to update', code: 'BAD_REQUEST' };
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: error,
            });
        }

        const [updatedCustomer] = await db
            .update(customers)
            .set(updateData)
            .where(eq(customers.id, customerId))
            .returning();

        if (!updatedCustomer) {
            const error: ApiError = { error: 'Customer not found', code: 'NOT_FOUND' };
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found',
                data: error,
            });
        }

        return updatedCustomer;
    } catch (err: any) {
        if (err.statusCode) {
            throw err;
        }

        const error: ApiError = { error: 'Failed to update customer', code: 'INTERNAL_ERROR' };
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
        });
    }
});
