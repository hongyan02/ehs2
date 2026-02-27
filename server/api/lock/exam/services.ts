import { db } from "../../../db/db";
import { examResult, lockApplication } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function submitExamResult(
  exam: {
    applicationId: number;
    passed: number;
    score: number;
    examDate: string;
    remark: string | null;
    enteredBy: string;
    createTime: string;
  },
  passed: boolean
) {
  return await db.transaction(async (tx) => {
    // Insert exam result
    const [result] = await tx.insert(examResult).values(exam).returning();

    // Update application status
    const newStatus = passed ? "exam_passed" : "rejected";
    
    await tx
      .update(lockApplication)
      .set({
        status: newStatus,
        updateTime: exam.createTime,
      })
      .where(eq(lockApplication.id, exam.applicationId));

    return result;
  });
}

export async function getExamResult(applicationId: number) {
  return await db.query.examResult.findFirst({
    where: eq(examResult.applicationId, applicationId),
  });
}
