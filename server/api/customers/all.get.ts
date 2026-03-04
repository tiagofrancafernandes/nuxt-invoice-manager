import { db } from '../../utils/db';
import { customers } from '../../drizzle/schema';
import { asc, count, eq } from 'drizzle-orm';
import type { ApiError } from '../../../types';

export default defineEventHandler(async (event) => {
    try {
        const items = await db
            .select({
                id: customers.id,
                businessName: customers.businessName,
            })
            .from(customers)
            .orderBy(asc(customers.businessName));

        return items;
    } catch (err: any) {
        if (err.statusCode) {
            throw err;
        }

        const error: ApiError = { error: 'Failed to fetch customers', code: 'INTERNAL_ERROR' };
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
        });
    }
});
