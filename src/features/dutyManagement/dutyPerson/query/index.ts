import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDutyPersons,
  getDutyPersonById,
  createDutyPerson,
  updateDutyPerson,
  deleteDutyPerson,
  type GetDutyPersonParams,
  type DutyPersonData,
  type DutyPersonPayload,
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

export const useDutyPersons = (params: GetDutyPersonParams) => {
  return useQuery<PaginatedResponse<DutyPersonData>>({
    queryKey: ["dutyPersons", params],
    queryFn: async () => {
      try {
        const res = await getDutyPersons(params);
        if (res?.data?.data) {
          return res.data.data;
        }
      } catch (error) {
        console.error("获取值班人员失败:", error);
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

export const useDutyPersonById = (id: number, enabled = true) => {
  return useQuery<DutyPersonData>({
    queryKey: ["dutyPerson", id],
    queryFn: async () => {
      const res = await getDutyPersonById(id);
      return res.data.data;
    },
    enabled,
  });
};

export const useCreateDutyPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DutyPersonPayload) => {
      const res = await createDutyPerson(data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dutyPersons"] });
    },
  });
};

export const useUpdateDutyPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<DutyPersonPayload>;
    }) => {
      const res = await updateDutyPerson(id, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dutyPersons"] });
      queryClient.invalidateQueries({ queryKey: ["dutyPerson"] });
    },
  });
};

export const useDeleteDutyPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteDutyPerson(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dutyPersons"] });
    },
  });
};

export type { GetDutyPersonParams, DutyPersonData, DutyPersonPayload };
