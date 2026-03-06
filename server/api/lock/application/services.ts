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

// Get completed practice applications (已实操考核 - 包含通过和未通过)
export async function getPracticeCompletedApplications(params?: {
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

  // Query applications with practice_passed or rejected status AND has practiceDate
  // Use raw SQL to handle the IN clause and practiceDate condition
  const conditions: any[] = [];

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

  // Get applications with practice_passed or rejected status
  // Filter in JavaScript since SQLite doesn't support IN with subquery well
  let applications = await db
    .select()
    .from(lockApplication)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(lockApplication.id));

  // Filter: status is practice_passed or rejected AND has practiceDate
  const filteredApplications = applications.filter(app =>
    (app.status === "practice_passed" || app.status === "rejected")
  );

  // Get total count
  const total = filteredApplications.length;

  // Get exam result, lock details, and second-level approver for each application
  const applicationsWithExam = await Promise.all(
    filteredApplications.slice(offset, offset + pageSize).map(async (app) => {
      const examRec = await db.query.examResult.findFirst({
        where: eq(examResult.applicationId, app.id),
      });

      // Get lock details for this application
      const lockDetails = await db
        .select()
        .from(lockInventory)
        .where(eq(lockInventory.applicationCode, app.applicationCode));

      // Get second-level approver (approvalLevel = 2, 部门长)
      const level2Approval = await db
        .select()
        .from(lockApproval)
        .where(
          and(
            eq(lockApproval.applicationId, app.id),
            eq(lockApproval.approvalLevel, 2)
          )
        )
        .then((approvals) => approvals[0] || null);

      return {
        ...app,
        examResult: examRec || null,
        lockDetails: lockDetails.map((lock) => ({
          id: lock.id,
          lockNumber: lock.lockNumber,
          lockType: lock.lockType,
        })),
        level2Approver: level2Approval?.approver || null,
      };
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

// Export practice records to Excel
export async function exportPracticeRecords(applicationIds: number[]) {
  const XLSX = require("xlsx");
  const fs = require("fs");
  const path = require("path");

  // Get applications by IDs with all details
  const applications = await Promise.all(
    applicationIds.map(async (id) => {
      const app = await db.query.lockApplication.findFirst({
        where: eq(lockApplication.id, id),
      });
      if (!app) return null;

      // Get exam result
      const examRec = await db.query.examResult.findFirst({
        where: eq(examResult.applicationId, app.id),
      });

      // Get lock details
      const lockDetails = await db
        .select()
        .from(lockInventory)
        .where(eq(lockInventory.applicationCode, app.applicationCode));

      // Get second-level approver (approvalLevel = 2, 部门长)
      const level2Approval = await db
        .select()
        .from(lockApproval)
        .where(
          and(
            eq(lockApproval.applicationId, app.id),
            eq(lockApproval.approvalLevel, 2)
          )
        )
        .then((approvals) => approvals[0] || null);

      return {
        ...app,
        examResult: examRec || null,
        lockDetails: lockDetails.map((lock) => ({
          id: lock.id,
          lockNumber: lock.lockNumber,
          lockType: lock.lockType,
        })),
        level2Approver: level2Approval?.approver || null,
      };
    })
  );

  const validApplications = applications.filter(Boolean);

  // Read template as buffer
  const templatePath = path.join(process.cwd(), "public", "安全锁申请与发放表.xlsx");
  const templateBuffer = fs.readFileSync(templatePath);

  // Open from buffer (read workbook from buffer, preserve cell styles)
  const workbook = XLSX.read(templateBuffer, { type: "buffer", cellStyles: true });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // The template has headers in rows 1-5 (0-indexed: 0-4)
  // Data starts from row 6 (0-indexed: 5)
  const dataStartRow = 6; // 1-indexed Excel row

  // Prepare data rows
  const dataRows = validApplications.map((app: any, index: number) => {
    const examResult = app.examResult || {};
    const lockDetails = app.lockDetails || [];

    // Check if has red or yellow locks
    const hasRedLock = lockDetails.some((lock: any) => lock.lockType === "red");
    const hasYellowLock = lockDetails.some((lock: any) => lock.lockType === "yellow");

    // Get all lock numbers
    const allLockNumbers = lockDetails.map((lock: any) => lock.lockNumber).join(", ");

    return {
      序号: index + 1,
      产线: app.productionLine || "",
      部门: app.department || "",
      工序: app.process || "",
      班组: app.team || "",
      所属经理: app.level2Approver || "",
      姓名: app.applicantName || "",
      工号: app.applicantNo || "",
      联系电话: app.phone || "",
      理论培训得分: examResult.score ?? 0,
      实操培训得分: examResult.practiceScore ?? 0,
      红色: hasRedLock ? "✓" : "",
      黄色: hasYellowLock ? "✓" : "",
      锁具编号: allLockNumbers
    };
  });

  // Write data to worksheet starting from dataStartRow
  // Column mapping: A=序号, B=产线, C=部门, D=工序, E=班组, F=所属经理, G=姓名, H=工号, I=联系电话
  // J=理论培训得分, L=实操培训得分, R=锁具编号, P=红色, Q=黄色
  dataRows.forEach((row: any, rowIndex: number) => {
    const excelRow = dataStartRow + rowIndex;
    worksheet[`A${excelRow}`] = { t: "n", v: row.序号 };
    worksheet[`B${excelRow}`] = { t: "s", v: row.产线 };
    worksheet[`C${excelRow}`] = { t: "s", v: row.部门 };
    worksheet[`D${excelRow}`] = { t: "s", v: row.工序 };
    worksheet[`E${excelRow}`] = { t: "s", v: row.班组 };
    worksheet[`F${excelRow}`] = { t: "s", v: row.所属经理 };
    worksheet[`G${excelRow}`] = { t: "s", v: row.姓名 };
    worksheet[`H${excelRow}`] = { t: "s", v: row.工号 };
    worksheet[`I${excelRow}`] = { t: "s", v: row.联系电话 };
    worksheet[`J${excelRow}`] = { t: "n", v: row.理论培训得分 };
    worksheet[`L${excelRow}`] = { t: "n", v: row.实操培训得分 };
    worksheet[`P${excelRow}`] = { t: "s", v: row.红色 };
    worksheet[`Q${excelRow}`] = { t: "s", v: row.黄色 };
    worksheet[`R${excelRow}`] = { t: "s", v: row.锁具编号 };
  });

  // Update the range if we have more data than the original template
  const newRange = `A1:T${dataStartRow + dataRows.length - 1}`;
  worksheet["!ref"] = newRange;

  // Write to buffer (preserve cell styles)
  const exlBuf = XLSX.write(workbook, { bookType: "xlsx", type: "buffer", cellStyles: true });

  return exlBuf;
}
