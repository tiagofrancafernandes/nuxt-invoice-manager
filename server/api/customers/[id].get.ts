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

        const [customer] = await db.query.customers.findMany({
            where: eq(customers.id, customerId),
            limit: 1,
        });

        if (!customer) {
            const error: ApiError = { error: 'Customer not found', code: 'NOT_FOUND' };
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found',
                data: error,
            });
        }

        return customer;
    } catch (err: any) {
        if (err.statusCode) {
            throw err;
        }

        const error: ApiError = { error: 'Failed to fetch customer', code: 'INTERNAL_ERROR' };
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
        });
    }
});
