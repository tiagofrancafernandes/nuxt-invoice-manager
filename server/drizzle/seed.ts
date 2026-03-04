import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import * as bcrypt from 'bcrypt';
import { db } from '../utils/db';

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/invoice_db',
// });
// const db = drizzle(pool, { schema });

async function seed() {
    console.log('Seeding database...');

    // Seed admin
    const existingAdmin = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, 'admin@mail.com'),
    });

    if (!existingAdmin) {
        const admPassword = process.env.NODE_ENV !== 'production' ? 'power@123' : Math.random().toString(36).slice(-8);

        const hashedPassword = await bcrypt.hash(admPassword, 10);
        await db.insert(schema.users).values({
            email: 'admin@mail.com',
            password: hashedPassword,
        });
        console.log('✅ Admin user created');
    } else {
        console.log('ℹ️ Admin user already exists');
    }

    // Check if customers already exist
    const existingCustomers = await db.query.customers.findMany();

    if (existingCustomers.length === 0) {
        const newCustomers = await db
            .insert(schema.customers)
            .values([
                {
                    businessName: 'Acme Corp',
                    nameOnInvoice: 'Acme Corporation',
                    email: 'billing@acme.com',
                    status: 'active',
                },
                { businessName: 'Globex', nameOnInvoice: 'Globex Inc', email: 'finance@globex.com', status: 'standby' },
                {
                    businessName: 'Soylent',
                    nameOnInvoice: 'Soylent Corp',
                    email: 'accounts@soylent.com',
                    status: 'archived',
                },
                { businessName: 'Initech', nameOnInvoice: 'Initech LLC', email: 'pay@initech.com', status: 'inactive' },
                {
                    businessName: 'Umbrella',
                    nameOnInvoice: 'Umbrella Corp',
                    email: 'billing@umbrella.com',
                    status: 'active',
                },
                {
                    businessName: 'Stark Industries',
                    nameOnInvoice: 'Stark Ind.',
                    email: 'tony@stark.com',
                    status: 'active',
                },
                {
                    businessName: 'Wayne Enterprises',
                    nameOnInvoice: 'Wayne Ent.',
                    email: 'bruce@wayne.com',
                    status: 'standby',
                },
                {
                    businessName: 'Cyberdyne',
                    nameOnInvoice: 'Cyberdyne Sys',
                    email: 'billing@cyberdyne.com',
                    status: 'active',
                },
            ])
            .returning();
        console.log('✅ 8 Customers created');

        // Create 6 invoices
        await db.insert(schema.invoices).values([
            {
                customerId: newCustomers[0].id,
                number: 1,
                currency: 'USD',
                status: 'paid',
                items: [{ name: 'Web Dev', quantity: 1, unit_price: 5000 }],
                subtotal: '5000.00',
                total: '5000.00',
            },
            {
                customerId: newCustomers[0].id,
                number: 2,
                currency: 'USD',
                status: 'sent',
                items: [{ name: 'Maintenance', quantity: 1, unit_price: 1000 }],
                subtotal: '1000.00',
                total: '1000.00',
            },
            {
                customerId: newCustomers[1].id,
                number: 1,
                currency: 'EUR',
                status: 'draft',
                items: [{ name: 'Consulting', quantity: 10, unit_price: 150 }],
                subtotal: '1500.00',
                total: '1500.00',
            },
            {
                customerId: newCustomers[4].id,
                number: 1,
                currency: 'CAD',
                status: 'overdue',
                items: [{ name: 'SEO', quantity: 1, unit_price: 2000 }],
                subtotal: '2000.00',
                total: '2000.00',
            },
            {
                customerId: newCustomers[5].id,
                number: 1,
                currency: 'USD',
                status: 'paid',
                items: [{ name: 'Armor Upgrade', quantity: 2, unit_price: 15000 }],
                subtotal: '30000.00',
                total: '30000.00',
            },
            {
                customerId: newCustomers[7].id,
                number: 1,
                currency: 'BRL',
                status: 'cancelled',
                items: [{ name: 'AI Module', quantity: 1, unit_price: 100000 }],
                subtotal: '100000.00',
                total: '100000.00',
            },
        ]);
        console.log('✅ 6 Invoices created');
    } else {
        console.log('ℹ️ Demo data already exists');
    }

    console.log('Seed completed successfully.');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
