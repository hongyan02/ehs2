import { db } from "@server/db/db";
import { webhookConfig } from "@server/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getWebhookConfigs() {
    return await db.select().from(webhookConfig).orderBy(desc(webhookConfig.updatedAt));
}

export async function updateWebhookConfig(id: number, data: { webhookKey: string; description?: string }) {
    // Only allow updating specific fields
    return await db
        .update(webhookConfig)
        .set({
            webhookKey: data.webhookKey,
            description: data.description,
            updatedAt: new Date().toLocaleString(), // Update updatedAt
        })
        .where(eq(webhookConfig.id, id))
        .returning();
}
