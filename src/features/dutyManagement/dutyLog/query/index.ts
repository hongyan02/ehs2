import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDutyLogs,
  getDutyLogById,
  createDutyLog,
  updateDutyLog,
  deleteDutyLog,
  type GetDutyLogsParams,
  type DutyLogData,
} from "./api";
import { pushDutyLogWebhook } from "./api";

/**
 * 后端响应类型
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 值班日志查询Hook（支持分页）
 */
export const useDutyLogs = (params: GetDutyLogsParams) => {
  return useQuery<PaginatedResponse<DutyLogData>>({
    queryKey: ["dutyLogs", params],
    queryFn: async () => {
      try {
        const res = await getDutyLogs(params);
        // 确保返回有效的数据结构
        if (res?.data?.data) {
          return res.data.data;
        }
        // 如果数据结构不匹配，返回空结果
        return {
          data: [],
          total: 0,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          totalPages: 0,
        };
      } catch (error) {
        console.error("获取值班日志失败:", error);
        // 返回空结果而不是undefined
        return {
          data: [],
          total: 0,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          totalPages: 0,
        };
      }
    },
  });
};

/**
 * 根据ID查询值班日志Hook
 */
export const useDutyLogById = (id: number, enabled = true) => {
  return useQuery<DutyLogData>({
    queryKey: ["dutyLog", id],
    queryFn: async () => {
      const res = await getDutyLogById(id);
      return res.data.data;
    },
    enabled,
  });
};

/**
 * 创建值班日志Mutation Hook
 */
export const useCreateDutyLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DutyLogData) => {
      const res = await createDutyLog(data);
      return res.data.data;
    },
    onSuccess: () => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ["dutyLogs"] });
    },
  });
};

/**
 * 更新值班日志Mutation Hook
 */
export const useUpdateDutyLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<DutyLogData>;
    }) => {
      const res = await updateDutyLog(id, data);
      return res.data.data;
    },
    onSuccess: () => {
      // 刷新列表和详情
      queryClient.invalidateQueries({ queryKey: ["dutyLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dutyLog"] });
    },
  });
};

/**
 * 删除值班日志Mutation Hook
 */
export const useDeleteDutyLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteDutyLog(id);
      return res.data;
    },
    onSuccess: () => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ["dutyLogs"] });
    },
  });
};

// 导出类型
export type { GetDutyLogsParams, DutyLogData };

/**
 * 创建值班日志并推送微信机器人 Hook
 */
export const useCreateDutyLogWithWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DutyLogData) => {
      const res = await createDutyLog(data);
      const dutyLog = res.data.data;

      const dutyLogId =
        dutyLog?.id ??
        (typeof dutyLog?.no === "string"
          ? Number.parseInt(dutyLog.no, 10)
          : undefined);

      if (!dutyLogId) {
        throw new Error("创建成功，但未获取到日志ID，未推送到微信");
      }

      try {
        await pushDutyLogWebhook({
          key: "7a6d363c-dd0c-4732-abdb-07a7086bb875",
          dutyLogId,
        });
        return { dutyLog, pushed: true };
      } catch (error) {
        return { dutyLog, pushed: false, pushError: error };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dutyLogs"] });
    },
  });
};
