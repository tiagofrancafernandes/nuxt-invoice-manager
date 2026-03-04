import { db } from '@@/server/utils/db';
import { invoices, customers } from '@@/server/drizzle/schema';
import { eq } from 'drizzle-orm';
import type { ApiError, InvoiceItem, InvoiceFee } from '@@/types';

interface UpdateInvoiceBody {
    status?: string;
    currency?: string;
    items?: InvoiceItem[];
    discountType?: string;
    discountValue?: number | string;
    fees?: InvoiceFee[];
}

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

        const body = (await readBody(event)) as UpdateInvoiceBody;

        if (!body) {
            const error: ApiError = { error: 'Request body is required', code: 'BAD_REQUEST' };
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: error,
            });
        }

        // Get existing invoice to check if we need to recalculate totals
        const [existingInvoice] = await db.query.invoices.findMany({
            where: eq(invoices.id, invoiceId),
            limit: 1,
        });

        if (!existingInvoice) {
            const error: ApiError = { error: 'Invoice not found', code: 'NOT_FOUND' };
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found',
                data: error,
            });
        }

        const updateData: any = {};
        let needsRecalculation = false;

        if (body.status !== undefined) updateData.status = body.status;
        if (body.currency !== undefined) updateData.currency = body.currency;

        if (body.items !== undefined) {
            updateData.items = body.items;
            needsRecalculation = true;
        }

        if (body.discountType !== undefined) {
            updateData.discountType = body.discountType;
            needsRecalculation = true;
        }

        if (body.discountValue !== undefined) {
            updateData.discountValue = body.discountValue ? String(body.discountValue) : null;
            needsRecalculation = true;
        }

        if (body.fees !== undefined) {
            updateData.fees = body.fees;
            needsRecalculation = true;
        }

        if (needsRecalculation) {
            const items: InvoiceItem[] = body.items !== undefined ? body.items : existingInvoice.items;
            const fees: InvoiceFee[] = body.fees !== undefined ? body.fees : existingInvoice.fees;
            const discountType = body.discountType !== undefined ? body.discountType : existingInvoice.discountType;
            const discountValue =
                body.discountValue !== undefined
                    ? Number(body.discountValue)
                    : existingInvoice.discountValue
                      ? Number(existingInvoice.discountValue)
                      : 0;

            // Calculate Subtotal
            let subtotalAmt = 0;
            for (const item of items) {
                subtotalAmt += item.quantity * item.unit_price;
            }

            // Calculate Discount
            let discountAmt = 0;
            if (discountType === 'percent' && discountValue) {
                discountAmt = subtotalAmt * (discountValue / 100);
            } else if (discountType === 'fixed' && discountValue) {
                discountAmt = discountValue;
            }

            // Calculate Fees
            let totalFees = 0;
            for (const fee of fees) {
                totalFees += fee.value;
            }

            const totalAmt = subtotalAmt - discountAmt + totalFees;

            updateData.subtotal = String(subtotalAmt);
            updateData.discountAmount = String(discountAmt);
            updateData.total = String(totalAmt);
        }

        updateData.updatedAt = new Date();

        if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
            const error: ApiError = { error: 'No fields to update', code: 'BAD_REQUEST' };
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: error,
            });
        }

        const [updatedInvoice] = await db
            .update(invoices)
            .set(updateData)
            .where(eq(invoices.id, invoiceId))
            .returning();

        return updatedInvoice;
    } catch (err: any) {
        if (err.statusCode) {
            throw err;
        }

        const error: ApiError = { error: 'Failed to update invoice', code: 'INTERNAL_ERROR' };
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
        });
    }
});
