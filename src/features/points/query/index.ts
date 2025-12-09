import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createPointCategory,
    createPointEvent,
    createPointLog,
    createPointPerson,
    deletePointCategory,
    deletePointEvent,
    deletePointPerson,
    getPointCategoriesList,
    getPointEventList,
    getPointLogList,
    getPointPersonList,
    getPointRanking,
    updatePointCategory,
    updatePointEvent,
    updatePointPerson,
} from "./api";

// --- Person ---
export const usePointPersonList = (params: any) => {
    return useQuery({
        queryKey: ["pointPersonList", params],
        queryFn: () => getPointPersonList(params),
    });
};

export const useCreatePointPerson = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPointPerson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pointPersonList"] });
        },
    });
};

export const useUpdatePointPerson = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updatePointPerson(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pointPersonList"] });
        },
    });
};

export const useDeletePointPerson = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePointPerson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pointPersonList"] });
        },
    });
};

// --- Categories ---
export const usePointCategoriesList = () => {
    return useQuery({
        queryKey: ["pointCategoriesList"],
        queryFn: getPointCategoriesList,
    });
};

export const useCreatePointCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPointCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pointCategoriesList"] });
        },
    });
};

export const useUpdatePointCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updatePointCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pointCategoriesList"] });
        },
    });
};

export const useDeletePointCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePointCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pointCategoriesList"] });
        },
    });
};

// --- Events ---
export const usePointEventList = (params: any) => {
    return useQuery({
        queryKey: ["pointEventList", params],
        queryFn: () => getPointEventList(params),
    });
};

export const useCreatePointEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPointEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pointEventList"] });
        },
    });
};

export const useUpdatePointEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updatePointEvent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pointEventList"] });
        },
    });
};

export const useDeletePointEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePointEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pointEventList"] });
        },
    });
};

// --- Logs & Ranking ---
export const usePointLogList = (params: any) => {
    return useQuery({
        queryKey: ["pointLogList", params],
        queryFn: () => getPointLogList(params),
    });
};

export const useCreatePointLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPointLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pointLogList"] });
            queryClient.invalidateQueries({ queryKey: ["pointRanking"] });
        },
    });
};

export const usePointRanking = (month: string) => {
    return useQuery({
        queryKey: ["pointRanking", month],
        queryFn: () => getPointRanking(month),
    });
};
