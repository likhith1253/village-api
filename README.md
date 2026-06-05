# CensusGrid: India's Geographic Data Platform

CensusGrid is a high-performance developer portal and REST API platform that provides administrative address records for over 457,000+ Indian villages across 600+ districts and 36 States & Union Territories. Built with an Express backend and React frontend, the platform integrates Stripe checkout subscriptions, tiered rate limiting, telemetry caching, and a complete developer dashboard.

---

## 1. Problem Statement & Solution

### Problem
Geographic address data in India is highly nested, inconsistent, and difficult to query at scale. Developers frequently struggle to locate standardized listings of states, districts, subdistricts, and villages. Existing governmental data feeds are often slow, lack modern developer-friendly formats, and do not offer caching or unified indexing.

### Solution
CensusGrid normalizes administrative geographic divisions into a relational model and serves it via sub-100ms REST endpoints. Developers can access a self-serve console to manage API credentials, track daily quotas, view usage analytics, and upgrade their service plans via Stripe.

---

## 2. Technical Stack

* **Frontend**: React 18, Vite, Recharts, Lucide React, Tailwind CSS
* **Backend**: Node.js, Express, Prisma ORM, Helmet, CORS
* **Database**: PostgreSQL (hosted on Neon Serverless)
* **Caching**: Redis (hosted on Upstash Redis Edge) with local in-memory LRU fallbacks
* **Payments & Billing**: Stripe API (Subscriptions, Checkout, Webhooks)
* **Authentication**: JWT (JSON Web Tokens), BCrypt password hashing
* **Documentation**: OpenAPI Swagger Specification (`/api-docs` endpoint)

---

## 3. Platform Architecture

The data flows securely through multiple middleware boundaries to protect backend resources and optimize read times:

```
[ Frontend (React SPA) ]
           │
           ▼ (HTTPS / API Keys or JWT)
[ Backend Express API Gateway ] ──► [ Helmet & CORS Protections ]
           │
           ▼
[ Authentication & Rate Limiting Middlewares ] ──► [ Neon PostgreSQL (Prisma) ]
           │ (Validates dynamic plan/role from DB)
           ▼
[ Caching Resolution (Upstash Redis) ] ──► (Cache Hit: Return cached JSON)
           │ (Cache Miss)
           ▼
[ Database Query Resolver ] ──► [ Neon PostgreSQL (Prisma) ]
           │
           ▼ (Cache result in Redis)
[ Response Sent to Client ]
```

### Checkout & Webhook Lifecycle
```
[ Frontend Console ] ──► POST /api/billing/checkout ──► [ Stripe Hosted Checkout ]
                                                                 │
                                                                 ▼ (Completes Payment)
[ User Plan Upgraded (PRO) ] ◄── Write DB Plan ◄── [ Express Webhook Endpoint ]
```

---

## 4. Implemented Features

### Authentication & Sessions
* Developer registration, login, and secure session management.
* JWT authorization tokens used for API credentials management, settings updates, and dashboard lookups.

### API Key Infrastructure
* Self-serve developer interface to generate secure hex keys (`vap_...`).
* Activation toggles to disable or enable keys, and instant credential revocation.
* Requests tracked individually per key and logged to the telemetry database.

### Geographic REST APIs
* Standardized, indexed endpoints querying:
  * **States**: Full listing of codes and names.
  * **Districts**: Filtered by parent state code.
  * **Subdistricts**: Filtered by parent district code.
  * **Villages**: Paginated village directories, specific code address retrievals, and partial-name fuzzy searches.

### Caching Architecture
* Upstash Redis engine acts as an edge-read cache, bypassing database lookups for repeat geographic queries.
* Automated local in-memory cache fallback prevents application crashes in the event of cache timeouts.

### Usage & Analytics
* **Telemetry Aggregations**: Chart trends showing request volume, daily counts, and API key metrics.
* **Privacy Controls**: Analytics queries are filtered by user identity at the database layer. Developers only view their own usage, while platform admins access global data.
* **HTTP Code Analysis**: Visual breakdowns of status codes (2xx, 4xx, 5xx) to monitor query errors.

### Tiered Billing & Stripe
* Stripe hosted checkout redirects to capture monthly subscriptions ($49/mo).
* Webhook signature validation updating plans to `PRO` automatically.
* Clean billing details cards inside user settings displaying billing period end dates.

---

## 5. Visual Walkthrough

### 1. Landing Page
Features a dark grid theme, query sandbox examples, and real-time response latency counters.
![Landing Page](./screenshots/landing_page.png)

### 2. Login Page
Developer authentication screen issuing secure session tokens.
![Login Page](./screenshots/login.png)

### 3. Developer Dashboard
Provides an overview of remaining requests, current tier, and active API keys.
![Developer Dashboard](./screenshots/dashboard.png)

### 4. API Credentials Panel
Enables key creation, renaming, status toggling, and revocation.
![API Keys Panel](./screenshots/api_keys.png)

### 5. API Quotas & Usage Tracking
Tracks daily requests consumed against the account's plan limitations.
![API Quotas Page](./screenshots/usage.png)

### 6. Platform Analytics Page
Displays daily request trend charts, status code distributions, and active endpoints.
![Analytics Page](./screenshots/analytics.png)

### 7. Interactive API Explorer
Allows developers to query raw REST endpoints and inspect returned JSON payloads directly in the browser.
![API Explorer](./screenshots/api_explorer.png)

### 8. Integration Documentation
cURL code templates, endpoints descriptions, parameters tables, and quick navigation headers.
![Documentation Portal](./screenshots/documentation.png)

### 9. Account Settings
Manage developer profile name, email, account password, and billing subscriptions.
![Account Settings](./screenshots/settings.png)

---

## 6. Live Deployment Details

* **Frontend Console**: `https://censusgrid.vercel.app`
* **Backend API Server**: `https://censusgrid-backend.onrender.com`
* **Swagger Documentation**: `https://censusgrid-backend.onrender.com/api-docs`

---

## 7. API Specification & Examples

### Authorization Header
All geographic endpoints require the API Key to be sent inside the `x-api-key` header.
```
x-api-key: vap_live_6c029da9f138e07a
```

### 1. Retrieve States
`GET /api/v1/states`

**cURL Request**:
```bash
curl -H "x-api-key: your_api_key" \
  "https://api.censusgrid.com/api/v1/states"
```

**JSON Response**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "code": "AP", "name": "Andhra Pradesh", "type": "STATE" },
    { "code": "KA", "name": "Karnataka", "type": "STATE" },
    { "code": "MH", "name": "Maharashtra", "type": "STATE" }
  ]
}
```

### 2. Search Villages
`GET /api/v1/villages/search?q=Agali`

**cURL Request**:
```bash
curl -H "x-api-key: your_api_key" \
  "https://api.censusgrid.com/api/v1/villages/search?q=Agali"
```

**JSON Response**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "code": "622345",
      "name": "Agali",
      "subDistrict": "Agali",
      "district": "Anantapur",
      "state": "Andhra Pradesh"
    }
  ]
}
```

---

## 8. Subscription Tiers & Quotas

| Plan | Price | Daily Quota | Features |
| :--- | :--- | :--- | :--- |
| **Free** | $0 | 100 requests | Basic village lookup, 3 API keys |
| **Pro** | $49/mo | 10,000 requests | Advanced search, analytics, usage trends, unlimited keys |
| **Enterprise** | Custom | Unlimited | Priority SLA support, dedicated account management |

---

## 9. Local Development Setup

### 1. Clone & Dependencies Installation
```bash
git clone https://github.com/likhith1253/village-api.git
cd village-api
npm install
npx prisma generate
```

### 2. Configure Environment Files
Create a `.env` file in the root directory:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
JWT_SECRET="your_jwt_signing_key"
UPSTASH_REDIS_REST_URL="https://your-caching-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

### 3. Initialize Prisma Client
```bash
npx prisma db push
```

### 4. Running the Servers
* **Start Backend**:
  ```bash
  npm run dev
  ```
* **Start Frontend**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## 10. Engineering Challenges Solved (Resume Summary)

* **JWT Stale Claims Reconciliation**: Solved the issue of outdated JWT claims (storing user plans at login) by modifying authentication and rate-limiting middlewares to execute lightweight PostgreSQL database lookups, ensuring billing changes propagate instantly without requiring users to log out.
* **Edge Caching Proxy with Fail-Safe**: Designed a REST caching proxy layer using Upstash Redis. Structured the cache lookup to gracefully fail over to a local in-memory cache to guarantee zero downtime if the remote cache becomes unreachable.
* **Secure Webhook body Parsing**: Managed Stripe webhook payload signing validation by registering the webhook route raw-body buffer parser *before* standard global JSON middlewares inside Express.
* **Isolated Multi-Tenant Analytics**: Constructed query filters in the database service layer to scope telemetry graphs to `userId` for standard subscribers, preventing metrics visibility leakage between developer accounts.
