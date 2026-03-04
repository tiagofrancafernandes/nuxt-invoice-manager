# Invoices API

Manage customer invoices with automatic calculations for subtotals, discounts, and totals.

## Endpoints

### List Invoices (Paginated)

Retrieves a paginated list of invoices.

**GET** `/api/invoices`

**HTTP Example:**

```http
GET http://localhost:3000/api/invoices?page=1&per_page=10&status=sent
Accept: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "number": 1,
      "customer_id": 1,
      "currency": "USD",
      "status": "draft",
      "subtotal": "1000.00",
      "total": "1000.00",
      ...
    }
  ],
  "total": 20,
  "page": 1,
  "per_page": 10
}
```

### Get Invoice

Retrieve a single invoice and its items. Can join with the customer name.

**GET** `/api/invoices/:id`

**HTTP Example:**

```http
GET http://localhost:3000/api/invoices/1
Accept: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Response:**
```json
{
  "id": 1,
  "customer": {
    "id": 1,
    "businessName": "Acme Corp"
  },
  "number": 1,
  "currency": "USD",
  "status": "draft",
  "items": [...],
  ...
}
```

### Create Invoice

Creates a new invoice for a customer. The backend automatically calculates `discount_amount`, `subtotal`, and `total`.

**POST** `/api/invoices`

**HTTP Example:**

```http
POST http://localhost:3000/api/invoices
Accept: application/json
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}

{
  "customerId": 1,
  "number": 2,
  "currency": "USD",
  "status": "draft",
  "items": [
    {
      "name": "Service A",
      "quantity": 2,
      "unit_price": 500
    }
  ],
  "discountType": "percent",
  "discountValue": 10,
  "fees": []
}
```

**Response:**
```json
{
  "id": 7,
  "number": 2,
  "total": "900.00",
  ...
}
```

### Update Invoice

Updates an invoice, recalculating totals automatically on save.

**PUT** `/api/invoices/:id`

**HTTP Example:**

```http
PUT http://localhost:3000/api/invoices/1
Accept: application/json
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}

{
  "status": "sent",
  "items": [
    {
      "name": "Service A",
      "quantity": 3,
      "unit_price": 500
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "status": "sent",
  "total": "1500.00",
  ...
}
```
