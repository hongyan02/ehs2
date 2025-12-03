import { db } from "@server/db/db";
import { dutySchedule } from "@server/db/schema";
import { and, asc, eq, gte, lte } from "drizzle-orm";

type DutyScheduleInsert = typeof dutySchedule.$inferInsert;

export interface GetDutyScheduleParams {
  startDutyDate?: string;
  endDutyDate?: string;
  shift?: number;
}

export interface CreateDutyScheduleParams {
  date: string;
  shift: number;
  name: string;
  no: string;
  position?: string | null;
}

export interface UpdateDutyScheduleParams {
  id: number;
  date?: string;
  shift?: number;
  name?: string;
  no?: string;
  position?: string | null;
}

export const getDutyScheduleList = async (params: GetDutyScheduleParams) => {
  const { startDutyDate, endDutyDate, shift } = params;
  const conditions = [];

  if (startDutyDate) {
    conditions.push(gte(dutySchedule.date, startDutyDate));
  }

  if (endDutyDate) {
    conditions.push(lte(dutySchedule.date, endDutyDate));
  }

  if (shift !== undefined && shift !== -1) {
    conditions.push(eq(dutySchedule.shift, shift));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(dutySchedule)
    .where(whereClause)
    .orderBy(asc(dutySchedule.date), asc(dutySchedule.shift));
};

export const getDutyScheduleById = async (id: number) => {
  const result = await db
    .select()
    .from(dutySchedule)
    .where(eq(dutySchedule.id, id));

  return result[0];
};

export const createDutySchedule = async (payload: CreateDutyScheduleParams) => {
  const result = await db
    .insert(dutySchedule)
    .values({
      date: payload.date,
      shift: payload.shift,
      name: payload.name,
      no: payload.no,
      position: payload.position ?? null,
    })
    .returning();

  return result[0];
};

export const updateDutySchedule = async (
  payload: UpdateDutyScheduleParams,
) => {
  const { id, ...rest } = payload;
  const updateData: Partial<DutyScheduleInsert> = {};

  if (rest.date !== undefined) updateData.date = rest.date;
  if (rest.shift !== undefined) updateData.shift = rest.shift;
  if (rest.name !== undefined) updateData.name = rest.name;
  if (rest.no !== undefined) updateData.no = rest.no;
  if (rest.position !== undefined) updateData.position = rest.position;

  if (Object.keys(updateData).length === 0) {
    return getDutyScheduleById(id);
  }

  const result = await db
    .update(dutySchedule)
    .set(updateData)
    .where(eq(dutySchedule.id, id))
    .returning();

  return result[0];
};

export const deleteDutySchedule = async (id: number) => {
  const result = await db
    .delete(dutySchedule)
    .where(eq(dutySchedule.id, id))
    .returning();

  return result[0];
};
