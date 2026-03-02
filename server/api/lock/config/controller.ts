import { Context } from "hono";
import { z } from "zod";
import {
  getConfigs,
  getProcessConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
} from "./services";

// Zod schemas
const createConfigSchema = z.object({
  type: z.enum(["department", "process", "team"]),
  name: z.string().min(1),
  code: z.string().optional(),
  managerName: z.string().optional(),
  managerNo: z.string().optional(),
  safetyEngineerName: z.string().optional(),
  safetyEngineerNo: z.string().optional(),
  sortOrder: z.number().optional(),
  status: z.number().optional(),
});

const updateConfigSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  managerName: z.string().optional(),
  managerNo: z.string().optional(),
  safetyEngineerName: z.string().optional(),
  safetyEngineerNo: z.string().optional(),
  sortOrder: z.number().optional(),
  status: z.number().optional(),
});

export const getConfigsController = async (c: Context) => {
  const type = c.req.query("type");
  const configs = await getConfigs(type);
  return c.json({ success: true, data: configs });
};

export const getProcessConfigsController = async (c: Context) => {
  const configs = await getProcessConfigs();
  return c.json({ success: true, data: configs });
};

export const createConfigController = async (c: Context) => {
  const body = await c.req.json();
  const data = createConfigSchema.parse(body);
  const config = await createConfig(data);
  return c.json({ success: true, data: config }, 201);
};

export const updateConfigController = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ success: false, message: "无效的ID" }, 400);
  }
  const body = await c.req.json();
  const data = updateConfigSchema.parse(body);
  const config = await updateConfig(id, data);
  if (!config) {
    return c.json({ success: false, message: "配置不存在" }, 404);
  }
  return c.json({ success: true, data: config });
};

export const deleteConfigController = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ success: false, message: "无效的ID" }, 400);
  }
  const config = await deleteConfig(id);
  if (!config) {
    return c.json({ success: false, message: "配置不存在" }, 404);
  }
  return c.json({ success: true, data: config });
};
