## Getting Started

### 1. Install dependencies

It is encouraged to use **pnpm** so the husky hooks can work properly.

```bash
pnpm install
```

### 2. Run the development server

You can start the server using this command:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `src/pages/index.tsx`.=

# Technical Interview Challenge: Medicare Claims Pipeline

## Overview
In this challenge, you'll build a data pipeline that processes Medicare claim review notifications and correlates them with patient records across multiple systems. This pipeline will be a simplified version of a critical system that helps healthcare providers manage and track their Medicare claims review process efficiently.

The challenge involves working with our MockMedicareService to sync and process file notifications, correlate them with patient data, and provide a unified interface for tracking and managing Medicare reviews and appeals.

## Core Requirement

### 1. Code Context (Read before starting)

The repository comes with several key components already set up:

1. **MockMedicareService**: A service that simulates Medicare's API, providing test data for:
   - File notifications with realistic metadata
   - Patient and claim information
   - Document requirements and status
   - Review and appeal timelines

2. **API Structure**:
   - `/api/v1/jobs/sync`: Webhook endpoint for processing Medicare notifications
   - `/api/v1/reviews`: Endpoint for listing and filtering reviews (to be implemented)
   - `/api/v1/analytics`: Endpoint for aggregated statistics (to be implemented)

3. **Project Setup**:
   - Next.js 13+ with App Router
   - TypeScript for type safety
   - Tailwind CSS for styling
   - shadcn/ui component library
   - Prisma ORM (needs schema implementation)

Your task is to implement the data pipeline, starting with the database schema design and notification processing logic. The MockMedicareService will provide the test data you need to develop and validate your implementation.

### 2. Data Transformation (Required)
Transform the raw Medicare notification data into the following unified format:

```typescript
{
  notificationId: string,
  correlationInfo: {
    patientId: string,           // Derived from Medicare ID
    claimNumber: string,         // Original claim number
    facilityId: string,          // NPI number
    reviewType: string,          // Categorized from fileType
    priority: number             // 1-5 scale
  },
  status: {
    currentState: string,        // Current review status
    isComplete: boolean,         // Derived from status
    missingDocuments: string[],  // List of required but missing documents
    riskScore: number           // Calculated risk score (explained below)
  },
  timeline: {
    receivedAt: DateTime,        // When notification was received
    dueDate: DateTime,          // Review due date
    lastUpdated: DateTime,       // Last status change
    appealDeadline: DateTime     // If denied, deadline for appeal
  },
  financials: {
    amountInDispute: number,     // Amount being reviewed/denied
    recoveryLikelihood: number   // Calculated recovery score
  },
  documents: {
    required: Document[],        // List of required documents
    received: Document[],        // List of received documents
    missing: Document[]          // List of missing documents
  }
}
```

#### Risk Score Algorithm

The risk score (0-100) combines multiple factors to help prioritize reviews:

1. **Deadline Proximity (40% of score)**
- Calculate hours until deadline
- If < 24 hours: score = 100
- If > 168 hours (1 week): score = 0
- Otherwise: `score = ((168 - hours_until_deadline) / 168) * 100`

2. **Documentation Completeness (35% of score)**
- Calculate percentage of required documents received
- If all documents received: score = 0
- If no documents received: score = 100
- Otherwise: `score = (1 - (received_docs / required_docs)) * 100`

3. **Amount at Risk (25% of score)**
- If amount > $50,000: score = 100
- If amount < $1,000: score = 0
- Otherwise: `score = (amount - 1000) / (50000 - 1000) * 100`

Final score = `(deadline_score * 0.4) + (docs_score * 0.35) + (amount_score * 0.25)`

### 3. API Endpoints (Required)

#### `GET /api/v1/reviews`
List Medicare review notifications with filtering and pagination.

**Query Parameters:**
- `page` (integer, default: 1)
- `per_page` (integer, default: 20)
- `status` (string, optional)
- `review_type` (string, optional)
- `risk_threshold` (number, optional)
- `sort_by` (string, optional: 'risk_score', 'due_date', 'amount')
- `sort_direction` (string, optional: 'asc', 'desc')

**Response:**
```json
{
  "data": [{
    "notificationId": "NOTIF-123",
    "correlationInfo": {
      "patientId": "MBI123456789",
      "claimNumber": "CLM123456789",
      "facilityId": "1234567890",
      "reviewType": "PREPAYMENT_REVIEW",
      "priority": 4
    },
    "status": {
      "currentState": "DOCUMENTATION_REQUESTED",
      "isComplete": false,
      "missingDocuments": ["PROGRESS_NOTE", "OPERATIVE_REPORT"],
      "riskScore": 85
    },
    "timeline": {
      "receivedAt": "2024-03-15T14:30:00Z",
      "dueDate": "2024-03-18T14:30:00Z",
      "lastUpdated": "2024-03-15T14:35:00Z",
      "appealDeadline": "2024-04-15T14:30:00Z"
    },
    "financials": {
      "amountInDispute": 25000,
      "recoveryLikelihood": 0.75
    }
  }],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "per_page": 20
  }
}
```

#### `GET /api/v1/reviews/:id`
Get detailed information about a specific review.

**Response:**
```json
{
  "data": {
    // Same structure as above plus:
    "documents": {
      "required": [{
        "type": "PROGRESS_NOTE",
        "status": "PENDING",
        "dueDate": "2024-03-18T14:30:00Z"
      }],
      "received": [{
        "type": "DISCHARGE_SUMMARY",
        "receivedAt": "2024-03-15T15:30:00Z",
        "status": "ACCEPTED"
      }],
      "missing": [{
        "type": "OPERATIVE_REPORT",
        "requestedAt": "2024-03-15T14:30:00Z",
        "daysOverdue": 2
      }]
    },
    "auditTrail": [{
      "timestamp": "2024-03-15T14:30:00Z",
      "action": "NOTIFICATION_RECEIVED",
      "details": "Initial notification received from Medicare"
    }]
  }
}
```

#### `GET /api/v1/analytics`
Get aggregated review statistics and trends.

**Query Parameters:**
- `time_range` (string, optional: 'day', 'week', 'month', default: 'day')
- `facility_id` (string, optional)

**Response:**
```json
{
  "data": {
    "overview": {
      "total_reviews": 1500,
      "total_amount_at_risk": 2500000,
      "average_processing_time": 72,
      "completion_rate": 0.85
    },
    "risk_distribution": {
      "high_risk": 150,
      "medium_risk": 450,
      "low_risk": 900
    },
    "review_types": {
      "PREPAYMENT_REVIEW": 500,
      "POSTPAYMENT_REVIEW": 600,
      "AUDIT_REQUEST": 400
    },
    "timeline_metrics": {
      "average_time_to_first_response": 24,
      "average_time_to_completion": 72,
      "overdue_reviews": 45
    },
    "document_statistics": {
      "most_requested": [
        {"type": "PROGRESS_NOTE", "count": 450},
        {"type": "OPERATIVE_REPORT", "count": 380}
      ],
      "average_completion_time": 48
    }
  },
  "meta": {
    "time_range": "day",
    "generated_at": "2024-03-15T15:00:00Z"
  }
}
```

### 4. Front-end Components (Required)

Create the following React components using shadcn/ui and Tailwind CSS:

1. Review Dashboard
- Implement a data table showing reviews with:
  - Risk score visualization (color-coded)
  - Deadline countdown
  - Missing document indicators
  - Status badges
- Add filtering and sorting capabilities
- Include a summary statistics header

2. Review Detail View
- Create a detailed view showing all review information
- Add a timeline visualization using audit trail data
- Show document status with upload/download capabilities
- Display risk factors and calculations

3. Analytics Dashboard
- Create visualizations for:
  - Risk score distribution
  - Review type breakdown
  - Timeline metrics
  - Document completion rates
- Implement time range selection
- Add facility filtering

## Getting Started

1. The MockMedicareService is available at:
```typescript
import { MockMedicareService } from '@/lib/services/mock-medicare-service'
```

2. Use the service by calling:
```typescript
const service = new MockMedicareService()
const notifications = await service.getFileNotificationBatch()
```

## Evaluation Criteria
We'll evaluate your submission based on:
- Data pipeline architecture and reliability
- Transformation logic and error handling
- API design and implementation
- Frontend component design and user experience
- Code organization and quality
- Performance considerations and optimizations
- Test coverage

## Submission
- Create a new branch for your work
- Submit a pull request with your implementation
- Include documentation explaining your design decisions
- Add tests for core functionality

## Tips
- Focus on implementing the core data pipeline first
- Consider edge cases in the correlation logic
- Document any assumptions about external systems
- Think about scalability in your design decisions
- Implement proper error handling throughout the pipeline
