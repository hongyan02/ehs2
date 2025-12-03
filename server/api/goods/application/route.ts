import { Hono } from "hono";
import {
    getApplicationsController,
    getApplicationByIdController,
    createApplicationController,
    updateApplicationController,
    deleteApplicationController,
} from "./controller";

const applicationRoute = new Hono();

applicationRoute.get("/", getApplicationsController);
applicationRoute.get("/:id", getApplicationByIdController);
applicationRoute.post("/", createApplicationController);
applicationRoute.put("/:id", updateApplicationController);
applicationRoute.delete("/:id", deleteApplicationController);

export default applicationRoute;
