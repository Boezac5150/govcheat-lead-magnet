import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Lead magnet subscribers — stores emails captured from the cheat sheet landing page.
 */
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 128 }).default("cheatsheet").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

/**
 * User subscriptions — tracks active subscriptions linked to Stripe.
 * Stores only essential Stripe identifiers; fetch full details from Stripe API.
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }).notNull(),
  tier: mysqlEnum("tier", ["scout", "operator", "contractor", "prime"]).notNull(),
  status: mysqlEnum("status", ["active", "past_due", "canceled", "paused"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  canceledAt: timestamp("canceledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Payment history — tracks invoices and charges for user subscriptions.
 * Stores only essential Stripe identifiers; fetch full details from Stripe API.
 */
export const paymentHistory = mysqlTable("paymentHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 128 }).notNull().unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  status: mysqlEnum("status", ["paid", "pending", "failed", "refunded"]).notNull(),
  description: text("description"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = typeof paymentHistory.$inferInsert;

/**
 * Push notification subscriptions — stores browser push notification endpoints.
 * Each user can have multiple devices/browsers registered for push notifications.
 */
export const pushSubscriptions = mysqlTable("pushSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: text("endpoint").notNull(),
  auth: varchar("auth", { length: 256 }).notNull(),
  p256dh: varchar("p256dh", { length: 256 }).notNull(),
  userAgent: text("userAgent"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Push notifications — stores sent notifications for history and tracking.
 */
export const pushNotifications = mysqlTable("pushNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  body: text("body").notNull(),
  icon: varchar("icon", { length: 512 }),
  badge: varchar("badge", { length: 512 }),
  tag: varchar("tag", { length: 128 }),
  type: mysqlEnum("type", ["contract", "bid", "subscription", "payment", "alert", "info"]).default("info").notNull(),
  actionUrl: varchar("actionUrl", { length: 512 }),
  isRead: boolean("isRead").default(false).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushNotification = typeof pushNotifications.$inferSelect;
export type InsertPushNotification = typeof pushNotifications.$inferInsert;

/**
 * Government contracts — stores contract listings from SAM.gov with simplified language.
 * Each contract includes plain English descriptions and tier-based visibility.
 */
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  samId: varchar("samId", { length: 128 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  simplifiedDescription: text("simplifiedDescription").notNull(),
  agency: varchar("agency", { length: 256 }).notNull(),
  contractType: varchar("contractType", { length: 128 }).notNull(),
  simplifiedType: varchar("simplifiedType", { length: 128 }).notNull(),
  value: int("value"),
  deadline: timestamp("deadline"),
  difficulty: mysqlEnum("difficulty", ["easy", "moderate", "hard"]).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  setAside: varchar("setAside", { length: 128 }),
  naicsCode: varchar("naicsCode", { length: 10 }),
  url: varchar("url", { length: 512 }),
  minTierRequired: mysqlEnum("minTierRequired", ["scout", "operator", "contractor", "prime"]).default("scout").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

/**
 * Saved contracts — allows users to bookmark/save contracts for later review.
 */
export const savedContracts = mysqlTable("savedContracts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contractId: int("contractId").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["saved", "interested", "bidding", "won", "rejected"]).default("saved").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedContract = typeof savedContracts.$inferSelect;
export type InsertSavedContract = typeof savedContracts.$inferInsert;

/**
 * Contract alerts — allows users to set up email alerts for new contracts matching their criteria.
 */
export const contractAlerts = mysqlTable("contractAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  searchKeywords: text("searchKeywords").notNull(), // JSON array of keywords
  minValue: int("minValue"),
  maxValue: int("maxValue"),
  difficulty: mysqlEnum("difficulty", ["easy", "moderate", "hard"]),
  category: varchar("category", { length: 128 }),
  setAside: varchar("setAside", { length: 128 }),
  minTierRequired: mysqlEnum("minTierRequired", ["scout", "operator", "contractor", "prime"]).default("scout").notNull(),
  emailFrequency: mysqlEnum("emailFrequency", ["daily", "weekly", "instantly"]).default("daily").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastAlertSentAt: timestamp("lastAlertSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContractAlert = typeof contractAlerts.$inferSelect;
export type InsertContractAlert = typeof contractAlerts.$inferInsert;

/**
 * Alert history — tracks which contracts were sent in which alerts.
 */
export const alertHistory = mysqlTable("alertHistory", {
  id: int("id").autoincrement().primaryKey(),
  alertId: int("alertId").notNull(),
  contractId: int("contractId").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type AlertHistory = typeof alertHistory.$inferSelect;
export type InsertAlertHistory = typeof alertHistory.$inferInsert;
