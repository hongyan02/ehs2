import { db } from "@server/db/db";
import { permissionDefinition, userPermission } from "@server/db/schema";
import { and, desc, eq, like } from "drizzle-orm";

type PermissionDefinitionInsert = typeof permissionDefinition.$inferInsert;
type UserPermissionInsert = typeof userPermission.$inferInsert;

// ====== 权限定义服务 ======

export interface GetPermissionDefinitionsParams {
    page?: number;
    pageSize?: number;
    code?: string;
    name?: string;
}

export interface CreatePermissionDefinitionParams {
    code: string;
    name: string;
    description?: string | null;
    routes: string; // JSON string
}

export interface UpdatePermissionDefinitionParams {
    id: number;
    code?: string;
    name?: string;
    description?: string | null;
    routes?: string; // JSON string
}

export const getPermissionDefinitions = async (
    params: GetPermissionDefinitionsParams,
) => {
    const { page = 1, pageSize = 10, code, name } = params;

    const conditions: (ReturnType<typeof eq> | ReturnType<typeof like>)[] = [];

    if (code) {
        const fuzzy = `%${code}%`;
        conditions.push(like(permissionDefinition.code, fuzzy));
    }

    if (name) {
        const fuzzy = `%${name}%`;
        conditions.push(like(permissionDefinition.name, fuzzy));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allRows = await db
        .select()
        .from(permissionDefinition)
        .where(whereClause);
    const total = allRows.length;

    const offset = (page - 1) * pageSize;
    const data = await db
        .select()
        .from(permissionDefinition)
        .where(whereClause)
        .orderBy(desc(permissionDefinition.id))
        .limit(pageSize)
        .offset(offset);

    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
};

export const getPermissionDefinitionById = async (id: number) => {
    const result = await db
        .select()
        .from(permissionDefinition)
        .where(eq(permissionDefinition.id, id));
    return result[0];
};

export const createPermissionDefinition = async (
    params: CreatePermissionDefinitionParams,
) => {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const result = await db
        .insert(permissionDefinition)
        .values({
            code: params.code,
            name: params.name,
            description: params.description ?? null,
            routes: params.routes,
            createdAt: now,
            updatedAt: now,
        })
        .returning();

    return result[0];
};

export const updatePermissionDefinition = async (
    params: UpdatePermissionDefinitionParams,
) => {
    const { id, ...rest } = params;
    const updateData: Partial<PermissionDefinitionInsert> = {};

    if (rest.code !== undefined) updateData.code = rest.code;
    if (rest.name !== undefined) updateData.name = rest.name;
    if (rest.description !== undefined) updateData.description = rest.description;
    if (rest.routes !== undefined) updateData.routes = rest.routes;

    if (Object.keys(updateData).length === 0) {
        return getPermissionDefinitionById(id);
    }

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    updateData.updatedAt = now;

    const result = await db
        .update(permissionDefinition)
        .set(updateData)
        .where(eq(permissionDefinition.id, id))
        .returning();

    return result[0];
};

export const deletePermissionDefinition = async (id: number) => {
    const result = await db
        .delete(permissionDefinition)
        .where(eq(permissionDefinition.id, id))
        .returning();
    return result[0];
};

// ====== 用户权限服务 ======

export interface GetUserPermissionsParams {
    page?: number;
    pageSize?: number;
    employeeId?: string;
}

export interface CreateUserPermissionParams {
    employeeId: string;
    permissions: string; // JSON string
}

export interface UpdateUserPermissionParams {
    id: number;
    employeeId?: string;
    permissions?: string; // JSON string
}

export const getUserPermissions = async (params: GetUserPermissionsParams) => {
    const { page = 1, pageSize = 10, employeeId } = params;

    const conditions: ReturnType<typeof like>[] = [];

    if (employeeId) {
        const fuzzy = `%${employeeId}%`;
        conditions.push(like(userPermission.employeeId, fuzzy));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allRows = await db.select().from(userPermission).where(whereClause);
    const total = allRows.length;

    const offset = (page - 1) * pageSize;
    const data = await db
        .select()
        .from(userPermission)
        .where(whereClause)
        .orderBy(desc(userPermission.id))
        .limit(pageSize)
        .offset(offset);

    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
};

export const getUserPermissionById = async (id: number) => {
    const result = await db
        .select()
        .from(userPermission)
        .where(eq(userPermission.id, id));
    return result[0];
};

export const getUserPermissionByEmployeeId = async (employeeId: string) => {
    const result = await db
        .select()
        .from(userPermission)
        .where(eq(userPermission.employeeId, employeeId));
    return result[0];
};

export const createUserPermission = async (
    params: CreateUserPermissionParams,
) => {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const result = await db
        .insert(userPermission)
        .values({
            employeeId: params.employeeId,
            permissions: params.permissions,
            createdAt: now,
            updatedAt: now,
        })
        .returning();

    return result[0];
};

export const updateUserPermission = async (
    params: UpdateUserPermissionParams,
) => {
    const { id, ...rest } = params;
    const updateData: Partial<UserPermissionInsert> = {};

    if (rest.employeeId !== undefined) updateData.employeeId = rest.employeeId;
    if (rest.permissions !== undefined) updateData.permissions = rest.permissions;

    if (Object.keys(updateData).length === 0) {
        return getUserPermissionById(id);
    }

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    updateData.updatedAt = now;

    const result = await db
        .update(userPermission)
        .set(updateData)
        .where(eq(userPermission.id, id))
        .returning();

    return result[0];
};

export const deleteUserPermission = async (id: number) => {
    const result = await db
        .delete(userPermission)
        .where(eq(userPermission.id, id))
        .returning();
    return result[0];
};

/**
 * 获取所有权限定义并构建路由到权限代码的映射
 * @returns Record<string, string> 路由路径 -> 权限代码
 */
export async function getPermissionRouteMap(): Promise<Record<string, string>> {
    try {
        const permissions = await db.select().from(permissionDefinition);

        const routeMap: Record<string, string> = {};

        for (const perm of permissions) {
            const routes = JSON.parse(perm.routes) as string[];
            for (const route of routes) {
                routeMap[route] = perm.code;
            }
        }

        return routeMap;
    } catch (error) {
        console.error("Failed to fetch permission route map:", error);
        return {};
    }
}

/**
 * 获取所有权限定义（不分页，用于构建缓存）
 */
export async function getAllPermissionDefinitions() {
    return db.select().from(permissionDefinition);
}

