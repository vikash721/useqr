# UseQR - Advanced Dynamic QR Code Platform

**UseQR** is a production-grade, full-stack application for generating, managing, and tracking dynamic QR codes. Built with modern web technologies, it offers a seamless experience for businesses and individuals to create branded QR codes that can be updated in real-time without reprinting.

![UseQR Tech Stack](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![Clerk](https://img.shields.io/badge/Auth-Clerk-purple) ![Paddle](https://img.shields.io/badge/Payments-Paddle-yellow)

---

## 🚀 Key Features

*   **Dynamic QR Codes**: Update destination URLs anytime without changing the QR pattern.
*   **Real-time Analytics**: Track scans, unique visitors, device types, and geographic locations.
*   **Custom Branding**: Add logos, change colors, and customize shapes (dots, corners, frames).
*   **Multiple Types**: Support for URL, vCard, WiFi, PDF, App Store, and more.
*   **High-Performance Tracking**: Server-side redirection with asynchronous analytics logging.
*   **Subscription Management**: tiered plans (Free, Starter, Pro) powered by Paddle.
*   **SEO Optimized**: Dedicated landing pages for key features with dynamic JSON-LD schema.
*   **Robust Security**: Enterprise-grade authentication via Clerk and secure API endpoints.

---

## 🛠 Tech Stack & Engineering

### Core Infrastructure
*   **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/) - Utilizing React Server Components (RSC) for performance and SEO.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) - Strict type safety across the entire codebase.
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS with [Lucide React](https://lucide.dev/) for icons.
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight client-side state for the QR builder and dashboard.

### Backend & Data
*   **Database**: [MongoDB](https://www.mongodb.com/) - NoSQL database for flexible data modeling (Users, QRs, Analytics, Subscriptions).
*   **API**: Next.js Route Handlers (`app/api`) with Zod validation.
*   **Image Storage**: [ImageKit](https://imagekit.io/) - CDN for optimizing and serving uploaded QR logos.
*   **Email**: [Resend](https://resend.com/) - Transactional emails for welcome flows and alerts.

### Authentication & Payments
*   **Auth**: [Clerk](https://clerk.com/) - User management, SSO, and secure session handling.
*   **Payments**: [Paddle](https://www.paddle.com/) - Merchant of Record (MoR) for handling global subscriptions and tax compliance.

---

## 🏗 Architecture Deep Dive

### 1. QR Scan Pipeline (`/q/[id]`)

The scan endpoint is the most latency-sensitive path in the system. Every scan from a phone camera hits `app/q/[id]/page.tsx` — a **React Server Component** that executes entirely on the server with zero client-side JavaScript overhead for redirect flows.

**Request lifecycle:**

```
Phone Camera → GET /q/abc123
                  │
                  ▼
         ┌─ Validate ID (regex: /^[a-zA-Z0-9_-]{1,64}$/)
         │  └─ Reject malformed IDs immediately (notFound())
         │
         ▼
   getQRById(id) → MongoDB lookup on `qrs` collection
         │
         ├─ QR not found → 404
         ├─ QR disabled  → <QRDisabledFallback /> (static landing)
         │
         ▼
   resolveQRScan(contentType, content, metadata)
         │
         ├─ "redirect" behavior (url, smart_redirect)
         │     ├─ recordScan(id, utm)  ← analytics logged BEFORE redirect
         │     └─ redirect(url)        ← Next.js 307 Temporary Redirect
         │
         └─ "landing" behavior (vcard, wifi, phone, email, sms, event, text)
               ├─ <MarkScanSession />  ← client component fires POST /api/scan
               └─ <QRScanLanding />    ← renders contact card / wifi details / etc.
```

**Smart Redirect (platform-aware routing):**
For `smart_redirect` content type, the server reads the `User-Agent` header and routes to platform-specific URLs:
- iOS devices → `metadata.smartRedirect.ios` (e.g., App Store link)
- Android devices → `metadata.smartRedirect.android` (e.g., Play Store link)
- Everything else → `metadata.smartRedirect.fallback`

This resolution happens server-side before the redirect, so the phone never downloads any JavaScript — it's a direct 307.

**Content Type Resolution (`lib/qr/qr-types.ts`):**
A single `resolveQRScan()` function acts as a router for 11 content types. Each type returns either a `{ behavior: "redirect", url }` or a `{ behavior: "landing", actions[], displayContent }` resolution. Landing types produce tap-to-action URLs (`tel:`, `mailto:`, `sms:`, `https://wa.me/`) that open native apps on the scanning device.

---

### 2. Analytics Engine

Analytics is the second most critical system. Every QR scan produces a `ScanEventDocument` with device, geo, and traffic source attribution.

**Data Collection (`lib/db/analytics.ts → recordScan()`):**

```
recordScan(qrId, utm)
      │
      ├─ headers() → extract User-Agent, Referer
      │
      ├─ parseDeviceType(ua)   → "mobile" | "tablet" | "desktop"
      ├─ parseBrowserName(ua)  → "Chrome" | "Safari" | "Firefox" | ...
      ├─ parseOsName(ua)       → "iOS" | "Android" | "Windows" | ...
      │
      ├─ resolveGeo(headers) → { countryCode, city, region }
      │     Priority: Cloudflare headers → Vercel headers → ipapi.co fallback
      │     └─ Fallback has 2s AbortSignal timeout (never blocks the scan)
      │     └─ Private/localhost IPs are skipped entirely
      │
      └─ Promise.all([              ← PARALLEL writes
            coll.insertOne(doc),    ← append to scan_events collection
            incrementQRScanCount()  ← atomic $inc on qrs.scanCount
         ])
```

**Key design decision:** The `insertOne` and `incrementQRScanCount` run in `Promise.all` — they are independent operations and execute concurrently. The scan counter on the QR document uses MongoDB's atomic `$inc` operator, so concurrent scans never lose counts.

**Geo Resolution Waterfall:**
The system tries three sources in order, falling through on failure:
1. **Cloudflare headers** (`cf-ipcountry`, `cf-ipcity`) — instant, no network call
2. **Vercel headers** (`x-vercel-ip-country`, `x-vercel-ip-city`) — instant, no network call
3. **ipapi.co API** — external HTTP call with a hard `AbortSignal.timeout(2000)` to ensure geo lookup never delays the scan response beyond 2 seconds

**Analytics Aggregation (`getScanAnalytics()`):**
Dashboard analytics are computed in a **single MongoDB round-trip** using `$facet`. One `$match` filters to the QR's date range, then `$facet` fans out into **5 parallel sub-pipelines**:

| Sub-pipeline     | Groups by         | Output                          |
| ---------------- | ----------------- | ------------------------------- |
| `lastScan`       | —                 | Most recent scan timestamp      |
| `byDay`          | `$dateToString`   | Daily scan counts (time series) |
| `byDevice`       | `deviceType`      | Mobile / Tablet / Desktop split |
| `byCountry`      | `countryCode`     | Top 20 countries                |
| `byReferrer`     | `referrer`        | Top 10 referral sources         |
| `byUtmSource`    | `utmSource`       | Top 10 UTM sources              |

This replaces what would otherwise be **6 separate database queries** with a single aggregation cursor.

**Scan Event Schema (`lib/db/schemas/analytics.ts`):**
```typescript
{
  qrId:        string,       // FK to qrs._id
  scannedAt:   Date,         // event timestamp
  deviceType:  "mobile" | "tablet" | "desktop",
  browserName: string,       // "Chrome", "Safari", etc.
  osName:      string,       // "iOS", "Android", etc.
  countryCode: string,       // ISO 3166-1 alpha-2 ("US", "IN")
  city:        string,       // "Mumbai", "New York"
  region:      string,       // "Maharashtra", "California"
  referrer:    string,       // HTTP Referer header
  utmSource:   string,       // ?utm_source=...
  utmMedium:   string,       // ?utm_medium=...
  utmCampaign: string,       // ?utm_campaign=...
  utmContent:  string,       // ?utm_content=...
}
```

---

### 3. Database Design & Index Strategy

**Collections:**

| Collection          | Primary Key        | Purpose                                      |
| ------------------- | ------------------ | -------------------------------------------- |
| `users`             | `clerkId`          | User profiles synced from Clerk              |
| `qrs`               | `_id` (short code) | QR documents with content, style, scan count |
| `scan_events`       | ObjectId (auto)    | Append-only analytics event log              |
| `subscriptions`     | `subscriptionId`   | Paddle subscription snapshots                |
| `payment_transactions` | `transactionId` | Payment receipts for billing history         |
| `payment_whitelist` | `clerkId`          | Beta/early access plan overrides             |

**Compound Index Strategy (`ensureScanEventIndexes()`):**
Indexes are designed to cover all analytics query patterns with minimal index overhead:

```
{ qrId: 1, scannedAt: -1 }                    → date-range queries, "last scan", cascading deletes
{ qrId: 1, scannedAt: -1, deviceType: 1 }     → device breakdown aggregation
{ qrId: 1, scannedAt: -1, countryCode: 1 }    → country breakdown aggregation
{ qrId: 1, scannedAt: -1, referrer: 1 }       → referrer breakdown aggregation
{ qrId: 1, scannedAt: -1, utmSource: 1 }      → UTM source breakdown aggregation
```

Each compound index lets MongoDB satisfy the `$match` on `qrId + scannedAt` range **AND** the `$group` key in a single index scan — no collection scan ever hits the analytics pipeline.

**Index Initialization:** The `ensureScanEventIndexes()` function uses a module-level `_indexesEnsured` boolean flag. After the first call in a process lifetime, all subsequent calls are a no-op — zero overhead on hot paths.

**Connection Pooling (`lib/db/mongodb.ts`):**
The MongoDB client is a **global singleton** stored on `globalThis`, surviving Next.js hot module reloading in development:
```typescript
const options: MongoClientOptions = {
  maxPoolSize: 10,  // concurrent connections per serverless instance
  minPoolSize: 1,   // keep one warm connection alive
};
```
This prevents the classic serverless anti-pattern of creating a new connection per request.

---

### 4. Real-Time Scan Detection (SSE + In-Memory Pub/Sub)

When a user creates a QR code on the dashboard and holds their phone up to scan it, they see the result **instantly** — no polling, no page refresh.

**Architecture (`lib/scan-store.ts`):**

```
Dashboard (browser)                    Phone (scanner)
      │                                      │
      │ GET /api/scan/status/stream?qrId=abc │
      │    ← SSE connection opened           │
      │       (ReadableStream)               │
      │                                      │
      │                              POST /api/scan { qrId: "abc" }
      │                                      │
      │                              recordScan("abc")
      │                                      │
      │                              ┌── scans Map.set("abc", { scannedAt })
      │                              │
      │                              └── scanListeners Map.get("abc")
      │                                      │
      │    ← SSE: { scanned: true }   ◄──────┘ callback invoked
      │       controller.close()
      │
      ▼
  UI updates: "QR Scanned!" animation
```

This is a **pure in-memory pub/sub** system with zero external dependencies (no Redis, no WebSocket server). The trade-off is it only works within a single server instance — acceptable for the current scale since scans and dashboard views typically hit the same Vercel function.

The `subscribeScan()` function returns an unsubscribe callback that's wired to the SSE request's `abort` signal, so listeners are garbage-collected when the browser disconnects.

---

### 5. Payment & Subscription System

Payments use Paddle as Merchant of Record with a **webhook-driven, eventually-consistent** architecture.

**Webhook Flow (`/api/webhooks/paddle`):**

```
Paddle                              UseQR Backend
  │                                      │
  │ POST /api/webhooks/paddle            │
  │ Headers: paddle-signature            │
  │                                      │
  │ ──────────────────────────────────►  │
  │                              verifyPaddleWebhook(rawBody, signature, secret)
  │                                      │  (HMAC signature verification)
  │                                      │
  │                              Parse event_type:
  │                                      │
  │        subscription.created ─────►  resolve clerkId from custom_data
  │        subscription.updated          │
  │                                      ├── priceIdToPlanSlug(priceId)
  │                                      ├── upsertSubscription(doc)
  │                                      ├── updateUserPlanByClerkId(clerkId, plan)
  │                                      └── notifyTelegramSubscriptionActive()
  │                                      │
  │        subscription.canceled ────►  markSubscriptionCanceled(subId)
  │                                      ├── updateUserPlanByClerkId(clerkId, "free")
  │                                      └── notifyTelegramSubscriptionCanceled()
  │                                      │
  │        transaction.completed ────►  insertPaymentTransaction(receipt)
  │                                      │
  │ ◄──────────────────────────────────  │
  │ 200 { received: true }               │
```

**clerkId Resolution:** The `clerkId` is passed via Paddle's `custom_data` field during checkout. If missing (e.g., during a renewal where custom_data isn't resent), the handler falls back to looking up the existing subscription by `subscriptionId` in our `subscriptions` collection.

**Subscription Upserts:** Uses MongoDB's `updateOne` with `{ upsert: true }` keyed on `subscriptionId` — idempotent by design. Paddle may send duplicate webhooks; every handler is safe to replay.

---

### 6. Rate Limiting

API endpoints are protected by an **in-memory sliding window rate limiter** (`lib/rate-limit.ts`):

```typescript
checkRateLimit(identifier: string, limit: number, windowMs: number): boolean
```

The implementation uses a `Map<string, number[]>` where each key stores an array of request timestamps. On each check:
1. Prune timestamps older than `windowMs`
2. If remaining count ≥ `limit`, reject (return `false`)
3. Otherwise, push current timestamp and allow

This is intentionally simple and stateless across instances — a pragmatic choice for the current single-instance deployment model.

---

### 7. Schema Validation & Type Safety

Every data boundary is validated with [Zod](https://zod.dev/):

- **API inputs**: Request bodies are parsed through Zod schemas (`qrCreateBodySchema`, `qrUpdateBodySchema`) before touching the database.
- **Environment variables**: `lib/env.ts` validates all required and optional env vars at server startup using `serverEnvSchema.parse(process.env)`. Missing or malformed vars throw a `ZodError` with clear messages — fail fast, not at runtime.
- **Database documents**: TypeScript types for all collections (`QRDocument`, `ScanEventDocument`, `UserDocument`, `SubscriptionDocument`) are inferred directly from Zod schemas via `z.infer<>`, ensuring the type system and runtime validation are always in sync.

---

### 8. Cascading Deletes & Data Integrity

When a user is deleted from Clerk:
1. Clerk fires `user.deleted` webhook → `/api/webhooks/clerk`
2. `deleteAllUserDataByClerkId(clerkId)` runs:
   - Deletes all QR documents owned by the user
   - Deletes all scan events for those QRs
   - Deletes subscription records
3. `sendDeletionReportEmail()` sends a summary of what was deleted

When a single QR is deleted from the dashboard, `deleteQR()` and `deleteScanEventsByQrId()` can run inside a MongoDB `ClientSession` for **transactional atomicity** — either both succeed or neither does.

---

## 📂 Project Structure

```
├── app/                       # Next.js App Router
│   ├── q/[id]/page.tsx        # ← QR scan endpoint (Server Component)
│   ├── api/
│   │   ├── scan/              # Scan recording & real-time status (SSE)
│   │   ├── qrs/               # CRUD for QR documents
│   │   ├── webhooks/
│   │   │   ├── clerk/         # User sync & deletion
│   │   │   └── paddle/        # Subscription & payment events
│   │   ├── users/             # User profile & plan management
│   │   └── upload/            # ImageKit logo uploads
│   ├── dashboard/             # Protected app routes
│   ├── not-found.tsx          # Custom 404
│   ├── global-error.tsx       # Custom 500
│   └── layout.tsx             # Root layout with JSON-LD
│
├── lib/                       # Core business logic
│   ├── db/
│   │   ├── mongodb.ts         # Singleton client + connection pool
│   │   ├── schemas/           # Zod schemas (qr, analytics, user, subscription)
│   │   ├── analytics.ts       # recordScan(), getScanAnalytics() ($facet)
│   │   ├── qrs.ts             # CRUD + atomic $inc scan counter
│   │   ├── subscriptions.ts   # Upsert/cancel subscription snapshots
│   │   └── users.ts           # User CRUD, plan updates
│   ├── qr/
│   │   ├── qr-types.ts        # Content type resolver (11 types)
│   │   └── user-agent.ts      # Device/browser/OS parser (regex-based)
│   ├── scan-store.ts          # In-memory pub/sub for real-time SSE
│   ├── rate-limit.ts          # Sliding window rate limiter
│   ├── paddle.ts              # HMAC verification + priceId→plan mapping
│   └── env.ts                 # Zod-validated env vars
│
├── components/                # React components
│   ├── qr/                    # QR scan landing pages & builder
│   ├── ui/                    # Radix UI primitives
│   └── HomeClient.tsx         # Landing page (reused for SEO pages)
│
├── stores/                    # Zustand stores (client state)
└── utils/                     # Shared utilities (sidebar logic, etc.)
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   MongoDB Atlas Cluster
*   Clerk Account
*   Paddle Sandbox Account (for payments)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/useqr.git
    cd useqr
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    # App
    NEXT_PUBLIC_APP_URL=http://localhost:3000

    # Database
    MONGODB_URI=mongodb+srv://...

    # Auth (Clerk)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

    # Payments (Paddle)
    NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
    PADDLE_API_KEY=...
    PADDLE_WEBHOOK_SECRET=...
    PADDLE_PRICE_ID_STARTER=...

    # Services
    RESEND_API_KEY=...
    IMAGEKIT_URL_ENDPOINT=...
    IMAGEKIT_PRIVATE_KEY=...

    # Notifications (optional)
    TELEGRAM_BOT_TOKEN=...
    TELEGRAM_CHAT_ID=...
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📜 License

This project is open-sourced temporarily for hackathon evaluation and portfolio purposes. You're welcome to explore the code, learn from the patterns, and get inspired — but please don't copy or redistribute it as your own. All intellectual property rights remain with the author.

**© 2025 Vikash Kumar** · Built with ☕ and a lot of late nights.



