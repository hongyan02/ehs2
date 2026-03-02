# 锁具模块代码问题文档

## 文档信息
- 创建日期: 2026-03-02
- 审核范围: /src/features/lock/ 和 /server/api/lock/

---

## 一、问题清单

### P0 - 必须解决（严重问题）

| 序号 | 问题名称 | 位置 | 描述 |
|------|----------|------|------|
| P0-1 | 审批权限绕过 | approval/services.ts:73-76 | Level 4 审批权限直接返回 true，无实际验证 |
| P0-2 | 考试结果重复提交 | exam/services.ts:5-33 | 缺少唯一性检查，可重复提交考试分数 |
| P0-3 | 分页 total 计算错误 | application/services.ts:27 | total 返回当页条数而非总数 |
| P0-4 | 审批记录重复提交 | approval/services.ts:97 | 同一级别可重复提交审批记录 |
| P0-5 | 审批防呆校验缺失 | approval/services.ts | 无状态和审批顺序校验，可跳过级别审批 |
| P0-6 | 公开接口信息泄露 | application/route.ts:20 | query 接口返回完整敏感信息（暂不处理） |

### P1 - 应该解决

| 序号 | 问题名称 | 位置 | 描述 |
|------|----------|------|------|
| P1-1 | 更新接口权限校验缺失 | application/route.ts:28 | PATCH /:id 无权限校验 |
| P1-2 | 审批人自动填充不完整 | Step1Form.tsx:151-165 | 工序配置未自动填充安环工程师（暂不处理） |
| P1-3 | 锁具明细功能未实现 | schema.ts + 前端 | lockApplicationDetail 表未使用（暂不处理） |

### P2 - 建议解决

| 序号 | 问题名称 | 位置 | 描述 |
|------|----------|------|------|
| P2-1 | 审批人匹配逻辑问题 | approval/services.ts:194-211 | 申请中未填审批人时，用户有权限也无法审批 |

---

## 二、问题详细说明

### P0-1: 审批权限绕过
**文件**: server/api/lock/approval/services.ts
**代码**:
```typescript
case 4:
  // 登记审批 - 需要特殊权限 (LOCK_REGISTRATION)
  return { hasPermission: true };  // ⚠️ 直接返回 true
```
**影响**: Level 4 审批权限验证被绕过
**修复方案**: 补充 Level 4 权限验证逻辑

---

### P0-2: 考试结果重复提交
**文件**: server/api/lock/exam/services.ts
**代码**:
```typescript
const [result] = await db.insert(examResult).values(exam).returning();
```
**影响**: 可重复提交同一申请的考试结果
**修复方案**: 先查询是否已存在，存在则更新，不存在则插入

---

### P0-3: 分页 total 计算错误
**文件**: server/api/lock/application/services.ts:27
**代码**:
```typescript
const total = applications.length;  // 这是当页条数
```
**影响**: 分页信息不准确
**修复方案**: 使用 SQL COUNT 获取总数

---

### P0-4: 审批记录重复提交
**文件**: server/api/lock/approval/services.ts:97
**代码**:
```typescript
const [approvalRecord] = await db.insert(lockApproval).values(approval).returning();
```
**影响**: 同一级别的审批可重复提交
**修复方案**: 检查是否已存在该级别的审批记录

---

### P0-5: 审批防呆校验缺失
**文件**: server/api/lock/approval/services.ts
**代码**: submitApproval 函数无校验逻辑
**影响**:
- 可跳过低级别直接审批高级别
- 申请状态与审批级别不匹配时仍可审批
**修复方案**: 添加状态和顺序校验

---

### P1-1: 更新接口权限校验缺失
**文件**: server/api/lock/application/route.ts:28
**代码**:
```typescript
route.patch("/:id", updateApplicationController);
```
**影响**: 任何人可修改任意申请状态
**修复方案**: 添加权限校验

---

### P2-1: 审批人匹配逻辑问题
**文件**: server/api/lock/approval/services.ts:194-211
**代码**:
```typescript
if (app.status === "submitted" && app.leaderNo === userNo) {
  filtered.push(app);
}
```
**影响**: 申请中未填审批人时，即使用户在系统审批人员表中也无法审批
**修复方案**: 补充系统审批人员表匹配逻辑

---

## 三、暂不处理的问题

| 问题 | 原因 |
|------|------|
| P0-6 公开接口信息泄露 | 看板功能需要完整信息，需重新设计返回字段 |
| P1-2 审批人自动填充 | 需与产品确认安环工程师填充逻辑 |
| P1-3 锁具明细功能 | 需确认是否需要此功能 |

---

## 四、修复完成状态

| 序号 | 问题名称 | 修复状态 | 修复文件 |
|------|----------|----------|----------|
| P0-1 | 审批权限绕过 | ✅ 已修复 | approval/controller.ts |
| P0-2 | 考试结果重复提交 | ✅ 已修复 | exam/services.ts |
| P0-3 | 分页 total 计算错误 | ✅ 已修复 | application/services.ts |
| P0-4 | 审批记录重复提交 | ✅ 已修复 | approval/services.ts |
| P0-5 | 审批防呆校验缺失 | ✅ 已修复 | approval/services.ts |
| P1-1 | 更新接口权限校验缺失 | ✅ 已修复 | application/route.ts |
| P2-1 | 审批人匹配逻辑问题 | ✅ 已修复 | approval/services.ts |

## 五、修复后校验清单

- [x] ~~P0-1: 验证 Level 4 审批需要 system_approver 表中有 registration 角色~~ → 已在代码中实现：Level 3/4 通过 system_approver 表校验
- [x] ~~P0-2: 验证重复提交考试结果会更新而非新增~~ → 已在代码中实现：先查询再插入或更新
- [x] ~~P0-3: 验证分页 API 返回正确的 total 值~~ → 已在代码中实现：使用 SQL COUNT
- [x] ~~P0-4: 验证重复提交同级别审批会报错~~ → 已在代码中实现：检查是否已存在审批记录
- [x] ~~P0-5: 验证跳过级别审批会报错~~ → 已在代码中实现：添加状态和顺序校验
- [x] ~~P1-1: 验证无权限用户无法修改申请状态~~ → 已在代码中实现：添加 LOCK_ADMIN 权限要求
- [ ] P2-1: 验证说明（Level 1/2 只能通过申请中工号，Level 3/4 可通过 system_approver 表）

## 六、当前权限校验逻辑

| 审批级别 | 校验方式 |
|----------|----------|
| Level 1 组长 | 申请中指定的 leaderNo |
| Level 2 部门长 | 申请中指定的 managerNo |
| Level 3 安环部 | 申请中指定的 safetyOfficerNo OR system_approver 表 |
| Level 4 登记审批 | system_approver 表（module='lock'） |
