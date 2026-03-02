import { db } from "../../../db/db";
import { examResult, lockApplication } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

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
  // Check if exam result already exists for this application
  const existingResult = await db.query.examResult.findFirst({
    where: eq(examResult.applicationId, exam.applicationId),
  });

  let result;

  if (existingResult) {
    // Update existing exam result (idempotent)
    [result] = await db
      .update(examResult)
      .set({
        passed: exam.passed,
        score: exam.score,
        examDate: exam.examDate,
        remark: exam.remark,
        enteredBy: exam.enteredBy,
      })
      .where(eq(examResult.applicationId, exam.applicationId))
      .returning();
  } else {
    // Insert new exam result
    [result] = await db.insert(examResult).values(exam).returning();
  }

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
