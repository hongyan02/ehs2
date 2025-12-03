import { Hono } from "hono";
import {
    getDutyPersonsController,
    getDutyPersonByIdController,
    createDutyPersonController,
    updateDutyPersonController,
    deleteDutyPersonController,
} from "./controller";

const dutyPersonRoute = new Hono();

dutyPersonRoute.get("/", getDutyPersonsController);
dutyPersonRoute.get("/:id", getDutyPersonByIdController);
dutyPersonRoute.post("/", createDutyPersonController);
dutyPersonRoute.put("/:id", updateDutyPersonController);
dutyPersonRoute.delete("/:id", deleteDutyPersonController);

export default dutyPersonRoute;
