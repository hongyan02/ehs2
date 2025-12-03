import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
    type GetApplicationParams,
    type ApplicationData,
    type ApplicationPayload,
} from "./api";

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const useApplications = (params: GetApplicationParams) => {
    return useQuery<PaginatedResponse<ApplicationData>>({
        queryKey: ["applications", params],
        queryFn: async () => {
            try {
                const res = await getApplications(params);
                if (res?.data?.data) {
                    return res.data.data;
                }
            } catch (error) {
                console.error("获取申请单失败:", error);
            }

            return {
                data: [],
                total: 0,
                page: params.page || 1,
                pageSize: params.pageSize || 10,
                totalPages: 0,
            };
        },
    });
};

export const useApplicationById = (id: number, enabled = true) => {
    return useQuery<ApplicationData>({
        queryKey: ["application", id],
        queryFn: async () => {
            const res = await getApplicationById(id);
            return res.data.data;
        },
        enabled,
    });
};

export const useCreateApplication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ApplicationPayload) => {
            const res = await createApplication(data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
        },
    });
};

export const useUpdateApplication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: Partial<ApplicationPayload>;
        }) => {
            const res = await updateApplication(id, data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            queryClient.invalidateQueries({ queryKey: ["application"] });
        },
    });
};

export const useDeleteApplication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await deleteApplication(id);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
        },
    });
};

export type { GetApplicationParams, ApplicationData, ApplicationPayload };
