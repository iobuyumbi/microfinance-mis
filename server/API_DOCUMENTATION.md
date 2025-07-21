# Microfinance MIS API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication (`/auth`)

#### Register User

- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "leader"
  }
  ```

#### Login

- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### Get Current User

- **GET** `/auth/me`
- **Headers:** `Authorization: Bearer <token>`

#### Forgot Password

- **POST** `/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```

#### Reset Password

- **POST** `/auth/reset-password`
- **Body:**
  ```json
  {
    "token": "reset-token",
    "password": "newpassword123"
  }
  ```

### Users (`/users`)

#### Get All Users (Admin/Officer only)

- **GET** `/users`
- **Headers:** `Authorization: Bearer <token>`

#### Get User by ID

- **GET** `/users/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Update User Profile

- **PUT** `/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Updated Name",
    "phone": "+1234567890"
  }
  ```

#### Update User Role/Status (Admin only)

- **PUT** `/users/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "role": "officer",
    "status": "active"
  }
  ```

#### Delete User (Admin only)

- **DELETE** `/users/:id`
- **Headers:** `Authorization: Bearer <token>`

### Groups (`/groups`)

#### Create Group

- **POST** `/groups`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Group Name",
    "members": ["user-id-1", "user-id-2"]
  }
  ```

#### Get All Groups

- **GET** `/groups`
- **Headers:** `Authorization: Bearer <token>`

#### Get Group by ID

- **GET** `/groups/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Update Group

- **PUT** `/groups/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Updated Group Name"
  }
  ```

#### Delete Group

- **DELETE** `/groups/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Add Member to Group

- **POST** `/groups/:id/members`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "userId": "user-id"
  }
  ```

#### Remove Member from Group

- **DELETE** `/groups/:id/members`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "userId": "user-id"
  }
  ```

### Loans (`/loans`)

#### Apply for Loan

- **POST** `/loans`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "borrower": "user-or-group-id",
    "borrowerModel": "User",
    "amountRequested": 10000,
    "interestRate": 10,
    "loanTerm": 12
  }
  ```

#### Get All Loans

- **GET** `/loans`
- **Headers:** `Authorization: Bearer <token>`

#### Get Loan by ID

- **GET** `/loans/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Update Loan

- **PUT** `/loans/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "amountRequested": 15000,
    "interestRate": 12,
    "loanTerm": 18
  }
  ```

#### Approve Loan (Admin/Officer only)

- **PUT** `/loans/:id/approve`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "status": "approved",
    "amountApproved": 10000,
    "repaymentSchedule": [
      {
        "dueDate": "2024-02-01T00:00:00.000Z",
        "amount": 1000
      }
    ]
  }
  ```

#### Delete Loan (Admin/Officer only)

- **DELETE** `/loans/:id`
- **Headers:** `Authorization: Bearer <token>`

### Repayments (`/repayments`)

#### Record Repayment

- **POST** `/repayments`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "loanId": "loan-id",
    "amountPaid": 1000,
    "paymentMethod": "mobile",
    "penalty": 0,
    "remainingBalance": 9000
  }
  ```

#### Get All Repayments

- **GET** `/repayments`
- **Headers:** `Authorization: Bearer <token>`

#### Get Repayment by ID

- **GET** `/repayments/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Get Repayments by Loan

- **GET** `/repayments/loan/:loanId`
- **Headers:** `Authorization: Bearer <token>`

#### Delete Repayment (Admin/Officer only)

- **DELETE** `/repayments/:id`
- **Headers:** `Authorization: Bearer <token>`

### Meetings (`/meetings`)

#### Schedule Meeting

- **POST** `/meetings`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "group": "group-id",
    "date": "2024-01-15T10:00:00.000Z",
    "location": "Community Hall",
    "agenda": "Loan discussion and savings review"
  }
  ```

#### Get All Meetings

- **GET** `/meetings`
- **Headers:** `Authorization: Bearer <token>`

#### Get Meeting by ID

- **GET** `/meetings/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Update Meeting

- **PUT** `/meetings/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "date": "2024-01-16T10:00:00.000Z",
    "location": "New Location",
    "agenda": "Updated agenda"
  }
  ```

#### Mark Attendance

- **POST** `/meetings/:id/attendance`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "userId": "user-id"
  }
  ```

#### Delete Meeting

- **DELETE** `/meetings/:id`
- **Headers:** `Authorization: Bearer <token>`

### Reports (`/reports`) - Admin/Officer only

#### Upcoming Repayments

- **GET** `/reports/upcoming-repayments`
- **Headers:** `Authorization: Bearer <token>`

#### Total Loans Disbursed

- **GET** `/reports/total-loans`
- **Headers:** `Authorization: Bearer <token>`

#### Group Savings Performance

- **GET** `/reports/group-savings`
- **Headers:** `Authorization: Bearer <token>`

#### Active Loan Defaulters

- **GET** `/reports/defaulters`
- **Headers:** `Authorization: Bearer <token>`

#### Financial Summary

- **GET** `/reports/financial-summary?year=2024&month=1`
- **Headers:** `Authorization: Bearer <token>`

### Additional Endpoints

The API also includes endpoints for:

- **Notifications** (`/notifications`)
- **Savings** (`/savings`)
- **Transactions** (`/transactions`)
- **Accounts** (`/accounts`)
- **Account History** (`/account-history`)
- **Guarantors** (`/guarantors`)

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Environment Variables

Make sure to set up your `.env` file with the required variables as documented in `ENV_SETUP.md`.
