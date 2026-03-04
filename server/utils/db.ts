import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../drizzle/schema';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL! || 'postgresql://postgres:postgres@localhost:5432/invoice_db',
});

export const db = drizzle(pool, { schema });
