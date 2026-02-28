"use client";

import { Button } from "@/components/ui/button";
import type { LockApplicationStep1 } from "@/lib/schemas/lock-application";

interface ApplicationReviewProps {
  step1Data: LockApplicationStep1;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting?: boolean;
}

export default function ApplicationReview({
  step1Data,
  onSubmit,
  onPrev,
  isSubmitting,
}: ApplicationReviewProps) {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">申请人信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500">申请人姓名：</span>
            <span>{step1Data.applicantName}</span>
          </div>
          <div>
            <span className="text-gray-500">申请人工号：</span>
            <span>{step1Data.applicantNo}</span>
          </div>
          <div>
            <span className="text-gray-500">部门：</span>
            <span>{step1Data.department}</span>
          </div>
          <div>
            <span className="text-gray-500">联系电话：</span>
            <span>{step1Data.phone}</span>
          </div>
          <div>
            <span className="text-gray-500">所属产线：</span>
            <span>{step1Data.productionLine || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">工序：</span>
            <span>{step1Data.process || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">班组：</span>
            <span>{step1Data.team || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">组长/主管：</span>
            <span>{step1Data.leaderName || "-"}</span>
          </div>
        </div>
        {step1Data.certificatePhoto && (
          <div className="mt-4">
            <span className="text-gray-500">上岗证照片：</span>
            <div className="mt-2">
              <img
                src={step1Data.certificatePhoto}
                alt="上岗证"
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev}>
          上一步
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "提交中..." : "提交申请"}
        </Button>
      </div>
    </div>
  );
}
