import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConfigs,
  getProcessConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  getExamConfig,
  saveExamConfig,
  type LockConfig,
  type LockExamConfig,
} from "./api";

export type { LockConfig, LockExamConfig };

// ============ Lock Config Hooks ============
export const useLockConfigs = (type?: string) => {
  return useQuery({
    queryKey: ["lockConfigs", type],
    queryFn: async () => {
      const res = await getConfigs(type ? { type } : undefined);
      return res.data.data as LockConfig[];
    },
  });
};

export const useCreateLockConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockConfigs"] });
    },
  });
};

export const useUpdateLockConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LockConfig> }) =>
      updateConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockConfigs"] });
    },
  });
};

export const useDeleteLockConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockConfigs"] });
    },
  });
};

// ============ Exam Config Hooks ============
export const useExamConfig = () => {
  return useQuery({
    queryKey: ["lockExamConfig"],
    queryFn: async () => {
      const res = await getExamConfig();
      return res.data.data as LockExamConfig | null;
    },
  });
};

export const useSaveExamConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveExamConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockExamConfig"] });
    },
  });
};
