# Invoicing API Documentation

Welcome to the documentation for the Invoicing API. This backend provides endpoints for managing authentication, customers, and invoices.

## Index

- [Authentication](./auth.md)
  - Login & Token generation
- [Customers](./customers.md)
  - Create, Read, Update, and List customers
- [Invoices](./invoices.md)
  - Create, Read, Update, and List invoices

## General Rules

### Authentication

All endpoints under `/api/` (except `/api/auth/login`) require a valid Bearer token.
Pass the token in the `Authorization` header:

```http
Authorization: Bearer <your-jwt-token>
```

### Error Responses

The API returns structured error responses on failure. Always expect an object with the following format when the HTTP status code is 400 or above:

```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE"
}
```

### HTTP Examples

Documentation pages include `.http` request examples that can be used with VS Code "REST Client" or similar tools. Use the `{{AUTH_TOKEN}}` variable to authenticate your requests after logging in.
