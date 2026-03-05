import { db } from "../../../db/db";
import { examResult, lockApplication, lockInventory } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
import { LOCK_APPLICATION_STATUS } from "../../../config/lock-status";

export async function submitExamResult(
  exam: {
    applicationId: number;
    passed: number;
    score: number;
    examDate: string;
    remark: string | null;
    screenshotUrl: string | null;
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
        screenshotUrl: exam.screenshotUrl,
        enteredBy: exam.enteredBy,
      })
      .where(eq(examResult.applicationId, exam.applicationId))
      .returning();
  } else {
    // Insert new exam result
    [result] = await db.insert(examResult).values(exam).returning();
  }

  // Update application status
  // 考试通过后 -> exam_passed（考试通过，待实操考核）
  // 考试未通过 -> rejected
  const newStatus = passed ? LOCK_APPLICATION_STATUS.EXAM_PASSED : "rejected";

  await db
    .update(lockApplication)
    .set({
      status: newStatus,
      ...(passed && { currentApprovalLevel: 3 }),
      updateTime: exam.createTime,
    })
    .where(eq(lockApplication.id, exam.applicationId));

  return result;
}

// 申请实操考核 - 将状态从 exam_passed 改为 practice_applying
export async function applyPracticeExam(applicationId: number) {
  const application = await db.query.lockApplication.findFirst({
    where: eq(lockApplication.id, applicationId),
  });

  if (!application) {
    throw new Error("申请不存在");
  }

  // 考试通过后才能申请实操考核
  if (application.status !== LOCK_APPLICATION_STATUS.EXAM_PASSED &&
      application.status !== LOCK_APPLICATION_STATUS.PRACTICE_ELIGIBLE) {
    throw new Error("当前状态不允许申请实操考核");
  }

  // 更新状态为已申请实操考核，等待实操考核
  await db
    .update(lockApplication)
    .set({
      status: LOCK_APPLICATION_STATUS.PRACTICE_APPLYING,
      updateTime: new Date().toISOString(),
    })
    .where(eq(lockApplication.id, applicationId));

  return { success: true };
}

export async function getExamResult(applicationId: number) {
  return await db.query.examResult.findFirst({
    where: eq(examResult.applicationId, applicationId),
  });
}

// Submit practice exam result
export async function submitPracticeResult(data: {
  applicationId: number;
  passed: boolean;
  score: number;
  practiceDate: string;
  remark?: string;
  lockType?: "red" | "yellow";
  lockQuantity?: number;
  lockNumbers?: string[];
}) {
  // Check if exam result already exists
  const existingResult = await db.query.examResult.findFirst({
    where: eq(examResult.applicationId, data.applicationId),
  });

  // Get application to get applicationCode
  const application = await db.query.lockApplication.findFirst({
    where: eq(lockApplication.id, data.applicationId),
  });

  const currentTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

  let result;

  if (existingResult) {
    // Update existing exam result
    [result] = await db
      .update(examResult)
      .set({
        practicePassed: data.passed ? 1 : 0,
        practiceScore: data.score,
        practiceDate: data.practiceDate,
        lockType: data.lockType || null,
        lockQuantity: data.lockQuantity || null,
        remark: data.remark || existingResult.remark,
      })
      .where(eq(examResult.applicationId, data.applicationId))
      .returning();
  } else {
    // This shouldn't happen - practice result should have a corresponding exam result
    throw new Error("未找到理论考试成绩记录");
  }

  // Update application status
  // 不通过: rejected
  // 通过: practice_passed (待登记审批)
  const newStatus = data.passed ? "practice_passed" : "rejected";

  await db
    .update(lockApplication)
    .set({
      status: newStatus,
      ...(data.passed && { currentApprovalLevel: 4 }),
      updateTime: currentTime,
    })
    .where(eq(lockApplication.id, data.applicationId));

  // If passed and has lock numbers, create inventory records
  if (data.passed && application && data.lockNumbers && data.lockNumbers.length > 0) {
    // Delete existing inventory records for this application
    await db
      .delete(lockInventory)
      .where(eq(lockInventory.applicationCode, application.applicationCode));

    // Insert inventory records
    const currentTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
    for (const lockNumber of data.lockNumbers) {
      // Insert inventory record
      await db.insert(lockInventory).values({
        lockNumber: lockNumber,
        lockType: data.lockType || "red",
        holderName: application.applicantName,
        holderNo: application.applicantNo,
        department: application.department,
        applicationCode: application.applicationCode,
        status: "in_use",
        registerTime: currentTime,
        createTime: currentTime,
        updateTime: currentTime,
      });
    }
  }

  return result;
}
