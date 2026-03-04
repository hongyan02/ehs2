import { db } from "../../../db/db";
import { lockExamConfig } from "../../../db/schema";
import { eq } from "drizzle-orm";

// 获取考试配置
export async function getExamConfig() {
  const configs = await db
    .select()
    .from(lockExamConfig)
    .where(eq(lockExamConfig.status, 1))
    .orderBy(lockExamConfig.id);
  return configs[0] || null;
}

// 获取所有考试配置
export async function getAllExamConfigs() {
  return db.select().from(lockExamConfig).orderBy(lockExamConfig.id);
}

// 创建考试配置
export async function createExamConfig(data: {
  courseUrl?: string;
  passingScore?: number;
  practiceFileUrl?: string;
  status?: number;
  remark?: string;
}) {
  const now = new Date().toISOString();
  const [config] = await db
    .insert(lockExamConfig)
    .values({
      ...data,
      status: data.status ?? 1,
      passingScore: data.passingScore ?? 60,
      createTime: now,
      updateTime: now,
    })
    .returning();
  return config;
}

// 更新考试配置
export async function updateExamConfig(
  id: number,
  data: {
    courseUrl?: string;
    passingScore?: number;
    practiceFileUrl?: string;
    status?: number;
    remark?: string;
  }
) {
  const [config] = await db
    .update(lockExamConfig)
    .set({
      ...data,
      updateTime: new Date().toISOString(),
    })
    .where(eq(lockExamConfig.id, id))
    .returning();
  return config;
}

// 保存考试配置（如果存在则更新，不存在则创建）
export async function saveExamConfig(data: {
  courseUrl?: string;
  passingScore?: number;
  practiceFileUrl?: string;
  remark?: string;
}) {
  const existing = await getExamConfig();
  if (existing) {
    return updateExamConfig(existing.id, data);
  }
  return createExamConfig(data);
}

// 上传实操考核文件
export async function uploadPracticeFile(file: {
  url: string;
  filename: string;
}) {
  const existing = await getExamConfig();
  if (existing) {
    // 更新现有配置
    return updateExamConfig(existing.id, {
      practiceFileUrl: file.url,
    });
  } else {
    // 创建新配置
    return createExamConfig({
      practiceFileUrl: file.url,
    });
  }
}
