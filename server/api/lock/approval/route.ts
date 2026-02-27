import { Hono } from "hono";
import { authMiddleware } from "../../../middleware/auth";
import {
  submitApprovalController,
  getPendingApprovalsController,
  getApprovalHistoryController,
} from "./controller";

const route = new Hono();

// All routes require authentication
route.use("*", authMiddleware);

route.post("/", submitApprovalController);
route.get("/pending", getPendingApprovalsController);
route.get("/history/:applicationId", getApprovalHistoryController);

export default route;
