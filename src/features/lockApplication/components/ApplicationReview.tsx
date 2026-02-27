"use client";

import { Button } from "@/components/ui/button";
import type { LockApplicationStep1, LockApplicationStep2 } from "@/lib/schemas/lock-application";

interface ApplicationReviewProps {
  step1Data: LockApplicationStep1;
  step2Data: LockApplicationStep2[];
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting?: boolean;
}

export default function ApplicationReview({
  step1Data,
  step2Data,
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
            <span className="text-gray-500">申请单位：</span>
            <span>{step1Data.applyUnit}</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">锁具明细</h3>
        <div className="space-y-4">
          {step2Data.map((lock, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">锁具类型：</span>
                  <span>{lock.lockType}</span>
                </div>
                <div>
                  <span className="text-gray-500">规格型号：</span>
                  <span>{lock.specification || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">数量：</span>
                  <span>{lock.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-500">用途说明：</span>
                  <span>{lock.purpose || "-"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
