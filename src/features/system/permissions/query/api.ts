import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

// ====== 权限定义相关 ======

export interface GetPermissionDefinitionsParams {
    page?: number;
    pageSize?: number;
    code?: string;
    name?: string;
}

export interface PermissionDefinitionData {
    id?: number;
    code: string;
    name: string;
    description?: string | null;
    routes: string[]; // 路由数组
    createdAt?: string;
    updatedAt?: string;
}

export type PermissionDefinitionPayload = Omit<
    PermissionDefinitionData,
    "id" | "createdAt" | "updatedAt"
>;

export function getPermissionDefinitions(
    params: GetPermissionDefinitionsParams,
) {
    return request.get(API_SERVICE.permissions.definitions, {
        params,
        headers: { isToken: false },
    });
}

export function getPermissionDefinitionById(id: number) {
    return request.get(`${API_SERVICE.permissions.definitions}/${id}`, {
        headers: { isToken: false },
    });
}

export function createPermissionDefinition(
    data: PermissionDefinitionPayload,
) {
    return request.post(API_SERVICE.permissions.definitions, data, {
        headers: { isToken: false },
    });
}

export function updatePermissionDefinition(
    id: number,
    data: Partial<PermissionDefinitionPayload>,
) {
    return request.put(`${API_SERVICE.permissions.definitions}/${id}`, data, {
        headers: { isToken: false },
    });
}

export function deletePermissionDefinition(id: number) {
    return request.delete(`${API_SERVICE.permissions.definitions}/${id}`, {
        headers: { isToken: false },
    });
}

// ====== 用户权限相关 ======

export interface GetUserPermissionsParams {
    page?: number;
    pageSize?: number;
    employeeId?: string;
}

export interface UserPermissionData {
    id?: number;
    employeeId: string;
    permissions: string[]; // 权限代码数组
    createdAt?: string;
    updatedAt?: string;
}

export type UserPermissionPayload = Omit<
    UserPermissionData,
    "id" | "createdAt" | "updatedAt"
>;

export function getUserPermissions(params: GetUserPermissionsParams) {
    return request.get(API_SERVICE.permissions.users, {
        params,
        headers: { isToken: false },
    });
}

export function getUserPermissionById(id: number) {
    return request.get(`${API_SERVICE.permissions.users}/${id}`, {
        headers: { isToken: false },
    });
}

export function createUserPermission(data: UserPermissionPayload) {
    return request.post(API_SERVICE.permissions.users, data, {
        headers: { isToken: false },
    });
}

export function updateUserPermission(
    id: number,
    data: Partial<UserPermissionPayload>,
) {
    return request.put(`${API_SERVICE.permissions.users}/${id}`, data, {
        headers: { isToken: false },
    });
}

export function deleteUserPermission(id: number) {
    return request.delete(`${API_SERVICE.permissions.users}/${id}`, {
        headers: { isToken: false },
    });
}
