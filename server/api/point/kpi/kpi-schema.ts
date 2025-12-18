import { z } from "zod";

export const kpiSchema = z.object({
    username: z.string(),
    nickName: z.string().optional().nullable(), // Note: API returns nickName, DB wants nickname. Service will map.
    nf: z.string().optional().nullable(),
    jan: z.string().optional().nullable(),
    feb: z.string().optional().nullable(),
    mar: z.string().optional().nullable(),
    apr: z.string().optional().nullable(),
    may: z.string().optional().nullable(),
    jun: z.string().optional().nullable(),
    jul: z.string().optional().nullable(),
    aug: z.string().optional().nullable(),
    sep: z.string().optional().nullable(),
    oct: z.string().optional().nullable(),
    nov: z.string().optional().nullable(),
    dect: z.string().optional().nullable(), // API returns dect, DB wants dec
});

export const syncKpiSchema = z.array(kpiSchema);
