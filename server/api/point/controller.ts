import { Context } from "hono";
import { z } from "zod";
import {
    createPointCategory,
    createPointEvent,
    createPointLog,
    createPointPerson,
    deletePointCategory,
    deletePointEvent,
    deletePointPerson,
    getMonthlyRanking,
    getPointCategoriesList,
    getPointEventList,
    getPointLogList,
    getPointPersonList,
    updatePointCategory,
    updatePointEvent,
    updatePointPerson,
    getPointPersonByNo,
} from "./services";
import dayjs from "dayjs";

// Validation Schemas

const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).default(10),
});

const getPointPersonSchema = paginationSchema.extend({
    name: z.string().optional(),
    no: z.string().optional(),
    active: z.coerce.number().optional(),
});

const createPointPersonSchema = z.object({
    no: z.string().min(1, "工号不能为空"),
    name: z.string().min(1, "姓名不能为空"),
    dept: z.string().optional(),
    active: z.number().default(1),
});

const updatePointPersonSchema = createPointPersonSchema.partial();

const getPointEventSchema = paginationSchema.extend({
    name: z.string().optional(),
    categoryId: z.coerce.number().optional(),
});

const createPointEventSchema = z.object({
    name: z.string().min(1, "事件名称不能为空"),
    description: z.string().optional(),
    categoryId: z.number(),
    defaultPoint: z.number(),
});

const updatePointEventSchema = createPointEventSchema.partial();

const getPointLogSchema = paginationSchema.extend({
    no: z.string().optional(),
    name: z.string().optional(),
    month: z.string().optional(),
});

const createPointLogSchema = z.object({
    pointName: z.string().min(1, "积分名称不能为空"),
    description: z.string().optional(),
    eventId: z.number(),
    defaultPoint: z.number(),
    point: z.number(),
    no: z.string().min(1, "工号不能为空"),
    // name, dept 可以从 person 表查找，这里接收一下但也可能会覆盖
});

// Controllers

// --- Point Person ---

export const getPointPersonController = async (c: Context) => {
    try {
        const query = c.req.query();
        const params = getPointPersonSchema.parse(query);
        const result = await getPointPersonList(params);
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, message: "参数错误" }, 400);
    }
};

export const createPointPersonController = async (c: Context) => {
    try {
        const body = await c.req.json();
        const parsed = createPointPersonSchema.parse(body);
        const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

        // Check if exists
        const existing = await getPointPersonByNo(parsed.no);
        if (existing) {
            return c.json({ success: false, message: "该工号已存在" }, 400);
        }

        const result = await createPointPerson({
            ...parsed,
            createdAt: now,
            updatedAt: now,
        });
        return c.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const updatePointPersonController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        const body = await c.req.json();
        const parsed = updatePointPersonSchema.parse(body);
        const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

        const result = await updatePointPerson(id, {
            ...parsed,
            updatedAt: now,
        });
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, message: "更新失败" }, 500);
    }
};

export const deletePointPersonController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        await deletePointPerson(id);
        return c.json({ success: true, message: "删除成功" });
    } catch (error) {
        return c.json({ success: false, message: "删除失败" }, 500);
    }
};

// --- Point Categories ---

export const getPointCategoriesController = async (c: Context) => {
    const result = await getPointCategoriesList();
    return c.json({ success: true, data: result });
};

export const createPointCategoryController = async (c: Context) => {
    try {
        const body = await c.req.json();
        const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
        const result = await createPointCategory({
            categoryName: body.categoryName,
            description: body.description,
            createdAt: now,
            updatedAt: now,
        });
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, message: "创建失败" }, 500);
    }
};

export const updatePointCategoryController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        const body = await c.req.json();
        const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
        const result = await updatePointCategory(id, {
            ...body,
            updatedAt: now,
        });
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, message: "更新失败" }, 500);
    }
};

export const deletePointCategoryController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        await deletePointCategory(id);
        return c.json({ success: true, message: "删除成功" });
    } catch (error) {
        return c.json({ success: false, message: "删除失败" }, 500);
    }
};

// --- Point Events ---

export const getPointEventController = async (c: Context) => {
    try {
        const query = c.req.query();
        const params = getPointEventSchema.parse(query);
        const result = await getPointEventList(params);
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, message: "参数错误" }, 400);
    }
};

export const createPointEventController = async (c: Context) => {
    try {
        const body = await c.req.json();
        const parsed = createPointEventSchema.parse(body);
        const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

        const result = await createPointEvent({
            ...parsed,
            createdAt: now,
            updatedAt: now,
        });
        return c.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        return c.json({ success: false, message: "创建失败" }, 500);
    }
};

export const updatePointEventController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        const body = await c.req.json();
        const parsed = updatePointEventSchema.parse(body);
        const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

        const result = await updatePointEvent(id, {
            ...parsed,
            updatedAt: now,
        });
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, message: "更新失败" }, 500);
    }
};

export const deletePointEventController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        await deletePointEvent(id);
        return c.json({ success: true, message: "删除成功" });
    } catch (error) {
        return c.json({ success: false, message: "删除失败" }, 500);
    }
};

// --- Point Log & Ranking ---

export const getPointLogController = async (c: Context) => {
    try {
        const query = c.req.query();
        const params = getPointLogSchema.parse(query);
        const result = await getPointLogList(params);
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, message: "参数错误" }, 400);
    }
};

export const createPointLogController = async (c: Context) => {
    try {
        const body = await c.req.json();
        const parsed = createPointLogSchema.parse(body);

        // Find person info
        const person = await getPointPersonByNo(parsed.no);
        if (!person) {
            return c.json({ success: false, message: "找不到对应工号的人员" }, 400);
        }
        if (person.active === 0) {
            return c.json({ success: false, message: "该人员已被禁用，无法添加积分" }, 400);
        }

        const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
        const month = dayjs().format("YYYY-MM");

        const result = await createPointLog({
            ...parsed,
            name: person.name,
            dept: person.dept || "",
            month: month,
            createdAt: now,
            updatedAt: now,
        });
        return c.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        console.error(error);
        return c.json({ success: false, message: "创建记录失败" }, 500);
    }
};

export const getRankingController = async (c: Context) => {
    try {
        const month = c.req.query("month") || dayjs().format("YYYY-MM");
        const result = await getMonthlyRanking(month);
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, message: "获取排名失败" }, 500);
    }
}
