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

- [x] Create Thank You / Upsell page with 4-tier pricing ($0/$29/$79/$299)
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

- [x] Rebuild Thank You / Upsell page with 4-tier pricing ($0/$29/$79/$299)
- [x] Feature AI Bid Writer as core paid-tier differentiator
- [x] Add tier comparison table with feature breakdown
- [x] Finalize admin dashboard and all routes
- [x] Restart server and verify all pages render
- [x] Write vitest tests for updated features (13 tests passing)
- [x] Upgrade subscriber.count and subscriber.list to adminProcedure
- [x] Add forbidden-access UI for non-admin users on /admin
- [x] Add tests for non-admin rejection on admin endpoints
- [x] End-to-end test and checkpoint

## Phase 4 — Stripe Payment Integration

- [x] Create Stripe products for all 4 tiers (Scout, Operator, Contractor, Prime)
- [x] Create recurring prices ($0/$29/$79/$299 monthly)
- [x] Add Stripe feature to webdev project
- [x] Configure Stripe secret key (auto-injected)
- [x] Create Stripe Checkout session endpoint
- [x] Wire Thank You page pricing buttons to Stripe Checkout
- [x] Handle post-checkout success/cancel redirects (built into checkout URL)
- [x] Write vitest tests for Stripe endpoints (8 tests passing)
- [x] End-to-end test and checkpoint


## Phase 5 — User Dashboard

- [x] Add subscription and payment history tables to database schema
- [x] Create tRPC procedures to fetch subscription status from Stripe
- [x] Create tRPC procedures to fetch payment history from Stripe
- [x] Build Dashboard page component with subscription info
- [x] Add payment history table with date, amount, status
- [x] Add account management section (change plan, cancel subscription)
- [x] Write vitest tests for dashboard endpoints (6 tests passing)
- [x] Test dashboard end-to-end and checkpoint
