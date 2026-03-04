# Authentication

Authentication in the system is handled via JWT tokens.

## Endpoints

### Login

Generates a JWT token for consuming API endpoints.

**POST** `/api/auth/login`

**HTTP Example:**

```http
POST http://localhost:3000/api/auth/login
Accept: application/json
Content-Type: application/json

{
  "email": "admin@mail.com",
  "password": "yourpassword"
}
```

**Success Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

### Get Current User

Retrieves information about the currently authenticated user.

**POST** `/api/auth/me`

**HTTP Example:**

```http
POST http://localhost:3000/api/auth/me
Accept: application/json
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}

{
  "with": ["name", "email", "permissions"]
}
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "email": "admin@mail.com",
  "name": "Admin",
  "permissions": ["all"]
}
```
