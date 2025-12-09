import { Context } from "hono";
import * as services from "./services";

export async function getWebhookConfigs(c: Context) {
    const result = await services.getWebhookConfigs();
    return c.json({
        code: 0,
        data: result,
        msg: "success",
    });
}

export async function updateWebhookConfig(c: Context) {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();

    // Basic validation could be added here if needed, but typing handles most
    const { webhookKey, description } = body;

    if (!webhookKey) {
        return c.json({ code: 400, msg: "Webhook Key is required" }, 400);
    }

    const result = await services.updateWebhookConfig(id, { webhookKey, description });

    return c.json({
        code: 0,
        data: result[0], // returning() returns an array
        msg: "success",
    });
}
