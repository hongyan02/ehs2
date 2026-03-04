import { Context } from "hono";
import { z } from "zod";
import { submitExamResult, getExamResult, applyPracticeExam, submitPracticeResult } from "./services";

// Submit exam result schema
const examResultSchema = z.object({
  applicationId: z.number(),
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  examDate: z.string(),
  remark: z.string().optional(),
});

// Submit practice result schema
const practiceResultSchema = z.object({
  applicationId: z.number(),
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  practiceDate: z.string(),
  remark: z.string().optional(),
  lockType: z.enum(["red", "yellow"]).optional(),
  lockQuantity: z.number().optional(),
  lockNumbers: z.array(z.string()).optional(),
});

// Helper: get current time string
const getCurrentTimeString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const submitExamResultController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validated = examResultSchema.parse(body);

    // Get user from context
    const user = c.get("user") || { name: "Unknown", employeeId: "UNKNOWN" };

    const examRecord = {
      applicationId: validated.applicationId,
      passed: validated.passed ? 1 : 0,
      score: validated.score,
      examDate: validated.examDate,
      remark: validated.remark || null,
      enteredBy: user.employeeId || "UNKNOWN",
      createTime: getCurrentTimeString(),
    };

    const result = await submitExamResult(examRecord, validated.passed);
    return c.json({ success: true, data: result }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: error.issues }, 400);
    }
    console.error("submitExamResultController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

export const getExamResultController = async (c: Context) => {
  try {
    const applicationId = parseInt(c.req.param("applicationId"));
    if (Number.isNaN(applicationId)) {
      return c.json({ success: false, message: "无效的申请ID" }, 400);
    }

    const result = await getExamResult(applicationId);
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("getExamResultController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

// Apply for practice exam controller
export const applyPracticeExamController = async (c: Context) => {
  try {
    const applicationId = parseInt(c.req.param("applicationId"));
    if (Number.isNaN(applicationId)) {
      return c.json({ success: false, message: "无效的申请ID" }, 400);
    }

    const result = await applyPracticeExam(applicationId);
    return c.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ success: false, message: error.message }, 400);
    }
    console.error("applyPracticeExamController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

// Submit practice exam result controller
export const submitPracticeResultController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validated = practiceResultSchema.parse(body);

    // If passed, lockType and lockQuantity are required
    if (validated.passed && (!validated.lockType || !validated.lockQuantity)) {
      return c.json({ success: false, message: "通过时必须选择锁具类型和数量" }, 400);
    }

    const result = await submitPracticeResult({
      applicationId: validated.applicationId,
      passed: validated.passed,
      score: validated.score,
      practiceDate: validated.practiceDate,
      remark: validated.remark,
      lockType: validated.lockType,
      lockQuantity: validated.lockQuantity,
      lockNumbers: validated.lockNumbers,
    });

    return c.json({ success: true, data: result }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: error.issues }, 400);
    }
    if (error instanceof Error) {
      return c.json({ success: false, message: error.message }, 400);
    }
    console.error("submitPracticeResultController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};
