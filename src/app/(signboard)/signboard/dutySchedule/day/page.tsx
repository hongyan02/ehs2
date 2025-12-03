"use client";
import { startOfMonth, endOfMonth, format } from "date-fns";
import Calendar from "@/features/dutyManagement/dutySchedule/components/calendar";
import { useDutySchedule } from "@/features/dutyManagement/dutySchedule/query";

export default function DutyLogPage() {
  const params = {
    start_duty_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end_duty_date: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  };
  const { data } = useDutySchedule(params);
  return (
    <>
      <div className="h-screen w-screen flex items-center justify-center">
        <Calendar
          data={data ?? []}
          shiftFilter="0"
          headerToolbar={{
            left: "",
            center: "title",
            right: "",
          }}
        />
      </div>
    </>
  );
}
