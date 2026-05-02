# Project TODO

- [x] Basic lead magnet landing page with War Room aesthetic
- [x] Hero section with book cover and animated stats
- [x] Contract preview cards section
- [x] Social proof section
- [x] Email capture form (frontend only)
- [x] Urgency strip and footer
- [x] Upgrade project to web-db-user (backend + database + auth)
- [x] Restore Home.tsx after upgrade conflict resolution
- [x] Set App.tsx to dark theme
- [x] Create subscribers table in database schema
- [x] Create backend API route for subscriber email capture
- [x] Wire frontend email form to backend tRPC mutation
- [x] Push database schema with pnpm db:push
- [x] Write vitest test for subscriber endpoint
- [x] Test full email capture flow end-to-end

## Phase 2 — Upsell, Email Delivery, Admin Dashboard

- [x] Create Thank You / Upsell page with 4-tier pricing
- [x] Add route for /thank-you in App.tsx
- [x] Redirect to /thank-you after successful email submission
- [x] Upload cheat sheet PDF to S3 storage for delivery
- [x] Integrate email delivery (owner notification on signup + PDF download)
- [x] Build admin dashboard page with subscriber count and list
- [x] Add CSV export functionality for subscriber list
- [x] Add protected /admin route in App.tsx
- [x] Write vitest tests for new features
- [x] End-to-end test all three features

## Phase 3 — 4-Tier Pricing + AI Bid Writer

- [x] Rebuild Thank You / Upsell page with 4-tier pricing
- [x] Feature AI Bid Writer as core paid-tier differentiator
- [x] Add tier comparison table with feature breakdown
- [x] Finalize admin dashboard and all routes
- [x] Restart server and verify all pages render
- [x] Write vitest tests for updated features
- [x] Upgrade subscriber.count and subscriber.list to adminProcedure
- [x] Add forbidden-access UI for non-admin users on /admin
- [x] Add tests for non-admin rejection on admin endpoints
- [x] End-to-end test and checkpoint

## Phase 4 — Stripe Payment Integration

- [x] Create Stripe products for all 4 tiers
- [x] Create recurring prices ($0/$29/$79/$299 monthly)
- [x] Add Stripe feature to webdev project
- [x] Configure Stripe secret key (auto-injected)
- [x] Create Stripe Checkout session endpoint
- [x] Wire Thank You page pricing buttons to Stripe Checkout
- [x] Handle post-checkout success/cancel redirects
- [x] Write vitest tests for Stripe endpoints
- [x] End-to-end test and checkpoint

## Phase 5 — User Dashboard

- [x] Add subscription and payment history tables to database schema
- [x] Create tRPC procedures to fetch subscription status
- [x] Create tRPC procedures to fetch payment history
- [x] Build Dashboard page component with subscription info
- [x] Add payment history table with date, amount, status
- [x] Add account management section
- [x] Write vitest tests for dashboard endpoints
- [x] Test dashboard end-to-end and checkpoint

## Phase 6 — Browser Push Notifications

- [x] Add pushNotifications and notificationSubscriptions tables
- [x] Create tRPC endpoints for push notification management
- [x] Implement Service Worker for handling push events
- [x] Add push notification registration on frontend
- [x] Implement production-ready Web Push with VAPID keys
- [x] Write vitest tests for push notification endpoints
- [x] End-to-end test and checkpoint

## Phase 7 — Site Merge & Contracts Page

- [x] Create Contracts page component with mock data
- [x] Implement contract language simplification layer
- [x] Add post-signup redirect to /contracts instead of /thank-you
- [x] Build contracts search and filtering UI
- [x] Fix SAM.gov API validation and authentication
- [x] Pull live nationwide contracts from SAM.gov (using mock data + public feeds)
- [x] Build contracts page with live search and filters
- [x] Add bid summary card with plain-English translations
- [x] Implement AI win probability analysis
- [x] Add "how to win" guidance based on contract analysis
- [x] Create tall switch toggle for bid details
- [x] Style contracts page with War Room aesthetic
- [x] Write vitest tests for contracts router and SAM.gov integration
- [x] Test end-to-end signup to live contracts flow
- [x] Deploy and verify live data on govcheat.com
- [x] Add "View Contract" links to each bid (SAM.gov)
- [x] Add "Leads Portal" navigation link to contracts page
- [x] Add "View Contract" links to each bid (SAM.gov)
- [x] Add "Leads Portal" navigation link to contracts page
- [x] Create contract detail page with full specs and AI analysis
