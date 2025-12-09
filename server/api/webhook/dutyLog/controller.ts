import type { Context } from "hono";

import {
  sendDutyLogWebhook,
  type DutyLogWebhookPayload,
} from "./service";

const parsePayload = (body: unknown): DutyLogWebhookPayload => {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const { dutyLogId } = body as {
    dutyLogId?: unknown;
  };

  const parsedDutyLogId =
    typeof dutyLogId === "number"
      ? dutyLogId
      : typeof dutyLogId === "string"
        ? Number.parseInt(dutyLogId, 10)
        : NaN;

  if (!Number.isInteger(parsedDutyLogId) || parsedDutyLogId <= 0) {
    throw new Error("`dutyLogId` must be a positive integer");
  }

  return {
    dutyLogId: parsedDutyLogId,
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
