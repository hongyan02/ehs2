import { Hono } from "hono";
import { dutyInspectionWebhookController } from "./controller";

const dutyInspectionRoute = new Hono();

dutyInspectionRoute.post("/dutyInspection", dutyInspectionWebhookController);

export default dutyInspectionRoute;
