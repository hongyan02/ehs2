import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createPointCategory,
    createPointEvent,
    createPointLog,
    createPointPerson,
    deletePointCategory,
    deletePointEvent,
    deletePointLog,
    deletePointPerson,
    getPointCategoriesList,
    getPointEventList,
    getPointLogList,
    getPointPersonList,
    getPointRanking,
    getPointTotalRanking,
    updatePointCategory,
    updatePointEvent,
    updatePointPerson,
    getKpiList,
    getKpiRecords,
    syncKpiRecords,
    createKpiRecord,
    updateKpiRecord,
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

export const useDeletePointLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePointLog,
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

export const usePointTotalRanking = () => {
    return useQuery({
        queryKey: ["pointTotalRanking"],
        queryFn: () => getPointTotalRanking(),
    });
};

export const useKpiList = (params: { nf: string; mon: string }) => {
    return useQuery({
        queryKey: ["kpiList", params],
        queryFn: () =>
            getKpiList({
                nf: params.nf,
                mon: params.mon,
                qy: "0",
                postId: "4",
                depId: "374",
            }),
    });
};

export const useKpiRecords = (year: string) => {
    return useQuery({
        queryKey: ["kpiRecords", year],
        queryFn: () => getKpiRecords(year),
    });
};

export const useSyncKpi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: syncKpiRecords,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kpiRecords"] });
        },
    });
};

export const useCreateKpi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createKpiRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kpiRecords"] });
        },
    });
};

export const useUpdateKpi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateKpiRecord(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kpiRecords"] });
        },
    });
};
