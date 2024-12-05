## Getting Started

### 1. Clone this template using one of the three ways

1. Use this repository as template

   **Disclosure:** by using this repository as a template, there will be an attribution on your repository.

   I'll appreciate if you do, so this template can be known by others too 😄

   ![Use as template](https://user-images.githubusercontent.com/55318172/129183039-1a61e68d-dd90-4548-9489-7b3ccbb35810.png)

2. Using `create-next-app`

   ```bash
   pnpm create next-app  -e https://github.com/theodorusclarence/ts-nextjs-tailwind-starter ts-pnpm
   ```

   If you still want to use **pages directory** (_is not actively maintained_) you can use this command

   ```bash
   npx create-next-app -e https://github.com/theodorusclarence/ts-nextjs-tailwind-starter/tree/pages-directory project-name
   ```

3. Using `degit`

   ```bash
   npx degit theodorusclarence/ts-nextjs-tailwind-starter YOUR_APP_NAME
   ```

4. Deploy to Vercel

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Ftheodorusclarence%2Fts-nextjs-tailwind-starter)

### 2. Install dependencies

It is encouraged to use **pnpm** so the husky hooks can work properly.

```bash
pnpm install
```

### 3. Run the development server

You can start the server using this command:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `src/pages/index.tsx`.=

# Technical Interview Challenge: Medical Claims Documentation Pipeline

## Overview
You'll be building a critical data pipeline that processes and correlates Medicare documentation requests with patient records and billing information. The system needs to handle various types of incoming Medicare files (pre-payment reviews, post-payment reviews, documentation requests) and match them with the appropriate patient encounters and billing records.

The challenge involves working with our MockMedicareService to build a scalable system that can process hundreds of documentation requests per hour while maintaining data consistency and providing real-time status updates to healthcare providers.

## Requirements

### 1. Background Job Setup (Required)
- Set up a Next.js API route with Vercel Cron to periodically fetch new file notifications
- Create a worker that processes the Medicare file notifications every 15 minutes
- Implement proper error handling and retry mechanisms for failed jobs
- Track job status and maintain an audit log of processing attempts

### 2. Data Transformation (Required)
Transform the Medicare file notifications into a normalized format that correlates patient, claim, and document information:

```typescript
{
  correlationId: string, // Unique identifier for the correlated records
  notification: {
    id: string,
    receivedAt: DateTime,
    type: 'PREPAYMENT' | 'POSTPAYMENT' | 'ADR' | 'AUDIT',
    priority: number,
    status: string
  },
  patient: {
    medicareId: string,
    encounters: Array<{
      dateOfService: DateTime,
      facility: string,
      claimNumber: string
    }>,
    documents: Array<{
      type: string,
      status: string,
      required: boolean,
      receivedDate: DateTime | null
    }>
  },
  appeal: {
    deadline: DateTime,
    denialReason?: string,
    deniedAmount?: number,
    recoveryStatus?: string,
    completeness: {
      hasClinicRecords: boolean,
      hasBillingInfo: boolean,
      missingDocuments: string[]
    }
  },
  metadata: {
    processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'ERROR',
    lastProcessed: DateTime,
    requiresUserAction: boolean,
    userActionDetails?: string
  }
}
```

### 3. API Endpoints (Required)

#### `GET /api/v1/appeals`
List all appeals with pagination and filtering.

**Query Parameters:**
- `page` (integer, default: 1)
- `per_page` (integer, default: 20)
- `status` (string, optional: 'PENDING', 'PROCESSING', 'COMPLETE', 'ERROR')
- `type` (string, optional: 'PREPAYMENT', 'POSTPAYMENT', 'ADR', 'AUDIT')
- `requires_action` (boolean, optional)
- `sort_by` (string, optional: 'deadline', 'receivedAt', 'deniedAmount')
- `sort_direction` (string, optional: 'asc', 'desc')

**Response:**
```json
{
  "data": [
    {
      "correlationId": "CORR-123",
      "notification": {
        "id": "NOTIF-123",
        "receivedAt": "2024-03-15T14:30:00Z",
        "type": "PREPAYMENT",
        "priority": 3,
        "status": "PENDING"
      },
      "patient": {
        "medicareId": "MBI123456789",
        "encounters": [
          {
            "dateOfService": "2024-02-15T00:00:00Z",
            "facility": "FACILITY-123",
            "claimNumber": "CLM123456789"
          }
        ]
      },
      "appeal": {
        "deadline": "2024-04-15T14:30:00Z",
        "deniedAmount": 1500.00,
        "completeness": {
          "hasClinicRecords": true,
          "hasBillingInfo": false,
          "missingDocuments": ["OPERATIVE_REPORT"]
        }
      },
      "metadata": {
        "processingStatus": "PENDING",
        "lastProcessed": "2024-03-15T14:35:00Z",
        "requiresUserAction": true,
        "userActionDetails": "Missing billing information"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 100,
    "per_page": 20
  }
}
```

[Additional API endpoint specifications...]

### 4. Database Schema (Required)
- Design and implement the necessary database schema for storing correlated records
- Include appropriate indexes for efficient querying
- Implement proper relationships between notification, patient, and appeal records

### 5. Front-end Components (Bonus)
- Create a React component to display the appeals dashboard
- Implement filtering and sorting controls
- Add a detailed view modal showing all correlated information
- Include visualizations for appeal deadlines and completion status

## Evaluation Criteria
We'll evaluate your submission based on:
- Data correlation and transformation logic
- Background job implementation and error handling
- API design and implementation
- Database schema design
- Code organization and quality
- Test coverage
- Documentation

## Getting Started
1. The mock Medicare service is available in the provided code
2. Use the service by calling:
```typescript
const medicareService = new MockMedicareService();
const notifications = await medicareService.getFileNotificationBatch();
```

## Tips
- Focus on the core requirements first
- Consider edge cases in data correlation
- Document your assumptions about matching logic
- Include error handling for incomplete or invalid data
- Optimize database queries for performance

## Submission
- Create a new branch for your work
- Submit a pull request with your implementation
- Include documentation explaining your design decisions
- Add tests for your correlation logic

This challenge tests your ability to build a robust data pipeline while handling the complexities of healthcare data correlation and processing.