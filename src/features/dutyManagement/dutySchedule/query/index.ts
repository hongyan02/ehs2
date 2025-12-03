import { useQuery } from "@tanstack/react-query";
import { getDutySchedule } from "./api";
import type { AxiosResponse } from "axios";

type DutyScheduleQuery = { start_duty_date: string; end_duty_date: string };

export type Employee = {
  employee_id: string;
  employee_name: string;
  phone: string;
  position: string;
};

export type DutyScheduleItem = {
  duty_date: string;
  employees: Employee[];
  id: number;
  shift_type: string;
  week: number;
};

type DutyScheduleApiResponse = {
  data: DutyScheduleItem[];
  message: string;
};

export const useDutySchedule = (params?: DutyScheduleQuery) => {
  return useQuery<DutyScheduleItem[]>({
    queryKey: ["dutySchedule", params],
    queryFn: async () => {
      const res: AxiosResponse<DutyScheduleApiResponse> =
        await getDutySchedule(params);
      return res.data.data;
    },
  });
};
