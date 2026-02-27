import { Hono } from "hono";
import { anonymousAccessMiddleware } from "../../../middleware/anonymous";
import {
  getApplicationsController,
  getApplicationByIdController,
  createApplicationController,
  updateApplicationController,
} from "./controller";

const route = new Hono();

// Public endpoint - anonymous access with rate limiting
route.post("/", anonymousAccessMiddleware, createApplicationController);

// Protected endpoints - require authentication
route.get("/", getApplicationsController);
route.get("/:id", getApplicationByIdController);
route.patch("/:id", updateApplicationController);

export default route;
