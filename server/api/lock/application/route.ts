import { Hono } from "hono";
import { anonymousAccessMiddleware } from "../../../middleware/anonymous";
import { authMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/auth";
import {
  getApplicationsController,
  getApplicationByIdController,
  createApplicationController,
  updateApplicationController,
  getMyApplicationsController,
  getAllApplicationsController,
  getAllLockDetailsController,
  queryByEmployeeNoController,
} from "./controller";

const route = new Hono();

// Public endpoints - anonymous access
route.post("/", anonymousAccessMiddleware, createApplicationController);
route.get("/query/:employeeNo", queryByEmployeeNoController);

// Protected endpoints - require authentication
route.get("/", getApplicationsController);
route.get("/my", authMiddleware, getMyApplicationsController);
route.get("/all", authMiddleware, requirePermission("LOCK_VIEW_ALL"), getAllApplicationsController);
route.get("/locks", authMiddleware, requirePermission("LOCK_VIEW_ALL"), getAllLockDetailsController);
route.get("/:id", getApplicationByIdController);
route.patch("/:id", updateApplicationController);

export default route;
