import { pgSchema, serial, text, integer, timestamp, varchar, index } from "drizzle-orm/pg-core";

// Define the 'ehs' schema
export const ehsSchema = pgSchema("ehs");

// --- Point Person ---
export const pointPerson = ehsSchema.table("point_person", {
    id: serial("id").primaryKey(),
    no: varchar("no", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    dept: varchar("dept", { length: 100 }),
    active: integer("active").notNull().default(1), // 0=Disabled, 1=Enabled
    createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).notNull().defaultNow(),
});

// --- Point Categories ---
export const pointCategories = ehsSchema.table("point_categories", {
    id: serial("id").primaryKey(),
    categoryName: varchar("category_name", { length: 100 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).notNull().defaultNow(),
});

// --- Point Event ---
export const pointEvent = ehsSchema.table("point_event", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    categoryId: integer("category_id").notNull(),
    defaultPoint: integer("default_point").notNull(),
    createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).notNull().defaultNow(),
});

// --- Point Log ---
export const pointLog = ehsSchema.table("point_log", {
    id: serial("id").primaryKey(),
    pointName: varchar("point_name", { length: 200 }).notNull(),
    description: text("description"),
    eventId: integer("event_id").notNull(),
    defaultPoint: integer("default_point").notNull(),
    point: integer("point").notNull(),
    no: varchar("no", { length: 50 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    dept: varchar("dept", { length: 100 }).notNull(),
    month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
    createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).notNull().defaultNow(),
}, (table) => ({
    idxMonth: index("idx_point_log_month").on(table.month),
    idxMonthDept: index("idx_point_log_month_dept").on(table.month, table.dept),
    idxNoMonth: index("idx_point_log_no_month").on(table.no, table.month),
}));

// --- Point KPI ---
export const pointKpi = ehsSchema.table("point_kpi", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 100 }).notNull(),
    nickname: varchar("nickname", { length: 50 }),
    year: varchar("year", { length: 4 }).notNull(),
    jan: varchar("jan", { length: 10 }),
    feb: varchar("feb", { length: 10 }),
    mar: varchar("mar", { length: 10 }),
    apr: varchar("apr", { length: 10 }),
    may: varchar("may", { length: 10 }),
    jun: varchar("jun", { length: 10 }),
    jul: varchar("jul", { length: 10 }),
    aug: varchar("aug", { length: 10 }),
    sep: varchar("sep", { length: 10 }),
    oct: varchar("oct", { length: 10 }),
    nov: varchar("nov", { length: 10 }),
    dec: varchar("dec", { length: 10 }),
    createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).notNull().defaultNow(),
}, (table) => ({
    uniqueUserYear: index("idx_point_kpi_user_year").on(table.username, table.year),
}));
