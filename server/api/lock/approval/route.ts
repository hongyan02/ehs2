import { Hono } from "hono";
import {
  submitApprovalController,
  getPendingApprovalsController,
  getApprovalHistoryController,
} from "./controller";

const route = new Hono();

route.post("/", submitApprovalController);
route.get("/pending", getPendingApprovalsController);
route.get("/history/:applicationId", getApprovalHistoryController);

export default route;
