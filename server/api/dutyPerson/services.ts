import { db } from "@server/db/db";
import { dutyStaff } from "@server/db/schema";
import { and, desc, eq, like } from "drizzle-orm";

type DutyStaffInsert = typeof dutyStaff.$inferInsert;

export interface GetDutyPersonsParams {
  page?: number;
  pageSize?: number;
  name?: string;
  no?: string;
  shift?: number;
}

export interface CreateDutyPersonParams {
  name: string;
  no: string;
  position?: string | null;
  shift: number;
  phone?: string | null;
  status?: number;
}

export interface UpdateDutyPersonParams {
  id: number;
  name?: string;
  no?: string;
  position?: string | null;
  shift?: number;
  phone?: string | null;
}

export const getDutyPersons = async (params: GetDutyPersonsParams) => {
  const { page = 1, pageSize = 10, name, no, shift } = params;

  const conditions: (ReturnType<typeof eq> | ReturnType<typeof like>)[] = [];

  if (name) {
    const fuzzy = `%${name}%`;
    conditions.push(like(dutyStaff.name, fuzzy));
  }

  if (no) {
    const fuzzy = `%${no}%`;
    conditions.push(like(dutyStaff.no, fuzzy));
  }

  if (shift !== undefined) {
    conditions.push(eq(dutyStaff.shift, shift));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const allRows = await db.select().from(dutyStaff).where(whereClause);
  const total = allRows.length;

  const offset = (page - 1) * pageSize;
  const data = await db
    .select()
    .from(dutyStaff)
    .where(whereClause)
    .orderBy(desc(dutyStaff.id))
    .limit(pageSize)
    .offset(offset);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const getDutyPersonById = async (id: number) => {
  const result = await db.select().from(dutyStaff).where(eq(dutyStaff.id, id));
  return result[0];
};

export const createDutyPerson = async (params: CreateDutyPersonParams) => {
  const result = await db
    .insert(dutyStaff)
    .values({
      name: params.name,
      no: params.no,
      position: params.position ?? null,
      shift: params.shift,
      phone: params.phone ?? null,
      status: params.status ?? 1,
    })
    .returning();

  return result[0];
};

export const updateDutyPerson = async (params: UpdateDutyPersonParams) => {
  const { id, ...rest } = params;
  const updateData: Partial<DutyStaffInsert> = {};

  if (rest.name !== undefined) updateData.name = rest.name;
  if (rest.no !== undefined) updateData.no = rest.no;
  if (rest.position !== undefined) updateData.position = rest.position;
  if (rest.shift !== undefined) updateData.shift = rest.shift;
  if (rest.phone !== undefined) updateData.phone = rest.phone;

  if (Object.keys(updateData).length === 0) {
    return getDutyPersonById(id);
  }

  const result = await db
    .update(dutyStaff)
    .set(updateData)
    .where(eq(dutyStaff.id, id))
    .returning();

  return result[0];
};

export const deleteDutyPerson = async (id: number) => {
  const result = await db
    .delete(dutyStaff)
    .where(eq(dutyStaff.id, id))
    .returning();
  return result[0];
};
