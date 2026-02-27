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
  // Insert exam result
  const [result] = await db.insert(examResult).values(exam).returning();

  // Update application status
  const newStatus = passed ? "exam_passed" : "rejected";

  await db
    .update(lockApplication)
    .set({
      status: newStatus,
      ...(passed && { currentApprovalLevel: 4 }),
      updateTime: exam.createTime,
    })
    .where(eq(lockApplication.id, exam.applicationId));

  return result;
}

export async function getExamResult(applicationId: number) {
  return await db.query.examResult.findFirst({
    where: eq(examResult.applicationId, applicationId),
  });
}
