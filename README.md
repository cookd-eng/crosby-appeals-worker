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

# Technical Interview Challenge: TikTok Data Pipeline

## Overview
In this challenge, you'll be working with a mock TikTok API service to build a data pipeline that processes video data for our analytics dashboard. The challenge involves working with background jobs, API integration, and data transformation.

## Requirements

### 1. Background Job Setup (Required)
- Set up Sidekiq in the Rails application
- Create a worker that fetches data from our MockTiktokService
- Configure the worker to run every 30 minutes

### 2. Data Transformation (Required)
The worker should transform the TikTok video data into the following format before saving:

```ruby
{
    video_id: String, # TikTok's video ID
    creator: {
        username: String, # Creator's username
        region: String # Creator's region code
    },
    performance: {
        views: Integer, # Total views
        likes: Integer, # Total likes
        engagement_rate: Float, # (likes + comments + shares) / views 100
        trending_score: Integer # Algorithm-based score (explained below)
    },
    content: {
        description: String, # Video description
        duration: Integer, # Video duration in seconds
        hashtags: Array<String>, # Array of hashtag names
        category: String # Video label category
    },
    timestamps: {
        created_at: DateTime, # TikTok creation timestamp
        ingested_at: DateTime # When our system processed it
    }
}
```


#### Trending Score Algorithm

The trending score is a number from 0-100 that combines three factors about a video's performance. Here's exactly how to calculate it:

1. **View Velocity (40% of final score)**
   - Calculate views per hour since the video was posted.
   - If views/hour is 1000 or higher, score is 100.
   - If views/hour is 0, score is 0.
   - Otherwise: `score = (views per hour / 1000) * 100`.

2. **Engagement Rate (35% of final score)**
   - Calculate total engagements: (likes + comments + shares).
   - Calculate engagement rate: `(total engagements / views) * 100`.
   - If engagement rate is 15% or higher, score is 100.
   - If engagement rate is 0%, score is 0.
   - Otherwise: `score = (engagement rate / 15) * 100`.

3. **Recency (25% of final score)**
   - If video is less than 6 hours old, score is 100.
   - If video is more than 72 hours old, score is 0.
   - Otherwise: `score = ((72 - hours_since_posted) / 72) * 100`.

The final trending score is calculated as:
`(view_velocity_score * 0.4) + (engagement_score * 0.35) + (recency_score * 0.25)`

Round the final score to the nearest integer and ensure it stays within the 0-100 range.

**Example:**
A video has 2000 views/hour (100 points), 10% engagement rate (67 points), and is 12 hours old (83 points).
Final score = `(100 * 0.4) + (67 * 0.35) + (83 * 0.25) = 84`

### 3. API Endpoints (Required)

#### `GET /api/v1/videos`
Lists processed videos with pagination.

**Query Parameters:**
- `page` (integer, default: 1)
- `per_page` (integer, default: 20)
- `sort_by` (string, optional: 'trending_score', 'views', 'created_at')
- `sort_direction` (string, optional: 'asc', 'desc')

**Response:**
```json
{
  "data": [
    {
      "video_id": "1234567890",
      "creator": {
        "username": "dancequeen",
        "region": "US"
      },
      "performance": {
        "views": 1500000,
        "likes": 250000,
        "engagement_rate": 12.5,
        "trending_score": 84
      },
      "content": {
        "description": "Check this out! #fyp #dance",
        "duration": 45,
        "hashtags": ["fyp", "dance"],
        "transcript": "Hey everyone, welcome back to my channel",
        "category": "entertainment"
      },
      "timestamps": {
        "created_at": "2024-03-15T14:30:00Z",
        "ingested_at": "2024-03-15T14:35:00Z"
      }
    }
    // ... more videos
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "per_page": 20
  }
}
```

#### `GET /api/v1/videos/:id`
Get detailed information about a specific video.

**Response:**
```json
{
  "data": {
    "video_id": "1234567890",
    "creator": {
      "username": "dancequeen",
      "region": "US"
    },
    "performance": {
      "views": 1500000,
      "likes": 250000,
      "comments": 15000,
      "shares": 10000,
      "engagement_rate": 12.5,
      "trending_score": 84,
      "favorites": 45000
    },
    "content": {
      "description": "Check this out! #fyp #dance",
      "duration": 45,
      "hashtags": ["fyp", "dance"],
      "transcript": "Hey everyone, welcome back to my channel",
      "category": "entertainment",
      "effects": ["123456", "789012"],
      "mentions": ["user123", "user456"]
    },
    "timestamps": {
      "created_at": "2024-03-15T14:30:00Z",
      "ingested_at": "2024-03-15T14:35:00Z"
    }
  }
}
```

#### `GET /api/v1/analytics`
Get aggregated statistics across all processed videos.

**Query Parameters:**
- `time_range` (string, optional: 'day', 'week', 'month', default: 'day')

**Response:**
```json
{
  "data": {
    "total_videos": 1500,
    "total_views": 25000000,
    "average_engagement_rate": 8.5,
    "trending_videos": {
      "count": 150,
      "threshold": 80
    },
    "top_hashtags": [
      {
        "name": "fyp",
        "count": 450,
        "total_views": 8500000
      },
      {
        "name": "dance",
        "count": 280,
        "total_views": 5200000
      }
    ],
    "region_distribution": {
      "US": 450,
      "JP": 280,
      "GB": 225
    },
    "category_performance": [
      {
        "name": "entertainment",
        "video_count": 500,
        "average_trending_score": 75,
        "total_views": 9500000
      }
    ]
  },
  "meta": {
    "time_range": "day",
    "generated_at": "2024-03-15T15:00:00Z"
  }
}
```

### 4. Database Design (Required)
- Design and implement the necessary database schema
- Include appropriate indexes for efficient querying
- Write migrations for the schema

### 5. Front-end Components (Bonus)
- Create a React component to display the video list
- Implement a video details modal/page
- Add basic analytics visualizations

## Evaluation Criteria
We'll evaluate your submission based on:
- Code organization and quality
- Background job implementation
- Data transformation logic
- API design and implementation
- Database schema design
- Test coverage
- Bonus: Front-end implementation

## Getting Started
1. The mock TikTok service is available in:
ruby:app/services/mock_tiktok_service.rb
startLine: 1
endLine: 105

2. Use the service by calling:
    ```ruby
    MockTiktokService.generate_mock_response
    ```

## Submission
- Create a new branch for your work
- Submit a pull request with your implementation
- Include any necessary documentation
- Add tests for your code

## Tips
- Focus on the core requirements first
- Use Ruby/Rails best practices
- Consider error handling and edge cases
- Document any assumptions you make