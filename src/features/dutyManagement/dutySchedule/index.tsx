"use client";

import { useState } from "react";
import { format } from "date-fns";
import Calendar from "./components/calendar";
import { useDutySchedule } from "./query";
import type { DatesSetArg } from "@fullcalendar/core";

export default function DutySchedule() {
  const [range, setRange] = useState({
    start_duty_date: "",
    end_duty_date: "",
  });
  const { data } = useDutySchedule(range);

  return (
    <>
      <div className="h-full w-full max-w-full overflow-hidden">
        <Calendar
          data={data ?? []}
          //datesSet当视图变化时，自动触发内容
          datesSet={(arg: DatesSetArg) => {
            const newStart = format(arg.start, "yyyy-MM-dd");
            const newEnd = format(arg.end, "yyyy-MM-dd");
            //避免重复循环渲染
            if (
              newStart !== range.start_duty_date ||
              newEnd !== range.end_duty_date
            ) {
              setRange({
                start_duty_date: newStart,
                end_duty_date: newEnd,
              });
            }
          }}
        />
      </div>
    </>
  );
}
