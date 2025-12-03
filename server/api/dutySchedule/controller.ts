import { Context } from "hono";
import { z } from "zod";
import {
  createDutySchedule,
  deleteDutySchedule,
  getDutyScheduleById,
  getDutyScheduleList,
  updateDutySchedule,
} from "./services";

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为YYYY-MM-DD");

const optionalText = z
  .string()
  .optional()
  .transform((val) => (val?.trim() ? val.trim() : undefined));

const shiftQuerySchema = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  })
  .refine((val) => val === undefined || val === -1 || val === 0 || val === 1, {
    message: "班次必须为-1、0或1",
  });

const shiftBodySchema = z
  .union([z.number(), z.string()])
  .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
  .refine((val) => val === 0 || val === 1, { message: "班次必须为0或1" });

const getDutyScheduleSchema = z.object({
  start_duty_date: dateStringSchema.optional(),
  end_duty_date: dateStringSchema.optional(),
  shift: shiftQuerySchema,
});

const createDutyScheduleSchema = z.object({
  date: dateStringSchema,
  shift: shiftBodySchema,
  name: z.string().min(1, "姓名不能为空"),
  no: z.string().min(1, "工号不能为空"),
  position: optionalText,
});

const updateDutyScheduleSchema = z.object({
  date: dateStringSchema.optional(),
  shift: shiftBodySchema.optional(),
  name: z.string().min(1, "姓名不能为空").optional(),
  no: z.string().min(1, "工号不能为空").optional(),
  position: optionalText,
});

export const getDutyScheduleController = async (c: Context) => {
  try {
    const params = getDutyScheduleSchema.parse(c.req.query());
    const result = await getDutyScheduleList({
      startDutyDate: params.start_duty_date,
      endDutyDate: params.end_duty_date,
      shift: params.shift,
    });

    return c.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: error.issues }, 400);
    }

    console.error("getDutyScheduleController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

export const getDutyScheduleByIdController = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) {
      return c.json({ success: false, message: "无效的ID" }, 400);
    }

    const result = await getDutyScheduleById(id);
    if (!result) {
      return c.json({ success: false, message: "未找到对应值班表" }, 404);
    }

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("getDutyScheduleByIdController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

export const createDutyScheduleController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validated = createDutyScheduleSchema.parse(body);
    const payload = {
      ...validated,
      position: validated.position ?? null,
    };

    const result = await createDutySchedule(payload);
    return c.json({ success: true, data: result }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: error.issues }, 400);
    }

    console.error("createDutyScheduleController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

export const updateDutyScheduleController = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) {
      return c.json({ success: false, message: "无效的ID" }, 400);
    }

    const body = await c.req.json();
    const validated = updateDutyScheduleSchema.parse(body);
    const existing = await getDutyScheduleById(id);

    if (!existing) {
      return c.json({ success: false, message: "未找到对应值班表" }, 404);
    }

    const payload: Parameters<typeof updateDutySchedule>[0] = { id };

    if (validated.date !== undefined) payload.date = validated.date;
    if (validated.shift !== undefined) payload.shift = validated.shift;
    if (validated.name !== undefined) payload.name = validated.name;
    if (validated.no !== undefined) payload.no = validated.no;
    if (validated.position !== undefined) {
      payload.position = validated.position ?? null;
    }

    const result = await updateDutySchedule(payload);
    return c.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: error.issues }, 400);
    }

    console.error("updateDutyScheduleController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

export const deleteDutyScheduleController = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) {
      return c.json({ success: false, message: "无效的ID" }, 400);
    }

    const existing = await getDutyScheduleById(id);
    if (!existing) {
      return c.json({ success: false, message: "未找到对应值班表" }, 404);
    }

    await deleteDutySchedule(id);
    return c.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("deleteDutyScheduleController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};
