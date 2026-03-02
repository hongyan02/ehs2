import { Context } from "hono";
import { z } from "zod";
import {
  getExamConfig,
  getAllExamConfigs,
  saveExamConfig,
} from "./services";

// Zod schemas
const saveExamConfigSchema = z.object({
  courseUrl: z.string().optional().or(z.literal("")),
  passingScore: z.number().min(0).max(100).optional(),
  remark: z.string().optional(),
});

export const getExamConfigController = async (c: Context) => {
  const config = await getExamConfig();
  return c.json({ success: true, data: config });
};

export const getAllExamConfigsController = async (c: Context) => {
  const configs = await getAllExamConfigs();
  return c.json({ success: true, data: configs });
};

export const saveExamConfigController = async (c: Context) => {
  const body = await c.req.json();
  const data = saveExamConfigSchema.parse(body);
  const config = await saveExamConfig(data);
  return c.json({ success: true, data: config });
};
