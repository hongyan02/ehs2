import { Hono } from "hono";
import { authMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/auth";
import { anonymousAccessMiddleware } from "../../../middleware/anonymous";
import {
  getExamConfigController,
  getAllExamConfigsController,
  saveExamConfigController,
} from "./controller";

const route = new Hono();

// 获取配置公开接口
route.get("/", anonymousAccessMiddleware, getExamConfigController);

// 需要管理员权限
route.get("/all", authMiddleware, requirePermission("ADMIN"), getAllExamConfigsController);
route.post("/", authMiddleware, requirePermission("ADMIN"), saveExamConfigController);

export default route;
