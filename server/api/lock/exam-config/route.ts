import { Hono } from "hono";
import { authMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/auth";
import { anonymousAccessMiddleware } from "../../../middleware/anonymous";
import {
  getExamConfigController,
  getAllExamConfigsController,
  saveExamConfigController,
  uploadPracticeFileController,
} from "./controller";

const route = new Hono();

// 获取配置公开接口
route.get("/", anonymousAccessMiddleware, getExamConfigController);

// 需要管理员权限
route.get("/all", authMiddleware, requirePermission("LOCK_VIEW_ALL"), getAllExamConfigsController);
route.post("/", authMiddleware, requirePermission("LOCK_VIEW_ALL"), saveExamConfigController);

// 上传实操考核文件
route.post("/practice-file", authMiddleware, requirePermission("LOCK_VIEW_ALL"), uploadPracticeFileController);

export default route;
