import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import { contractAlerts, alertHistory, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Alerts Router", () => {
  let db: any;
  let testUserId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test user
    const result = await db.insert(users).values({
      openId: `test-user-${Date.now()}`,
      name: "Test User",
      email: "test@example.com",
      loginMethod: "test",
      role: "user",
    });

    testUserId = result[0].insertId;
  });

  afterAll(async () => {
    if (!db) return;

    // Clean up test data
    await db.delete(alertHistory).where(eq(alertHistory.alertId, 1));
    await db.delete(contractAlerts).where(eq(contractAlerts.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should create a new contract alert", async () => {
    if (!db) throw new Error("Database not available");

    const result = await db.insert(contractAlerts).values({
      userId: testUserId,
      name: "Test Alert",
      searchKeywords: JSON.stringify(["software", "cloud"]),
      minValue: 50000,
      maxValue: 500000,
      difficulty: "moderate",
      category: "IT Services",
      setAside: "Small Business",
      emailFrequency: "daily",
      minTierRequired: "scout",
    });

    expect(result).toBeDefined();
    expect(result[0].affectedRows).toBe(1);
  });

  it("should list user alerts", async () => {
    if (!db) throw new Error("Database not available");

    const alerts = await db
      .select()
      .from(contractAlerts)
      .where(eq(contractAlerts.userId, testUserId));

    expect(Array.isArray(alerts)).toBe(true);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].name).toBe("Test Alert");
  });

  it("should update an alert", async () => {
    if (!db) throw new Error("Database not available");

    // Get the alert we created
    const alerts = await db
      .select()
      .from(contractAlerts)
      .where(eq(contractAlerts.userId, testUserId));

    const alertId = alerts[0].id;

    // Update it
    await db
      .update(contractAlerts)
      .set({ name: "Updated Alert" })
      .where(eq(contractAlerts.id, alertId));

    // Verify update
    const updated = await db
      .select()
      .from(contractAlerts)
      .where(eq(contractAlerts.id, alertId));

    expect(updated[0].name).toBe("Updated Alert");
  });

  it("should delete an alert", async () => {
    if (!db) throw new Error("Database not available");

    // Create another alert to delete
    const result = await db.insert(contractAlerts).values({
      userId: testUserId,
      name: "Alert to Delete",
      searchKeywords: JSON.stringify(["test"]),
      emailFrequency: "daily",
      minTierRequired: "scout",
    });

    const alertId = result[0].insertId;

    // Delete it
    await db.delete(contractAlerts).where(eq(contractAlerts.id, alertId));

    // Verify deletion
    const deleted = await db
      .select()
      .from(contractAlerts)
      .where(eq(contractAlerts.id, alertId));

    expect(deleted.length).toBe(0);
  });

  it("should parse keywords correctly", async () => {
    if (!db) throw new Error("Database not available");

    const keywords = ["software", "cloud", "infrastructure"];
    const jsonString = JSON.stringify(keywords);
    const parsed = JSON.parse(jsonString);

    expect(parsed).toEqual(keywords);
    expect(parsed.length).toBe(3);
  });

  it("should store alert history", async () => {
    if (!db) throw new Error("Database not available");

    // Get an alert
    const alerts = await db
      .select()
      .from(contractAlerts)
      .where(eq(contractAlerts.userId, testUserId));

    if (alerts.length === 0) throw new Error("No alerts found");

    const alertId = alerts[0].id;

    // Record alert history
    const result = await db.insert(alertHistory).values({
      alertId: alertId,
      contractId: 1,
    });

    expect(result[0].affectedRows).toBe(1);

    // Verify history was recorded
    const history = await db
      .select()
      .from(alertHistory)
      .where(eq(alertHistory.alertId, alertId));

    expect(history.length).toBeGreaterThan(0);
  });
});
