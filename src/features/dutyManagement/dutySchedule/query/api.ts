import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

//获取值班表
export function getDutySchedule(params: any) {
  return request.post(API_SERVICE.dutySchedule.getDutySchedule, params);
}
