import { Hono } from "hono";
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
  getPracticeEligibleController,
  getPracticeCompletedController,
  generateLockNumberController,
  exportPracticeRecordsController,
} from "./controller";

const route = new Hono();

// Public endpoints - anonymous access
route.post("/", createApplicationController);
route.get("/query/:employeeNo", queryByEmployeeNoController);

// Protected endpoints - require authentication
route.get("/", getApplicationsController);
route.get("/my", authMiddleware, getMyApplicationsController);
route.get("/all", authMiddleware, requirePermission("LOCK_VIEW_ALL"), getAllApplicationsController);
route.get("/locks", authMiddleware, requirePermission("LOCK_VIEW_ALL"), getAllLockDetailsController);
// 待实操考核列表
route.get("/practice-eligible", authMiddleware, requirePermission("LOCK_VIEW_ALL"), getPracticeEligibleController);
// 考核记录（已完成实操考核）
route.get("/practice-completed", authMiddleware, requirePermission("LOCK_VIEW_ALL"), getPracticeCompletedController);
// 生成锁具编号
route.post("/generate-lock-number", authMiddleware, requirePermission("LOCK_VIEW_ALL"), generateLockNumberController);
// 导出考核记录
route.post("/export-practice-records", authMiddleware, requirePermission("LOCK_VIEW_ALL"), exportPracticeRecordsController);
route.get("/:id", getApplicationByIdController);
// Update application - requires LOCK_ADMIN permission
route.patch("/:id", authMiddleware, requirePermission("LOCK_ADMIN"), updateApplicationController);

export default route;
