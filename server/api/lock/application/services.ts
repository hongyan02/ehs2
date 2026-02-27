import { db } from "../../../db/db";
import { lockApplication, lockApplicationDetail } from "../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

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
    applyUnit: string;
    status: string;
    currentApprovalLevel: number;
    applicationTime: string;
    createTime: string;
    updateTime: string;
  },
  details: {
    lockType: string;
    specification?: string;
    quantity: number;
    purpose?: string;
  }[]
) {
  const result = await db.transaction(async (tx) => {
    // Insert application
    const [app] = await tx.insert(lockApplication).values(application).returning();
    
    // Insert details
    const detailRecords = details.map((d) => ({
      applicationCode: application.applicationCode,
      lockType: d.lockType,
      specification: d.specification || null,
      quantity: d.quantity,
      purpose: d.purpose || null,
    }));
    
    await tx.insert(lockApplicationDetail).values(detailRecords);
    
    return app;
  });

  return result;
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
