import { useQuery, useMutation } from "@tanstack/react-query";
import {
  createLockApplication,
  getLockApplication,
  getLockApplications,
  getMyApplications,
  getAllApplications,
  getAllLockDetails,
  queryApplicationsByEmployeeNo,
  submitExamResult,
  submitApproval,
  getPendingApprovals,
  type LockApplicationStep1,
  type ExamResult,
  type Approval,
} from "./api";

export const useCreateLockApplication = () => {
  return useMutation({
    mutationFn: createLockApplication,
  });
};

export const useLockApplication = (id: number) => {
  return useQuery({
    queryKey: ["lockApplication", id],
    queryFn: async () => {
      const res = await getLockApplication(id);
      return res.data.data;
    },
    enabled: !!id,
  });
};

export const useLockApplications = (params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["lockApplications", params],
    queryFn: async () => {
      const res = await getLockApplications(params);
      return res.data.data;
    },
  });
};

export const useMyApplications = (params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["myLockApplications", params],
    queryFn: async () => {
      const res = await getMyApplications(params);
      return res.data.data;
    },
  });
};

export const useAllApplications = (params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["allLockApplications", params],
    queryFn: async () => {
      const res = await getAllApplications(params);
      return res.data.data;
    },
  });
};

export const useAllLockDetails = (params?: {
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: ["allLockDetails", params],
    queryFn: async () => {
      const res = await getAllLockDetails(params);
      return res.data.data;
    },
  });
};

export const useQueryByEmployeeNo = (employeeNo: string) => {
  return useQuery({
    queryKey: ["queryByEmployeeNo", employeeNo],
    queryFn: async () => {
      const res = await queryApplicationsByEmployeeNo(employeeNo);
      return res.data.data;
    },
    enabled: !!employeeNo,
  });
};

export const useSubmitExamResult = () => {
  return useMutation({
    mutationFn: submitExamResult,
  });
};

export const useSubmitApproval = () => {
  return useMutation({
    mutationFn: submitApproval,
  });
};

export const usePendingApprovals = (params?: {
  page?: number;
  pageSize?: number;
  level?: number;
}) => {
  return useQuery({
    queryKey: ["pendingApprovals", params],
    queryFn: async () => {
      const res = await getPendingApprovals(params);
      return res.data.data;
    },
  });
};

export type { LockApplicationStep1, ExamResult, Approval };
