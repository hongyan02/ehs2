import { Context } from "hono";
import { z } from "zod";
import {
  getApprovers,
  createApprover,
  updateApprover,
  deleteApprover,
} from "./services";

// Zod schemas
const createApproverSchema = z.object({
  name: z.string().min(1),
  no: z.string().min(1),
  status: z.number().optional(),
});

const updateApproverSchema = z.object({
  name: z.string().min(1).optional(),
  no: z.string().min(1).optional(),
  status: z.number().optional(),
});

export const getApproversController = async (c: Context) => {
  const approvers = await getApprovers();
  return c.json({ success: true, data: approvers });
};

export const createApproverController = async (c: Context) => {
  const body = await c.req.json();
  const data = createApproverSchema.parse(body);
  const approver = await createApprover(data);
  return c.json({ success: true, data: approver }, 201);
};

export const updateApproverController = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ success: false, message: "无效的ID" }, 400);
  }
  const body = await c.req.json();
  const data = updateApproverSchema.parse(body);
  const approver = await updateApprover(id, data);
  if (!approver) {
    return c.json({ success: false, message: "审批人员不存在" }, 404);
  }
  return c.json({ success: true, data: approver });
};

export const deleteApproverController = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ success: false, message: "无效的ID" }, 400);
  }
  const approver = await deleteApprover(id);
  if (!approver) {
    return c.json({ success: false, message: "审批人员不存在" }, 404);
  }
  return c.json({ success: true, data: approver });
};
