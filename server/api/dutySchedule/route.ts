import { Hono } from "hono";
import {
  createDutyScheduleController,
  deleteDutyScheduleController,
  getDutyScheduleByIdController,
  getDutyScheduleController,
  updateDutyScheduleController,
} from "./controller";
import changeRoute from "./change/route";
import { authMiddleware, requirePermission } from "../../middleware/auth";

const dutyScheduleRoute = new Hono();

// 查询操作 - 不需要登录
dutyScheduleRoute.get("/", getDutyScheduleController);
dutyScheduleRoute.get("/:id", getDutyScheduleByIdController);

// 修改操作 - 需要登录且需要 DUTY 权限
dutyScheduleRoute.post("/", authMiddleware, requirePermission("DUTY"), createDutyScheduleController);
dutyScheduleRoute.delete("/:id", authMiddleware, requirePermission("DUTY"), deleteDutyScheduleController);
dutyScheduleRoute.put("/:id", authMiddleware, requirePermission("DUTY"), updateDutyScheduleController);
// 换班申请相关路由
dutyScheduleRoute.route("/change", changeRoute);

export default dutyScheduleRoute;
