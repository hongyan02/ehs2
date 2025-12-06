import { Context } from "hono";
import { z } from "zod";
import {
    getPermissionDefinitions,
    getPermissionDefinitionById,
    createPermissionDefinition,
    updatePermissionDefinition,
    deletePermissionDefinition,
    getUserPermissions,
    getUserPermissionById,
    createUserPermission,
    updateUserPermission,
    deleteUserPermission,
} from "./services";

const optionalText = z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined));

// ====== 权限定义 Schema ======

const getPermissionDefinitionsSchema = z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    pageSize: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10)),
    code: optionalText,
    name: optionalText,
});

const createPermissionDefinitionSchema = z.object({
    code: z.string().min(1, "权限代码不能为空"),
    name: z.string().min(1, "权限名称不能为空"),
    description: optionalText,
    routes: z
        .array(z.string())
        .min(1, "至少需要一个路由")
        .transform((val) => JSON.stringify(val)),
});

const updatePermissionDefinitionSchema = z.object({
    code: z.string().min(1, "权限代码不能为空").optional(),
    name: z.string().min(1, "权限名称不能为空").optional(),
    description: optionalText,
    routes: z
        .array(z.string())
        .optional()
        .transform((val) => (val ? JSON.stringify(val) : undefined)),
});

// ====== 用户权限 Schema ======

const getUserPermissionsSchema = z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    pageSize: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10)),
    employeeId: optionalText,
});

const createUserPermissionSchema = z.object({
    employeeId: z.string().min(1, "员工ID不能为空"),
    permissions: z
        .array(z.string())
        .min(1, "至少需要一个权限")
        .transform((val) => JSON.stringify(val)),
});

const updateUserPermissionSchema = z.object({
    employeeId: z.string().min(1, "员工ID不能为空").optional(),
    permissions: z
        .array(z.string())
        .optional()
        .transform((val) => (val ? JSON.stringify(val) : undefined)),
});

// ====== 权限定义 Controllers ======

export const getPermissionDefinitionsController = async (c: Context) => {
    try {
        const params = getPermissionDefinitionsSchema.parse(c.req.query());
        const result = await getPermissionDefinitions(params);

        // 将routes从JSON字符串解析为数组
        const dataWithParsedRoutes = result.data.map((item) => ({
            ...item,
            routes: JSON.parse(item.routes),
        }));

        return c.json({
            success: true,
            data: {
                ...result,
                data: dataWithParsedRoutes,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        console.error("getPermissionDefinitionsController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const getPermissionDefinitionByIdController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        if (Number.isNaN(id)) {
            return c.json({ success: false, message: "无效的ID" }, 400);
        }

        const result = await getPermissionDefinitionById(id);
        if (!result) {
            return c.json({ success: false, message: "未找到该权限定义" }, 404);
        }

        return c.json({
            success: true,
            data: {
                ...result,
                routes: JSON.parse(result.routes),
            },
        });
    } catch (error) {
        console.error("getPermissionDefinitionByIdController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const createPermissionDefinitionController = async (c: Context) => {
    try {
        const body = await c.req.json();
        const validated = createPermissionDefinitionSchema.parse(body);
        const payload = {
            ...validated,
            description: validated.description ?? null,
        };
        const result = await createPermissionDefinition(payload);

        return c.json({
            success: true,
            data: {
                ...result,
                routes: JSON.parse(result.routes),
            },
        }, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        console.error("createPermissionDefinitionController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const updatePermissionDefinitionController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        if (Number.isNaN(id)) {
            return c.json({ success: false, message: "无效的ID" }, 400);
        }

        const body = await c.req.json();
        const validated = updatePermissionDefinitionSchema.parse(body);
        const existing = await getPermissionDefinitionById(id);

        if (!existing) {
            return c.json({ success: false, message: "未找到该权限定义" }, 404);
        }

        const payload: Parameters<typeof updatePermissionDefinition>[0] = { id };

        if (validated.code !== undefined) payload.code = validated.code;
        if (validated.name !== undefined) payload.name = validated.name;
        if (validated.description !== undefined)
            payload.description = validated.description ?? null;
        if (validated.routes !== undefined) payload.routes = validated.routes;

        const result = await updatePermissionDefinition(payload);

        return c.json({
            success: true,
            data: {
                ...result,
                routes: JSON.parse(result.routes),
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        console.error("updatePermissionDefinitionController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const deletePermissionDefinitionController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        if (Number.isNaN(id)) {
            return c.json({ success: false, message: "无效的ID" }, 400);
        }

        const existing = await getPermissionDefinitionById(id);
        if (!existing) {
            return c.json({ success: false, message: "未找到该权限定义" }, 404);
        }

        await deletePermissionDefinition(id);
        return c.json({ success: true, message: "删除成功" });
    } catch (error) {
        console.error("deletePermissionDefinitionController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

// ====== 用户权限 Controllers ======

export const getUserPermissionsController = async (c: Context) => {
    try {
        const params = getUserPermissionsSchema.parse(c.req.query());
        const result = await getUserPermissions(params);

        // 将permissions从JSON字符串解析为数组
        const dataWithParsedPermissions = result.data.map((item) => ({
            ...item,
            permissions: JSON.parse(item.permissions),
        }));

        return c.json({
            success: true,
            data: {
                ...result,
                data: dataWithParsedPermissions,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        console.error("getUserPermissionsController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const getUserPermissionByIdController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        if (Number.isNaN(id)) {
            return c.json({ success: false, message: "无效的ID" }, 400);
        }

        const result = await getUserPermissionById(id);
        if (!result) {
            return c.json({ success: false, message: "未找到该用户权限" }, 404);
        }

        return c.json({
            success: true,
            data: {
                ...result,
                permissions: JSON.parse(result.permissions),
            },
        });
    } catch (error) {
        console.error("getUserPermissionByIdController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const createUserPermissionController = async (c: Context) => {
    try {
        const body = await c.req.json();
        const validated = createUserPermissionSchema.parse(body);
        const result = await createUserPermission(validated);

        return c.json({
            success: true,
            data: {
                ...result,
                permissions: JSON.parse(result.permissions),
            },
        }, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        console.error("createUserPermissionController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const updateUserPermissionController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        if (Number.isNaN(id)) {
            return c.json({ success: false, message: "无效的ID" }, 400);
        }

        const body = await c.req.json();
        const validated = updateUserPermissionSchema.parse(body);
        const existing = await getUserPermissionById(id);

        if (!existing) {
            return c.json({ success: false, message: "未找到该用户权限" }, 404);
        }

        const payload: Parameters<typeof updateUserPermission>[0] = { id };

        if (validated.employeeId !== undefined)
            payload.employeeId = validated.employeeId;
        if (validated.permissions !== undefined)
            payload.permissions = validated.permissions;

        const result = await updateUserPermission(payload);

        return c.json({
            success: true,
            data: {
                ...result,
                permissions: JSON.parse(result.permissions),
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: error.issues }, 400);
        }
        console.error("updateUserPermissionController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};

export const deleteUserPermissionController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id"));
        if (Number.isNaN(id)) {
            return c.json({ success: false, message: "无效的ID" }, 400);
        }

        const existing = await getUserPermissionById(id);
        if (!existing) {
            return c.json({ success: false, message: "未找到该用户权限" }, 404);
        }

        await deleteUserPermission(id);
        return c.json({ success: true, message: "删除成功" });
    } catch (error) {
        console.error("deleteUserPermissionController error:", error);
        return c.json({ success: false, message: "服务器错误" }, 500);
    }
};
