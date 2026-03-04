import jwt from 'jsonwebtoken';

const getSecret = (): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    return secret;
};

export const signToken = (payload: object, expiresIn: string | number = '1d'): string => {
    const secret = getSecret();

    return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string): string | jwt.JwtPayload | null => {
    try {
        const secret = getSecret();

        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return null;
    }

    if (parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1] || null;
};
