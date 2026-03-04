import { db } from '@@/server/utils/db';
import { invoices, customers } from '@@/server/drizzle/schema';
import { asc, desc, eq, and, or, sql, count } from 'drizzle-orm';
import type { PaginatedResponse, ApiError } from '@@/types';

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const search = (query.search as string) || '';
        const status = query.status as string;
        const currency = query.currency as string;
        const customerIdRaw = query.customer_id as string;

        let customerId: number | undefined;
        if (customerIdRaw && !isNaN(parseInt(customerIdRaw, 10))) {
            customerId = parseInt(customerIdRaw, 10);
        }

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

        // Base query conditions
        const conditions = [];

        if (status) {
            conditions.push(eq(invoices.status, status as any));
        }

        if (currency) {
            conditions.push(eq(invoices.currency, currency as any));
        }

        if (customerId) {
            conditions.push(eq(invoices.customerId, customerId));
        }

        // We filter combining invoices and customers
        const searchCondition = search
            ? or(
                  sql`${invoices.number}::text LIKE ${`%${search}%`}`,
                  sql`${customers.businessName} ILIKE ${`%${search}%`}`
              )
            : undefined;

        if (searchCondition) {
            conditions.push(searchCondition);
        }

        const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

        let sortColumn;
        switch (sort) {
            case 'number':
                sortColumn = invoices.number;
                break;
            case 'status':
                sortColumn = invoices.status;
                break;
            case 'total':
                sortColumn = invoices.total;
                break;
            case 'createdAt':
                sortColumn = invoices.createdAt;
                break;
            default:
                sortColumn = invoices.createdAt;
        }

        const sortOrder = dir === 'asc' ? asc(sortColumn) : desc(sortColumn);
        const offset = (page - 1) * perPage;

        const items = await db
            .select({
                id: invoices.id,
                number: invoices.number,
                customerId: invoices.customerId,
                currency: invoices.currency,
                status: invoices.status,
                subtotal: invoices.subtotal,
                total: invoices.total,
                createdAt: invoices.createdAt,
                customerName: customers.businessName,
            })
            .from(invoices)
            .leftJoin(customers, eq(invoices.customerId, customers.id))
            .where(finalCondition)
            .orderBy(sortOrder)
            .limit(perPage)
            .offset(offset);

        // Count query
        const totalResult = await db
            .select({ value: count() })
            .from(invoices)
            .leftJoin(customers, eq(invoices.customerId, customers.id))
            .where(finalCondition);

        const total = totalResult[0].value;

        const response: PaginatedResponse<(typeof items)[0]> = {
            data: items,
            total,
            page,
            per_page: perPage,
        };

        return response;
    } catch (err: any) {
        if (err.statusCode) {
            throw err;
        }

        const error: ApiError = { error: 'Failed to fetch invoices', code: 'INTERNAL_ERROR' };
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
        });
    }
});
