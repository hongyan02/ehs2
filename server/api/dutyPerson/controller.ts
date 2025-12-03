import { Context } from "hono";
import { z } from "zod";
import {
    getDutyPersons,
    getDutyPersonById,
    createDutyPerson,
    updateDutyPerson,
    deleteDutyPerson,
} from "./services";

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
    .refine((val) => val === undefined || val === 0 || val === 1, {
        message: "班次必须为0或1",
    });

const shiftBodySchema = z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => val === 0 || val === 1, {
        message: "班次必须为0或1",
    });

const getDutyPersonsSchema = z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    pageSize: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10)),
    name: optionalText,
    no: optionalText,
    shift: shiftQuerySchema,
});

const createDutyPersonSchema = z.object({
    name: z.string().min(1, "姓名不能为空"),
    no: z.string().min(1, "工号不能为空"),
    position: optionalText,
    shift: shiftBodySchema,
    phone: optionalText,
});

const updateDutyPersonSchema = z.object({
    name: z.string().min(1, "姓名不能为空").optional(),
    no: z.string().min(1, "工号不能为空").optional(),
    position: optionalText,
    shift: shiftBodySchema.optional(),
    phone: optionalText,
});

export const getDutyPersonsController = async (c: Context) => {
    try {
        const params = getDutyPersonsSchema.parse(c.req.query());
        const result = await getDutyPersons(params);
        return c.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        console.error("getDutyPersonsController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const getDutyPersonByIdController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        if (Number.isNaN(id)) {
            return c.json({ success: false, message: "无效的ID" }, 400);
        }

        const result = await getDutyPersonById(id);
        if (!result) {
            return c.json({ success: false, message: "未找到该值班人员" }, 404);
        }

        return c.json({ success: true, data: result });
    } catch (error) {
        console.error("getDutyPersonByIdController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const createDutyPersonController = async (c: Context) => {
    try {
        const body = await c.req.json();
        const validated = createDutyPersonSchema.parse(body);
        const payload = {
            ...validated,
            position: validated.position ?? null,
            phone: validated.phone ?? null,
        };
        const result = await createDutyPerson(payload);
        return c.json({ success: true, data: result }, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        console.error("createDutyPersonController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const updateDutyPersonController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        if (Number.isNaN(id)) {
            return c.json({ success: false, message: "无效的ID" }, 400);
        }

        const body = await c.req.json();
        const validated = updateDutyPersonSchema.parse(body);
        const existing = await getDutyPersonById(id);

        if (!existing) {
            return c.json({ success: false, message: "未找到该值班人员" }, 404);
        }

        const payload: Parameters<typeof updateDutyPerson>[0] = { id };

        if (validated.name !== undefined) payload.name = validated.name;
        if (validated.no !== undefined) payload.no = validated.no;
        if (validated.position !== undefined) payload.position = validated.position ?? null;
        if (validated.shift !== undefined) payload.shift = validated.shift;
        if (validated.phone !== undefined) payload.phone = validated.phone ?? null;

        const result = await updateDutyPerson(payload);
        return c.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        console.error("updateDutyPersonController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const deleteDutyPersonController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        if (Number.isNaN(id)) {
            return c.json({ success: false, message: "无效的ID" }, 400);
        }

        const existing = await getDutyPersonById(id);
        if (!existing) {
            return c.json({ success: false, message: "未找到该值班人员" }, 404);
        }

        await deleteDutyPerson(id);
        return c.json({ success: true, message: "删除成功" });
    } catch (error) {
        console.error("deleteDutyPersonController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};
