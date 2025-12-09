import { Hono } from "hono";
import * as controller from "./controller";

const webhookRoute = new Hono();

webhookRoute.get("/config", controller.getWebhookConfigs);
webhookRoute.patch("/config/:id", controller.updateWebhookConfig);

export default webhookRoute;
