import { db } from '../../utils/db';
import { customers } from '../../drizzle/schema';
import { asc, desc, like, or, and, count, eq } from 'drizzle-orm';
import type { PaginatedResponse, ApiError } from '../../../types';

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const search = (query.search as string) || '';
        const status = query.status as string;
        const sort = (query.sort as string) || 'createdAt';
        const dir = (query.dir as string) === 'asc' ? 'asc' : 'desc';

        let page = parseInt(query.page as string, 10);
        if (isNaN(page) || page < 1) {
            page = 1;
        }

        let perPage = parseInt(query.per_page as string, 10);
        if (isNaN(perPage) || perPage < 1) {
            perPage = 10;
        }

        // Build conditions
        const conditions = [];

        if (search) {
            const searchTerm = `%${search}%`;
            conditions.push(or(like(customers.businessName, searchTerm), like(customers.email, searchTerm)));
        }

        if (status) {
            conditions.push(eq(customers.status, status as any));
        }

        const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

        // Determine sort column and direction
        let sortColumn = customers.createdAt;
        switch (sort) {
            case 'businessName':
                sortColumn = customers.businessName as any;
                break;
            case 'status':
                sortColumn = customers.status as any;
                break;
            case 'updatedAt':
                sortColumn = customers.updatedAt as any;
                break;
            default:
                sortColumn = customers.createdAt as any;
        }

        const sortOrder = dir === 'asc' ? asc(sortColumn) : desc(sortColumn);

        const offset = (page - 1) * perPage;

        // Execute queries
        const items = await db
            .select()
            .from(customers)
            .where(finalCondition)
            .orderBy(sortOrder)
            .limit(perPage)
            .offset(offset);

        const totalResult = await db.select({ value: count() }).from(customers).where(finalCondition);

        const total = totalResult[0].value;

        const response: PaginatedResponse<(typeof items)[0]> = {
            data: items,
            total,
            page,
            per_page: perPage,
        };

        return response;
    } catch (err: any) {
        const error: ApiError = { error: 'Failed to fetch customers', code: 'INTERNAL_ERROR' };
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
        });
    }
});
