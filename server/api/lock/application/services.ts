import { db } from "../../../db/db";
import { lockApplication, lockApproval, examResult, lockConfig, lockInventory } from "../../../db/schema";
import { eq, desc, and, sql, like } from "drizzle-orm";

export async function getLockApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (params?.status) {
    conditions.push(eq(lockApplication.status, params.status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(lockApplication)
    .where(whereClause);
  const total = countResult[0]?.count || 0;

  const applications = await db
    .select()
    .from(lockApplication)
    .where(whereClause)
    .orderBy(desc(lockApplication.id))
    .limit(pageSize)
    .offset(offset);

  return {
    data: applications,
    total,
    page,
    pageSize,
  };
}

// Get applications by applicantNo (for "我的申请")
export async function getMyApplications(applicantNo: string, params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(lockApplication.applicantNo, applicantNo)];
  if (params?.status) {
    conditions.push(eq(lockApplication.status, params.status));
  }

  const applications = await db
    .select()
    .from(lockApplication)
    .where(and(...conditions))
    .orderBy(desc(lockApplication.id))
    .limit(pageSize)
    .offset(offset);

  // Get approval history and exam result for each application
  const applicationsWithHistory = await Promise.all(
    applications.map(async (app) => {
      const approvals = await db
        .select()
        .from(lockApproval)
        .where(eq(lockApproval.applicationId, app.id))
        .orderBy(lockApproval.approvalLevel);

      const examRec = await db.query.examResult.findFirst({
        where: eq(examResult.applicationId, app.id),
      });

      return { ...app, approvalHistory: approvals, examResult: examRec || null };
    })
  );

  return {
    data: applicationsWithHistory,
    total: applications.length,
    page,
    pageSize,
  };
}

// Get all applications with details (for "所有申请单")
export async function getAllApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (params?.status) {
    conditions.push(eq(lockApplication.status, params.status));
  }

  let applications = await db
    .select()
    .from(lockApplication)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(lockApplication.id));

  // Get lock details, approval history and exam result for each application
  const applicationsWithDetails = await Promise.all(
    applications.map(async (app) => {
      const details = await db
        .select()
        .from(lockInventory)
        .where(eq(lockInventory.applicationCode, app.applicationCode));

      const approvals = await db
        .select()
        .from(lockApproval)
        .where(eq(lockApproval.applicationId, app.id))
        .orderBy(lockApproval.approvalLevel);

      const examRec = await db.query.examResult.findFirst({
        where: eq(examResult.applicationId, app.id),
      });

      return {
        ...app,
        lockDetails: details,
        approvalHistory: approvals,
        examResult: examRec || null,
      };
    })
  );

  // Apply pagination
  const paginatedData = applicationsWithDetails.slice(offset, offset + pageSize);

  return {
    data: paginatedData,
    total: applications.length,
    page,
    pageSize,
  };
}

// Get all lock details with holder info (for "所有锁具详情")
export async function getAllLockDetails(params?: {
  page?: number;
  pageSize?: number;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  // Get all lock details with application info
  const details = await db
    .select()
    .from(lockInventory)
    .orderBy(desc(lockInventory.id));

  // Get application info for each detail
  const detailsWithHolder = await Promise.all(
    details.map(async (detail) => {
      const application = await db.query.lockApplication.findFirst({
        where: eq(lockApplication.applicationCode, detail.applicationCode),
      });
      return {
        ...detail,
        holderName: application?.applicantName || null,
        holderNo: application?.applicantNo || null,
        applicationDate: application?.applicationTime || null,
        applicationStatus: application?.status || null,
      };
    })
  );

  // Apply pagination
  const paginatedData = detailsWithHolder.slice(offset, offset + pageSize);

  return {
    data: paginatedData,
    total: details.length,
    page,
    pageSize,
  };
}

// Query applications by employee number (public query for signboard)
export async function getApplicationsByEmployeeNo(employeeNo: string) {
  const applications = await db
    .select()
    .from(lockApplication)
    .where(eq(lockApplication.applicantNo, employeeNo))
    .orderBy(desc(lockApplication.id));

  // Get lock details, approval history and exam result for each application
  const applicationsWithDetails = await Promise.all(
    applications.map(async (app) => {
      const details = await db
        .select()
        .from(lockInventory)
        .where(eq(lockInventory.applicationCode, app.applicationCode));

      const approvals = await db
        .select()
        .from(lockApproval)
        .where(eq(lockApproval.applicationId, app.id))
        .orderBy(lockApproval.approvalLevel);

      const examRec = await db.query.examResult.findFirst({
        where: eq(examResult.applicationId, app.id),
      });

      return {
        ...app,
        lockDetails: details,
        approvalHistory: approvals,
        examResult: examRec || null,
      };
    })
  );

  return applicationsWithDetails;
}

export async function getLockApplicationById(id: number) {
  const application = await db.query.lockApplication.findFirst({
    where: eq(lockApplication.id, id),
  });

  if (!application) {
    return null;
  }

  const details = await db.query.lockInventory.findMany({
    where: eq(lockInventory.applicationCode, application.applicationCode),
  });

  return {
    ...application,
    lockDetails: details,
  };
}

export async function createLockApplication(
  application: {
    applicationCode: string;
    applicantName: string;
    applicantNo: string;
    department: string;
    phone: string;
    productionLine?: string | null;
    process?: string | null;
    team?: string | null;
    certificatePhoto?: string | null;
    leaderName?: string;
    leaderNo?: string;
    managerName?: string;
    managerNo?: string;
    safetyOfficerName?: string;
    safetyOfficerNo?: string;
    status: string;
    currentApprovalLevel: number;
    applicationTime: string;
    createTime: string;
    updateTime: string;
  }
) {
  // Insert application
  const [app] = await db.insert(lockApplication).values(application).returning();

  return app;
}

export async function updateLockApplication(data: {
  id: number;
  status?: string;
  currentApprovalLevel?: number;
  updateTime: string;
}) {
  const [result] = await db
    .update(lockApplication)
    .set(data)
    .where(eq(lockApplication.id, data.id))
    .returning();

  return result;
}

export async function getLockApplicationByCode(applicationCode: string) {
  return await db.query.lockApplication.findFirst({
    where: eq(lockApplication.applicationCode, applicationCode),
  });
}

// Get applications with practice_applying status (已申请实操考核，待实操考核)
export async function getPracticeEligibleApplications(params?: {
  page?: number;
  pageSize?: number;
  applicantName?: string;
  applicantNo?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(lockApplication.status, "practice_applying")];

  if (params?.applicantName) {
    conditions.push(sql`${lockApplication.applicantName} LIKE ${'%' + params.applicantName + '%'}`);
  }
  if (params?.applicantNo) {
    conditions.push(sql`${lockApplication.applicantNo} LIKE ${'%' + params.applicantNo + '%'}`);
  }
  if (params?.department) {
    conditions.push(eq(lockApplication.department, params.department));
  }
  if (params?.startDate) {
    conditions.push(sql`${lockApplication.applicationTime} >= ${params.startDate}`);
  }
  if (params?.endDate) {
    conditions.push(sql`${lockApplication.applicationTime} <= ${params.endDate + ' 23:59:59'}`);
  }

  const whereClause = and(...conditions);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(lockApplication)
    .where(whereClause);
  const total = countResult[0]?.count || 0;

  const applications = await db
    .select()
    .from(lockApplication)
    .where(whereClause)
    .orderBy(desc(lockApplication.id))
    .limit(pageSize)
    .offset(offset);

  // Get exam result for each application
  const applicationsWithExam = await Promise.all(
    applications.map(async (app) => {
      const examRec = await db.query.examResult.findFirst({
        where: eq(examResult.applicationId, app.id),
      });
      return { ...app, examResult: examRec || null };
    })
  );

  return {
    data: applicationsWithExam,
    total,
    page,
    pageSize,
  };
}

// Generate lock number for a process
// Format: processCode-X (e.g., "A-1", "A-2", "B-1")
export async function generateLockNumber(processName: string, lockType: "red" | "yellow") {
  // Get process config to find the code
  const processConfig = await db.query.lockConfig.findFirst({
    where: and(
      eq(lockConfig.type, "process"),
      eq(lockConfig.name, processName)
    ),
  });

  if (!processConfig || !processConfig.code) {
    throw new Error("未找到工序配置或工序编码");
  }

  const processCode = processConfig.code;

  // Find existing lock numbers for this process
  // Lock numbers are stored as processCode-XXX in lockInventory
  const existingLocks = await db
    .select()
    .from(lockInventory)
    .where(like(lockInventory.lockNumber, `${processCode}-%`));

  // Find the maximum sequence number
  let maxSeq = 0;
  for (const lock of existingLocks) {
    if (lock.lockNumber) {
      const match = lock.lockNumber.match(/-(\d+)$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
  }

  // Generate new lock number
  const newSeq = maxSeq + 1;
  const lockNumber = `${processCode}-${newSeq}`;

  return { lockNumber, processCode, sequence: newSeq };
}
