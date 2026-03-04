import { extractTokenFromHeader, verifyToken } from '@@/server/utils/auth';
import type { ApiError } from '@@/types';

export default defineEventHandler((event) => {
    const url = getRequestURL(event);

    // Skip middleware for non-API routes, login path, or OPTIONS requests (preflight)
    if (!url.pathname.startsWith('/api/') || url.pathname === '/api/auth/login' || event.method === 'OPTIONS') {
        return;
    }

    const authHeader = getHeader(event, 'authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
        const error: ApiError = { error: 'Missing or invalid token format', code: 'UNAUTHORIZED' };
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            data: error,
        });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        const error: ApiError = { error: 'Invalid or expired token', code: 'UNAUTHORIZED' };
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            data: error,
        });
    }

    event.context.user = decoded;
});
