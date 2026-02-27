import { Context } from "hono";
import { z } from "zod";
import { getLockApplications, getLockApplicationById, createLockApplication, updateLockApplication } from "./services";

// Query schema
const querySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  status: z.string().optional(),
});

// Create schema
const createSchema = z.object({
  applicantName: z.string().min(1, "申请人姓名不能为空"),
  applicantNo: z.string().min(1, "申请人工号不能为空"),
  department: z.string().min(1, "部门不能为空"),
  phone: z.string().min(1, "联系电话不能为空"),
  applyUnit: z.string().min(1, "申请单位不能为空"),
  lockDetails: z.array(
    z.object({
      lockType: z.string().min(1, "锁具类型不能为空"),
      specification: z.string().optional(),
      quantity: z.number().min(1, "数量至少为1"),
      purpose: z.string().optional(),
    })
  ).min(1, "至少添加一种锁具"),
});

// Update schema
const updateSchema = z.object({
  status: z.string().optional(),
  currentApprovalLevel: z.number().optional(),
});

// Helper: generate application code
const generateApplicationCode = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).toString().padStart(2, "0");
  const timestamp = now.getTime().toString().slice(-6);
  return `LOCK${year}${month}${day}${timestamp}`;
};

// Helper: get current time string
const getCurrentTimeString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).toString().padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const getApplicationsController = async (c: Context) => {
  try {
    const params = querySchema.parse(c.req.query());
    const result = await getLockApplications(params);
    return c.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: error.issues }, 400);
    }
    console.error("getApplicationsController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

export const getApplicationByIdController = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) {
      return c.json({ success: false, message: "无效的ID" }, 400);
    }

    const result = await getLockApplicationById(id);
    if (!result) {
      return c.json({ success: false, message: "未找到该申请单" }, 404);
    }

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("getApplicationByIdController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

export const createApplicationController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validated = createSchema.parse(body);

    const currentTime = getCurrentTimeString();
    const applicationCode = generateApplicationCode();

    const payload = {
      applicationCode,
      applicantName: validated.applicantName,
      applicantNo: validated.applicantNo,
      department: validated.department,
      phone: validated.phone,
      applyUnit: validated.applyUnit,
      status: "submitted",
      currentApprovalLevel: 1,
      applicationTime: currentTime,
      createTime: currentTime,
      updateTime: currentTime,
    };

    const result = await createLockApplication(payload, validated.lockDetails);
    return c.json({ success: true, data: result }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: error.issues }, 400);
    }
    console.error("createApplicationController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

export const updateApplicationController = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) {
      return c.json({ success: false, message: "无效的ID" }, 400);
    }

    const body = await c.req.json();
    const validated = updateSchema.parse(body);

    const payload = {
      id,
      ...validated,
      updateTime: getCurrentTimeString(),
    };

    const result = await updateLockApplication(payload);
    return c.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: error.issues }, 400);
    }
    console.error("updateApplicationController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};
