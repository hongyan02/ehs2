import { Hono } from "hono";
import { authMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/auth";
import {
  getConfigsController,
  getProcessConfigsController,
  createConfigController,
  updateConfigController,
  deleteConfigController,
} from "./controller";

const route = new Hono();

// 所有接口需要登录
route.get("/", authMiddleware, getConfigsController);
route.get("/processes", authMiddleware, getProcessConfigsController);
route.post("/", authMiddleware, requirePermission("LOCK_VIEW_ALL"), createConfigController);
route.put("/:id", authMiddleware, requirePermission("LOCK_VIEW_ALL"), updateConfigController);
route.delete("/:id", authMiddleware, requirePermission("LOCK_VIEW_ALL"), deleteConfigController);

export default route;
