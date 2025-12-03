import type { Context } from "hono";

import {
  sendDutyLogWebhook,
  type DutyLogWebhookPayload,
} from "./service";

const parsePayload = (body: unknown): DutyLogWebhookPayload => {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const { key, content } = body as {
    key?: unknown;
    content?: unknown;
  };

  if (typeof key !== "string") {
    throw new Error("`key` must be a string");
  }

  if (typeof content !== "string") {
    throw new Error("`content` must be a string");
  }

  return {
    key,
    content,
  };
};

export const dutyLogController = async (c: Context) => {
  let payload: DutyLogWebhookPayload;

  try {
    const body = await c.req.json();
    payload = parsePayload(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request payload";
    return c.json({ success: false, message }, 400);
  }

  try {
    const result = await sendDutyLogWebhook(payload);
    return c.json({ success: true, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to push duty log";
    return c.json({ success: false, message }, 502);
  }
};
