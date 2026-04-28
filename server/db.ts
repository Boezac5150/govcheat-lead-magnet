import { eq, and, or, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subscribers, InsertSubscriber, subscriptions, paymentHistory, InsertSubscription, InsertPaymentHistory, pushSubscriptions, pushNotifications, InsertPushSubscription, InsertPushNotification, contracts, savedContracts, InsertSavedContract } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/* ─── Subscriber helpers ─── */

export async function insertSubscriber(email: string, source = "cheatsheet"): Promise<{ success: boolean; alreadyExists: boolean }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Check if email already exists
    const existing = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, alreadyExists: true };
    }

    await db.insert(subscribers).values({
      email: email.toLowerCase().trim(),
      source,
    });

    return { success: true, alreadyExists: false };
  } catch (error) {
    console.error("[Database] Failed to insert subscriber:", error);
    throw error;
  }
}

export async function getSubscriberCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select().from(subscribers);
  return result.length;
}

export async function getAllSubscribers() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(subscribers);
}

/* Subscription helpers */

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function upsertSubscription(data: InsertSubscription): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, data.stripeSubscriptionId!))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(subscriptions)
        .set(data)
        .where(eq(subscriptions.stripeSubscriptionId, data.stripeSubscriptionId!));
    } else {
      await db.insert(subscriptions).values(data);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert subscription:", error);
    throw error;
  }
}

/* Payment history helpers */

export async function getUserPaymentHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(paymentHistory)
    .where(eq(paymentHistory.userId, userId));
}

export async function insertPayment(data: InsertPaymentHistory): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(paymentHistory).values(data);
  } catch (error) {
    console.error("[Database] Failed to insert payment:", error);
    throw error;
  }
}

export async function updatePaymentStatus(invoiceId: string, status: "paid" | "pending" | "failed" | "refunded"): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(paymentHistory)
      .set({ status, updatedAt: new Date() })
      .where(eq(paymentHistory.stripeInvoiceId, invoiceId));
  } catch (error) {
    console.error("[Database] Failed to update payment status:", error);
    throw error;
  }
}


/* Push notification helpers */

export async function subscribeToPushNotifications(userId: number, subscription: InsertPushSubscription): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(pushSubscriptions).values(subscription);
  } catch (error) {
    console.error("[Database] Failed to subscribe to push notifications:", error);
    throw error;
  }
}

export async function unsubscribeFromPushNotifications(userId: number, endpoint: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(pushSubscriptions)
      .set({ isActive: false })
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
  } catch (error) {
    console.error("[Database] Failed to unsubscribe from push notifications:", error);
    throw error;
  }
}

export async function getUserPushSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.isActive, true)));
}

export async function insertPushNotification(data: InsertPushNotification): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(pushNotifications).values(data);
  } catch (error) {
    console.error("[Database] Failed to insert push notification:", error);
    throw error;
  }
}

export async function getUserPushNotifications(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(pushNotifications)
    .where(eq(pushNotifications.userId, userId))
    .limit(limit);
}

export async function markPushNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(pushNotifications)
      .set({ isRead: true })
      .where(eq(pushNotifications.id, notificationId));
  } catch (error) {
    console.error("[Database] Failed to mark notification as read:", error);
    throw error;
  }
}

/* ─── Contract helpers ─── */

export async function getAllContracts(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get contracts: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(contracts)
      .where(eq(contracts.isActive, true))
      .limit(limit)
      .offset(offset);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get contracts:", error);
    throw error;
  }
}

export async function searchContracts(query: string, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search contracts: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(contracts)
      .where(
        and(
          eq(contracts.isActive, true),
          or(
            like(contracts.title, `%${query}%`),
            like(contracts.simplifiedDescription, `%${query}%`),
            like(contracts.agency, `%${query}%`),
            like(contracts.category, `%${query}%`)
          )
        )
      )
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to search contracts:", error);
    throw error;
  }
}

export async function getContractsByCategory(category: string, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get contracts by category: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(contracts)
      .where(and(eq(contracts.isActive, true), eq(contracts.category, category)))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get contracts by category:", error);
    throw error;
  }
}

export async function getSavedContracts(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get saved contracts: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(savedContracts)
      .where(eq(savedContracts.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get saved contracts:", error);
    throw error;
  }
}

export async function saveContract(userId: number, contractId: number, notes?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save contract: database not available");
    return;
  }

  try {
    await db.insert(savedContracts).values({
      userId,
      contractId,
      notes: notes || null,
      status: "saved",
    });
  } catch (error) {
    console.error("[Database] Failed to save contract:", error);
    throw error;
  }
}
