import { db } from '../../utils/db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import type { ApiError } from '../../../types';

export default defineEventHandler(async (event) => {
    try {
        const userPayload = event.context.user;

        if (!userPayload || !userPayload.id) {
            const error: ApiError = { error: 'Unauthorized', code: 'UNAUTHORIZED' };
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized',
                data: error,
            });
        }

        const body = await readBody(event);
        const requestedFields = body?.with || [];

        const userRecord = await db.query.users.findFirst({
            where: eq(users.id, userPayload.id),
        });

        if (!userRecord) {
            const error: ApiError = { error: 'User not found', code: 'NOT_FOUND' };
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found',
                data: error,
            });
        }

        // Return the user with requested fields
        // Mocking name and permissions since they are not in the db schema yet
        const response: any = {
            id: userRecord.id,
        };

        if (requestedFields.includes('email')) {
            response.email = userRecord.email;
        }

        if (requestedFields.includes('name')) {
            response.name = 'Admin'; // Mock
        }

        if (requestedFields.includes('permissions')) {
            response.permissions = ['all']; // Mock
        }

        return response;
    } catch (err: any) {
        if (err.statusCode) {
            throw err;
        }

        const error: ApiError = { error: 'Internal server error', code: 'INTERNAL_ERROR' };
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
        });
    }
});
