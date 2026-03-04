import { Hono } from "hono";
import { authMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/auth";
import {
  getLockInventoryController,
  getLockTypeOptionsController,
  getDepartmentOptionsController,
  updateInventoryStatusController,
} from "./controller";

const route = new Hono();

// 获取库存列表（包括通过 action 参数获取选项）
route.get("/", authMiddleware, requirePermission("LOCK_VIEW_ALL"), async (c: any) => {
  const action = c.req.query("action");

  if (action === "lockTypes") {
    return getLockTypeOptionsController(c);
  }
  if (action === "departments") {
    return getDepartmentOptionsController(c);
  }

  return getLockInventoryController(c);
});

// 更新库存状态
route.patch("/", authMiddleware, requirePermission("LOCK_ADMIN"), updateInventoryStatusController);

export default route;
