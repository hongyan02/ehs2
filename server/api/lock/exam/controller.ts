import { Context } from "hono";
import { z } from "zod";
import { submitExamResult, getExamResult } from "./services";

// Submit exam result schema
const examResultSchema = z.object({
  applicationId: z.number(),
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  examDate: z.string(),
  remark: z.string().optional(),
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
