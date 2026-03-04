import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getLockInventory,
  getLockTypeOptions,
  getDepartmentOptions,
  updateInventoryStatus,
  type LockInventoryParams,
} from "./api";

export const useLockInventory = (params?: LockInventoryParams) => {
  return useQuery({
    queryKey: ["lockInventory", params],
    queryFn: async () => {
      const res = await getLockInventory(params);
      return res.data.data;
    },
  });
};

export const useLockTypeOptions = () => {
  return useQuery({
    queryKey: ["lockTypeOptions"],
    queryFn: async () => {
      const res = await getLockTypeOptions();
      return res.data.data;
    },
  });
};

export const useDepartmentOptions = () => {
  return useQuery({
    queryKey: ["departmentOptions"],
    queryFn: async () => {
      const res = await getDepartmentOptions();
      return res.data.data;
    },
  });
};

export const useUpdateInventoryStatus = () => {
  return useMutation({
    mutationFn: ({ lockNumber, status }: { lockNumber: string; status: "in_use" | "returned" | "scrapped" }) =>
      updateInventoryStatus(lockNumber, status),
  });
};
