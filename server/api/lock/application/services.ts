import { db } from "../../../db/db";
import { lockApplication, lockApplicationDetail, lockApproval } from "../../../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

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

  const applications = await db
    .select()
    .from(lockApplication)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(lockApplication.id))
    .limit(pageSize)
    .offset(offset);

  const total = applications.length;

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

  // Get approval history for each application
  const applicationsWithHistory = await Promise.all(
    applications.map(async (app) => {
      const approvals = await db
        .select()
        .from(lockApproval)
        .where(eq(lockApproval.applicationId, app.id))
        .orderBy(lockApproval.approvalLevel);
      return { ...app, approvalHistory: approvals };
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

  // Get lock details and approval history for each application
  const applicationsWithDetails = await Promise.all(
    applications.map(async (app) => {
      const details = await db
        .select()
        .from(lockApplicationDetail)
        .where(eq(lockApplicationDetail.applicationCode, app.applicationCode));

      const approvals = await db
        .select()
        .from(lockApproval)
        .where(eq(lockApproval.applicationId, app.id))
        .orderBy(lockApproval.approvalLevel);

      return {
        ...app,
        lockDetails: details,
        approvalHistory: approvals,
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
    .from(lockApplicationDetail)
    .orderBy(desc(lockApplicationDetail.id));

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

  // Get lock details and approval history for each application
  const applicationsWithDetails = await Promise.all(
    applications.map(async (app) => {
      const details = await db
        .select()
        .from(lockApplicationDetail)
        .where(eq(lockApplicationDetail.applicationCode, app.applicationCode));

      const approvals = await db
        .select()
        .from(lockApproval)
        .where(eq(lockApproval.applicationId, app.id))
        .orderBy(lockApproval.approvalLevel);

      return {
        ...app,
        lockDetails: details,
        approvalHistory: approvals,
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

  const details = await db.query.lockApplicationDetail.findMany({
    where: eq(lockApplicationDetail.applicationCode, application.applicationCode),
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
