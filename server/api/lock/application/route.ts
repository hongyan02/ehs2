import { Hono } from "hono";
import {
  getApplicationsController,
  getApplicationByIdController,
  createApplicationController,
  updateApplicationController,
} from "./controller";

const route = new Hono();

route.get("/", getApplicationsController);
route.get("/:id", getApplicationByIdController);
route.post("/", createApplicationController);
route.patch("/:id", updateApplicationController);

export default route;
