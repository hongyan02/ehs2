import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

export interface LockInventoryParams {
  page?: number;
  pageSize?: number;
  lockType?: string;
  department?: string;
  holderName?: string;
  lockNumber?: string;
}

export function getLockInventory(params?: LockInventoryParams) {
  return request.get(API_SERVICE.lock.inventory, { params });
}

export function getLockTypeOptions() {
  return request.get(API_SERVICE.lock.inventory, { params: { action: "lockTypes" } });
}

export function getDepartmentOptions() {
  return request.get(API_SERVICE.lock.inventory, { params: { action: "departments" } });
}

export function updateInventoryStatus(lockNumber: string, status: "in_use" | "returned" | "scrapped") {
  return request.patch(API_SERVICE.lock.inventory, { lockNumber, status });
}
