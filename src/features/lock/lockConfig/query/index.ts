import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConfigs,
  getProcessConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  type LockConfig,
} from "./api";

export const useLockConfigs = (type?: string) => {
  return useQuery({
    queryKey: ["lockConfigs", type],
    queryFn: async () => {
      const res = await getConfigs(type ? { type } : undefined);
      return res.data.data as LockConfig[];
    },
  });
};

export const useProcessConfigs = () => {
  return useQuery({
    queryKey: ["processConfigs"],
    queryFn: async () => {
      const res = await getProcessConfigs();
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
      queryClient.invalidateQueries({ queryKey: ["processConfigs"] });
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
      queryClient.invalidateQueries({ queryKey: ["processConfigs"] });
    },
  });
};

export const useDeleteLockConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockConfigs"] });
      queryClient.invalidateQueries({ queryKey: ["processConfigs"] });
    },
  });
};

export type { LockConfig };
