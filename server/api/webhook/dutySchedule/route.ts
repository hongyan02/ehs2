import { Hono } from "hono";
import { dutyScheduleWebhookController } from "./controller";

const dutyScheduleRoute = new Hono();

dutyScheduleRoute.post("/dutySchedule", dutyScheduleWebhookController);

export default dutyScheduleRoute;
