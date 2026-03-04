import {
    pgTable,
    serial,
    varchar,
    text,
    timestamp,
    pgEnum,
    jsonb,
    numeric,
    integer,
    unique,
} from 'drizzle-orm/pg-core';
import type { InvoiceItem, InvoiceFee } from '../../types';

// Enums
export const customerStatusEnum = pgEnum('customer_status', ['active', 'standby', 'archived', 'inactive']);

export const invoiceCurrencyEnum = pgEnum('invoice_currency', ['USD', 'CAD', 'EUR', 'BRL']);

export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'paid', 'overdue', 'cancelled']);

export const discountTypeEnum = pgEnum('discount_type', ['percent', 'fixed']);

// Tables
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customers = pgTable('customers', {
    id: serial('id').primaryKey(),
    businessName: varchar('business_name', { length: 255 }).notNull(),
    nameOnInvoice: varchar('name_on_invoice', { length: 255 }),
    address: text('address'),
    code: varchar('code', { length: 50 }),
    status: customerStatusEnum('status').default('active').notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoices = pgTable(
    'invoices',
    {
        id: serial('id').primaryKey(),
        customerId: integer('customer_id')
            .notNull()
            .references(() => customers.id, { onDelete: 'restrict' }),
        number: integer('number').notNull(),
        currency: invoiceCurrencyEnum('currency').default('USD').notNull(),
        status: invoiceStatusEnum('status').default('draft').notNull(),
        items: jsonb('items').$type<InvoiceItem[]>().default([]).notNull(),
        discountType: discountTypeEnum('discount_type'),
        discountValue: numeric('discount_value', { precision: 10, scale: 2 }),
        discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }),
        fees: jsonb('fees').$type<InvoiceFee[]>().default([]).notNull(),
        subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
        total: numeric('total', { precision: 10, scale: 2 }).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => ({
        unqInvoiceNumberPerCustomer: unique('unq_invoice_number_per_customer').on(table.customerId, table.number),
    })
);
