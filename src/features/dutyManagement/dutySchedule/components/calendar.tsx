"use client";

import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
// import { CalendarApi } from "@fullcalendar/core";
import { DutyScheduleItem, Employee } from "../query/index";
import { cn } from "@/utils/index";
import zhCnLocale from "@fullcalendar/core/locales/zh-cn";
import type { EventContentArg } from "@fullcalendar/core";

type CalendarProps = {
  data: DutyScheduleItem[];
  shiftFilter?: "0" | "1"; //不填显示全部
} & Record<string, any>;

export default function Calendar({
  data,
  shiftFilter,
  ...props
}: CalendarProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  //后翻页
  // function goNext() {
  //   const api: CalendarApi | undefined = calendarRef.current?.getApi();
  //   api?.next();
  // }
  //前翻页
  // function goPrev() {
  //   const api: CalendarApi | undefined = calendarRef.current?.getApi();
  //   api?.prev();
  // }

  const filteredData = shiftFilter
    ? (data ?? []).filter((item) => item.shift_type === shiftFilter)
    : (data ?? []);

  const events = (filteredData ?? []).map((item) => ({
    id: String(item.id),
    start: item.duty_date, // "YYYY-MM-DD"
    allDay: true,
    title: item.shift_type === "0" ? "白班" : "夜班",
    extendedProps: {
      shiftType: item.shift_type,
      employees: item.employees ?? [],
    },
    backgroundColor: "transparent",
    borderColor: "transparent",
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      calendarRef.current?.getApi().updateSize();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={renderEventContent}
        dayMaxEventRows={4}
        fixedWeekCount={false}
        handleWindowResize
        locales={[zhCnLocale]}
        locale="zh-cn"
        height="100%"
        contentHeight="auto"
        {...props}
      />
    </div>
  );
}

//自定义渲染日期格
function renderEventContent(arg: EventContentArg) {
  const { shiftType, employees } = arg.event.extendedProps as {
    shiftType: "0" | "1";
    employees: Employee[];
  };

  const employeeList = employees ?? [];
  const isDay = shiftType === "0";

  return (
    <div className="w-full">
      <ul className="mt-1">
        {employeeList.map((e, i) => (
          <li
            key={`${e.employee_name}-${i}`}
            className={cn(
              "group flex items-center gap-0.5 rounded-lg px-2 py-0.5 ",
              // isDay
              //   ? "bg-white/70  hover:bg-white"
              //   : "bg-white/5 hover:bg-white/10",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                isDay ? "bg-sky-500" : "bg-indigo-300",
              )}
            />
            <span
              className={cn(
                "text-xs leading-none px-1.5 py-0.5 rounded-2xl",
                isDay
                  ? "bg-sky-50  text-sky-700"
                  : "bg-indigo-900/40 text-black",
              )}
            >
              {TranslatePosition(e.position)}
            </span>
            <span
              className={cn(
                "text-xs font-medium truncate",
                isDay ? "text-slate-800" : "text-black",
              )}
            >
              {e.employee_name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

//翻译英文字段名
const POSITION_MAP: Record<string, string> = {
  dayDutyLeader: "值班领导",
  nightDutyLeader: "值班领导",
  dayDutyManager: "带班干部",
  nightDutyManager: "带班干部",
  daySafetyManager: "安全管理人员",
  nightSafetyManager: "安全管理人员",
  nightSafetyOfficer: "安全员",
  daySafetyOfficer: "安全员",
};
export function TranslatePosition(position: string): string {
  return POSITION_MAP[position] ?? "";
}
