import { Hono } from "hono";
import { authMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/auth";
import {
  getApproversController,
  createApproverController,
  updateApproverController,
  deleteApproverController,
} from "./controller";

const route = new Hono();

// 所有接口需要登录且有ADMIN权限
route.get("/", authMiddleware, getApproversController);
route.post("/", authMiddleware, requirePermission("ADMIN"), createApproverController);
route.put("/:id", authMiddleware, requirePermission("ADMIN"), updateApproverController);
route.delete("/:id", authMiddleware, requirePermission("ADMIN"), deleteApproverController);

export default route;
