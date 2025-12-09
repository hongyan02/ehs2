import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

export interface GetDutyLogsParams {
  page?: number;
  pageSize?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  shift?: number; // 0=白班，1=夜班
}

export interface DutyLogData {
  id?: number;
  name: string;
  no: string;
  date: string; // YYYY-MM-DD
  shift: number; // 0=白班，1=夜班
  log: string;
  todo?: string;
  createTime?: string;
  updateTime?: string;
}

// 获取值班日志列表（带分页）
export function getDutyLogs(params: GetDutyLogsParams) {
  return request.get(API_SERVICE.dutyLog.dutyLog, {
    params,
    headers: { isToken: false },
  });
}

// 根据ID获取值班日志
export function getDutyLogById(id: number) {
  return request.get(`${API_SERVICE.dutyLog.dutyLog}/${id}`, {
    headers: { isToken: false },
  });
}

// 创建值班日志
export function createDutyLog(data: DutyLogData) {
  return request.post(API_SERVICE.dutyLog.dutyLog, data, {
    headers: { isToken: false },
  });
}

// 更新值班日志
export function updateDutyLog(id: number, data: Partial<DutyLogData>) {
  return request.put(`${API_SERVICE.dutyLog.dutyLog}/${id}`, data, {
    headers: { isToken: false },
  });
}

// 删除值班日志
export function deleteDutyLog(id: number) {
  return request.delete(`${API_SERVICE.dutyLog.dutyLog}/${id}`, {
    headers: { isToken: false },
  });
}

export function pushDutyLogWebhook(payload: { dutyLogId: number }) {
  return request.post(API_SERVICE.webhook.dutyLog, payload, {
    headers: { isToken: false },
  });
}
