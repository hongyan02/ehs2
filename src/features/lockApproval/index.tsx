"use client";

import { useState } from "react";
import { toast } from "sonner";
import CustomPagination from "@/components/CustomPagination";
import PendingApprovalTable from "./components/pendingTable";
import ApprovalDialog from "./components/approvalDialog";
import {
  usePendingApprovals,
  useSubmitApproval,
  useLockApplication,
} from "./query/api";
import useInfoStore from "@/stores/useUserInfo";

type ApplicationData = {
  id: number;
  applicationCode: string;
  applicantName: string;
  applicantNo: string;
  department: string;
  phone: string;
  applyUnit: string;
  status: string;
  currentApprovalLevel: number;
  applicationTime: string;
};

export default function LockApprovalPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [viewApplication, setViewApplication] = useState<ApplicationData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = usePendingApprovals({
    page,
    pageSize,
  });

  const pendingList = data?.data?.data ?? [];

  const approvalMutation = useSubmitApproval();
  const { nickname, username } = useInfoStore();

  const handleViewDetails = (application: ApplicationData) => {
    setSelectedId(application.id);
    setViewApplication(application);
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setViewApplication(null);
      setSelectedId(null);
    }
  };

  const handleStatusChange = async (status: "approve" | "reject") => {
    if (!viewApplication) {
      toast.error("请选择需要操作的申请单");
      return;
    }

    try {
      await approvalMutation.mutateAsync({
        applicationId: viewApplication.id,
        status,
        approvalLevel: viewApplication.currentApprovalLevel,
        approverName: nickname || username,
      });
      toast.success(status === "approve" ? "已同意申请" : "已驳回申请");
      handleDialogChange(false);
      refetch();
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(typeof message === "string" ? message : "操作失败");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="">
        {isLoading ? (
          <div className="py-10 text-center">加载中...</div>
        ) : isError ? (
          <div className="py-10 text-center text-red-500">
            加载失败，请稍后重试
          </div>
        ) : (
          <>
            <PendingApprovalTable
              data={pendingList}
              onView={handleViewDetails}
              selectedId={selectedId}
            />
            <CustomPagination
              page={page}
              pageSize={pageSize}
              total={data?.data?.total || 0}
              onChange={(nextPage) => {
                setPage(nextPage);
                setSelectedId(null);
              }}
              className="mt-4 justify-end"
            />
          </>
        )}
      </div>

      <ApprovalDialog
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
        application={viewApplication}
        onApprove={() => handleStatusChange("approve")}
        onReject={() => handleStatusChange("reject")}
        isActionPending={approvalMutation.isPending}
      />
    </div>
  );
}
