import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

export interface PracticeEligibleParams {
  page?: number;
  pageSize?: number;
  applicantName?: string;
  applicantNo?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}

export interface PracticeCompletedParams extends PracticeEligibleParams {}

export interface PracticeResultData {
  applicationId: number;
  passed: boolean;
  score: number;
  practiceDate: string;
  remark?: string;
  lockType?: "red" | "yellow";
  lockQuantity?: number;
  lockNumbers?: string[];
}

export function getPracticeEligible(params: PracticeEligibleParams) {
  return request.get(API_SERVICE.lock.applicationPracticeEligible, { params });
}

export function getPracticeCompleted(params: PracticeCompletedParams) {
  return request.get(API_SERVICE.lock.applicationPracticeCompleted, { params });
}

export function submitPracticeResult(data: PracticeResultData) {
  return request.post(API_SERVICE.lock.examPracticeResult, data);
}

export function generateLockNumber(processName: string, lockType: "red" | "yellow") {
  return request.post(API_SERVICE.lock.applicationGenerateLockNumber, {
    processName,
    lockType,
  });
}

export function exportPracticeRecords(applicationIds: number[]) {
  return request.post(API_SERVICE.lock.applicationExportPracticeRecords, {
    applicationIds,
  }, {
    responseType: "blob",
  });
}
