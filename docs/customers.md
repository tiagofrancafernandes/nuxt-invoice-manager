# Customers API

Manage customer records. The customers table contains the following notable columns:
- `businessName`: the primary name of the company
- `status`: one of 'active', 'standby', 'archived', 'inactive'

## Endpoints

### List Customers (Paginated)

Retrieves a paginated list of customers.

**GET** `/api/customers`

**HTTP Example:**

```http
GET http://localhost:3000/api/customers?page=1&per_page=10&search=Acme
Accept: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "businessName": "Acme Corp",
      "status": "active",
      ...
    }
  ],
  "total": 50,
  "page": 1,
  "per_page": 10
}
```

### List All Customers (Short)

Returns an unpaginated list of all customers, primarily for use in dropdowns.

**GET** `/api/customers/all`

**HTTP Example:**

```http
GET http://localhost:3000/api/customers/all
Accept: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Response:**
```json
[
  {
    "id": 1,
    "businessName": "Acme Corp"
  }
]
```

### Get Customer

Retrieve a single customer.

**GET** `/api/customers/:id`

**HTTP Example:**

```http
GET http://localhost:3000/api/customers/1
Accept: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Response:**
```json
{
  "id": 1,
  "businessName": "Acme Corp",
  ...
}
```

### Create Customer

Creates a new customer.

**POST** `/api/customers`

**HTTP Example:**

```http
POST http://localhost:3000/api/customers
Accept: application/json
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}

{
  "businessName": "New Corp",
  "nameOnInvoice": "New Corp Ltd",
  "status": "active",
  "email": "contact@newcorp.com"
}
```

**Response:**
```json
{
  "id": 9,
  "businessName": "New Corp",
  ...
}
```

### Update Customer

Updates an existing customer.

**PUT** `/api/customers/:id`

**HTTP Example:**

```http
PUT http://localhost:3000/api/customers/1
Accept: application/json
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}

{
  "status": "standby",
  "phone": "555-1234"
}
```

**Response:**
```json
{
  "id": 1,
  "status": "standby",
  ...
}
```

### Get Next Invoice Number

Returns the next sequential invoice number for this customer.

**GET** `/api/customers/:id/invoices/next-number`

**HTTP Example:**

```http
GET http://localhost:3000/api/customers/1/invoices/next-number
Accept: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Response:**
```json
{
  "next_number": 5
}
```
