import { Hono } from "hono";
import { dutyLogController } from "./controller";

const dutyLogRoute = new Hono();

dutyLogRoute.post("/dutyLog", dutyLogController);

export default dutyLogRoute;
