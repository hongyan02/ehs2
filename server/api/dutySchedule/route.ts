import { Hono } from "hono";
import {
  createDutyScheduleController,
  deleteDutyScheduleController,
  getDutyScheduleByIdController,
  getDutyScheduleController,
  updateDutyScheduleController,
} from "./controller";

const dutyScheduleRoute = new Hono();

dutyScheduleRoute.get("/", getDutyScheduleController);
dutyScheduleRoute.get("/:id", getDutyScheduleByIdController);
dutyScheduleRoute.post("/", createDutyScheduleController);
dutyScheduleRoute.put("/:id", updateDutyScheduleController);
dutyScheduleRoute.delete("/:id", deleteDutyScheduleController);

export default dutyScheduleRoute;
