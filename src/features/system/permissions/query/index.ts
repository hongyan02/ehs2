import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    GetPermissionDefinitionsParams,
    GetUserPermissionsParams,
    PermissionDefinitionPayload,
    UserPermissionPayload,
} from "./api";

// ====== 权限定义 Hooks ======

export function usePermissionDefinitions(
    params: GetPermissionDefinitionsParams,
) {
    return useQuery({
        queryKey: ["permissionDefinitions", params],
        queryFn: () => getPermissionDefinitions(params),
        select: (response) => response.data,
    });
}

export function usePermissionDefinitionById(id: number) {
    return useQuery({
        queryKey: ["permissionDefinition", id],
        queryFn: () => getPermissionDefinitionById(id),
        select: (response) => response.data,
        enabled: !!id,
    });
}

export function useCreatePermissionDefinition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PermissionDefinitionPayload) =>
            createPermissionDefinition(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permissionDefinitions"] });
        },
    });
}

export function useUpdatePermissionDefinition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Partial<PermissionDefinitionPayload>;
        }) => updatePermissionDefinition(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permissionDefinitions"] });
            queryClient.invalidateQueries({ queryKey: ["permissionDefinition"] });
        },
    });
}

export function useDeletePermissionDefinition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deletePermissionDefinition(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permissionDefinitions"] });
        },
    });
}

// ====== 用户权限 Hooks ======

export function useUserPermissions(params: GetUserPermissionsParams) {
    return useQuery({
        queryKey: ["userPermissions", params],
        queryFn: () => getUserPermissions(params),
        select: (response) => response.data,
    });
}

export function useUserPermissionById(id: number) {
    return useQuery({
        queryKey: ["userPermission", id],
        queryFn: () => getUserPermissionById(id),
        select: (response) => response.data,
        enabled: !!id,
    });
}

export function useCreateUserPermission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UserPermissionPayload) => createUserPermission(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userPermissions"] });
        },
    });
}

export function useUpdateUserPermission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Partial<UserPermissionPayload>;
        }) => updateUserPermission(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userPermissions"] });
            queryClient.invalidateQueries({ queryKey: ["userPermission"] });
        },
    });
}

export function useDeleteUserPermission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteUserPermission(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userPermissions"] });
        },
    });
}
