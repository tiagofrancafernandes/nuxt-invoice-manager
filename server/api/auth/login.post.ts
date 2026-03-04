import { db } from '@@/server/utils/db';
import { users } from '@@/server/drizzle/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { signToken } from '@@/server/utils/auth';
import type { ApiError } from '@@/types';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        if (!body || !body.email || !body.password) {
            const error: ApiError = { error: 'Email and password are required', code: 'BAD_REQUEST' };
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: error,
            });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, body.email),
        });

        if (!user) {
            const error: ApiError = { error: 'Invalid credentials', code: 'UNAUTHORIZED' };
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized',
                data: error,
            });
        }

        const isValidPassword = await bcrypt.compare(body.password, user.password);

        if (!isValidPassword) {
            const error: ApiError = { error: 'Invalid credentials', code: 'UNAUTHORIZED' };
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized',
                data: error,
            });
        }

        const token = signToken({ id: user.id, email: user.email });

        return { token };
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
