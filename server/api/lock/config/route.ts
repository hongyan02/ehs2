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
route.post("/", authMiddleware, requirePermission("ADMIN"), createConfigController);
route.put("/:id", authMiddleware, requirePermission("ADMIN"), updateConfigController);
route.delete("/:id", authMiddleware, requirePermission("ADMIN"), deleteConfigController);

export default route;
