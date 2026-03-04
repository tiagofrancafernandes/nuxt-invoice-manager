import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './server/drizzle/migrations',
    schema: './server/drizzle/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL! || 'postgresql://postgres:postgres@localhost:5432/invoice_db',
    },
});
