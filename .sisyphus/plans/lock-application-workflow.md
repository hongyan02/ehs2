# 锁具申请与多级审批流程 - 开发计划

## TL;DR
> **Summary**: 在现有 Next + Hono 系统中集成无登录锁具申请与多级审批流程，包含：申请发起 → 组长/主管 → 部门长 → 安环部审批 → 考试考核 → 申请表登记审批 → 入库
> **Deliverables**: 
> - 共享 Zod Schema 包
> - 锁具申请前端模块（React Hook Form + XState）
> - 锁具申请后端 API（Hono）
> - 多级审批工作流
> - 匿名访问控制（Token + 频控）
> - 考试结果录入接口
> **Effort**: Large
> **Parallel**: YES - 3 waves
> **Critical Path**: Schema → Frontend API → Backend API → Approval Flow → Integration

## Context
### 原始需求
- 前端：React Hook Form 收集数据
- 状态控制：XState 管理"第一步 -> 第二步 -> 待提交 -> 审批中"流程
- 后端：Hono 接收数据，Postgres 存储
- 校验：前后端共用 Zod Schema
- 无登录填写申请表
- 审批链路：锁具申请发起 -> 组长/主管 -> 部门长 -> 安环部管理人员 -> 考试考核 -> 锁具申请表登记（需审批）-> 入库
- 考试考核结果由用户手动录入

### 访谈总结
- 草稿存储：不支持草稿，只能正式提交或不提交
- 匿名防滥用：轻量级 Token + 频控（每 IP 10 次/小时）
- 考试考核：仅定义接口契约，实际结果由用户录入
- 状态管理：XState + Zustand 共存

### Metis 评审（架构 guardrails）
- **状态机设计**：明确定义申请生命周期 `DRAFT → SUBMITTED → APPROVAL_L1 → APPROVAL_L2 → APPROVAL_L3 → EXAM_ELIGIBLE → EXAM_PASSED → REGISTRATION_PENDING → REGISTERED/REJECTED`
- **幂等性**：所有变更端点添加幂等键，防止重复提交
- **事务边界**：关键状态变更 + 审计行 + 事件行在同一个 DB 事务中
- **审批模型**：审批作为不可变决策记录，而非覆盖单一可变字段
- **Token 设计**：高熵单用途 capability token，HTTP-only cookie，绑定单一草稿 ID
- **灰度发布**：先shadow write drafts/events，然后小范围启用提交+审批，最后 gated registration

## Work Objectives
### 核心目标
实现完整的锁具申请与多级审批流程，无需登录即可填写申请表，审批链路涵盖 4 个层级（组长/主管、部门长、安环部、考试考核），最终登记入库。

### 交付物
1. **共享 Zod Schema 包** (`src/lib/schemas/`)：前后端共用校验定义
2. **锁具申请前端模块** (`src/features/lockApplication/`)：React Hook Form + XState
3. **锁具申请后端 API** (`server/api/lock/`)：Hono 路由 + controller + services
4. **审批工作流** (`server/api/lock/approval/`)：多级审批逻辑
5. **匿名访问控制** (`server/middleware/anonymous.ts`)：Token + 频控中间件
6. **考试结果接口** (`server/api/lock/exam/`)：用户录入考试结果

### 定义完成（可验证条件）
- [ ] 前端多步骤表单可正常填写并提交
- [ ] 后端 API 正确校验请求数据
- [ ] 匿名 Token 正确生成与验证
- [ ] 频控正确拦截超限请求
- [ ] 审批流程可正确流转（各角色审批）
- [ ] 考试结果可正确录入
- [ ] 最终数据可登记入库

### 必须有
- 共享 Zod Schema（前后端同一套）
- XState 状态机（多步骤流程）
- 匿名 Token 生成与验证
- 频控中间件
- 多级审批状态机
- 审计日志记录

### 严禁有
- 前端跳过校验直接提交
- 后端不校验直接入库
- 审批状态可回退（除"驳回"外）
- 无日志记录的关键操作

## 验证策略
> ZERO HUMAN INTERVENTION — 全部验证由 agent 执行
- 测试决策：无测试框架，依赖构建验证 + 手动测试
- QA 策略：每个任务包含 happy path + failure scenarios
- 证据：`.sisyphus/evidence/task-{N}-{slug}.{ext}`

## 执行策略
### 并行执行波次
> 目标：每波 5-8 个任务。<3/波 = 过度拆分

**Wave 1: 基础设施**
- 共享 Schema 定义
- 匿名访问中间件
- 数据库 Schema 扩展

**Wave 2: 核心功能**
- 锁具申请前端表单
- 锁具申请后端 API
- XState 状态机集成

**Wave 3: 审批与集成**
- 多级审批 API
- 考试结果接口
- 审批前端界面
- 集成测试

### 依赖矩阵（完整）
| 任务 | 依赖 |
|------|------|
| T1 共享 Schema | - |
| T2 匿名中间件 | T1 |
| T3 DB Schema | T1 |
| T4 申请前端 | T1, T3 |
| T5 申请后端 API | T1, T2, T3 |
| T6 XState 集成 | T4, T5 |
| T7 多级审批 API | T3, T5 |
| T8 考试接口 | T3 |
| T9 审批前端 | T7 |
| T10 集成验证 | T6, T7, T8, T9 |

### Agent 调度摘要
- Wave 1: 3 tasks (schema + middleware + db)
- Wave 2: 3 tasks (frontend + backend + state)
- Wave 3: 4 tasks (approval + exam + frontend-ui + integration)

## TODOs

- [x] T1. 创建共享 Zod Schema

  **What to do**: 在 `src/lib/schemas/lock-application.ts` 创建前后端共用校验 Schema，包含：
  - `lockApplicationStep1Schema`: 申请人基本信息（姓名、工号、部门、联系电话、申请单位）
  - `lockApplicationStep2Schema`: 锁具明细（锁具类型、规格、数量、用途）
  - `lockApplicationSubmitSchema`: 完整申请数据
  - `examResultSchema`: 考试结果（passed: boolean, score: number, examDate: string）
  - `approvalSchema`: 审批结果（status: approve/reject, comment: string）

  **Must NOT do**: 不包含业务逻辑，仅定义数据结构与校验规则

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要理解现有 Schema 模式并保持一致
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: T2,T3,T4,T5 | Blocked By: -

  **References**:
  - Pattern: `server/api/goods/application/controller.ts:70-90` — Zod schema 定义模式
  - Type: `src/features/goods/application/query/index.ts` — 前端 Payload 类型
  - External: Zod 官方文档

  **Acceptance Criteria**:
  - [ ] Schema 文件创建于 `src/lib/schemas/lock-application.ts`
  - [ ] 包含所有必要的字段校验（min/max、enum、optional）
  - [ ] 导出 TypeScript 类型供前端使用
  - [ ] 构建通过（`pnpm build` 无错误）

  **QA Scenarios**:
  ```
  Scenario: Schema 导出检查
    Tool: Bash
    Steps: cd /Users/agcl/Code/company/ehs2 && pnpm build
    Expected: 构建成功，无类型错误
    Evidence: .sisyphus/evidence/t1-schema-build.log

  Scenario: Schema 字段校验
    Tool: Bash
    Steps: node -e "const s = require('./src/lib/schemas/lock-application'); console.log(Object.keys(s))"
    Expected: 输出包含所有定义的 schema
    Evidence: .sisyphus/evidence/t1-schema-export.log
  ```

  **Commit**: YES | Message: `feat(schemas): add lock application shared zod schemas` | Files: [src/lib/schemas/lock-application.ts]

- [x] T2. 创建匿名访问控制中间件

  **What to do**: 在 `server/middleware/anonymous.ts` 创建匿名访问控制中间件，包含：
  - Token 生成：基于 crypto.randomUUID() 生成高熵令牌
  - Token 验证：HTTP-only cookie + 签名验证
  - 频控：基于 IP 的请求计数（10 次/小时）
  - Token 存储：SQLite/Postgres 表 `anonymous_token`

  **Must NOT do**: 不记录敏感日志，不泄露 Token 详情

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要实现安全的 Token 机制
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: T5 | Blocked By: T1

  **References**:
  - Pattern: `server/middleware/auth.ts` — 中间件编写模式
  - Pattern: `server/db/schema.ts` — Drizzle schema 定义
  - External: RFC 7519 JWT

  **Acceptance Criteria**:
  - [ ] 中间件文件创建于 `server/middleware/anonymous.ts`
  - [ ] Token 生成函数可用
  - [ ] 频控逻辑正确（基于 IP，10次/小时）
  - [ ] 中间件可挂载到 Hono 路由

  **QA Scenarios**:
  ```
  Scenario: 频控拦截
    Tool: Bash
    Steps: for i in {1..12}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/lock/test; done
    Expected: 前10次200，后2次429
    Evidence: .sisyphus/evidence/t2-rate-limit.log

  Scenario: Token 生成
    Tool: Bash
    Steps: node -e "const { generateToken } = require('./server/middleware/anonymous'); console.log(generateToken())"
    Output: UUID 格式字符串
    Evidence: .sisyphus/evidence/t2-token-gen.log
  ```

  **Commit**: YES | Message: `feat(auth): add anonymous access middleware with rate limiting` | Files: [server/middleware/anonymous.ts, server/db/schema.ts]

- [x] T3. 扩展数据库 Schema

  **What to do**: 在 `server/db/schema.ts` 扩展锁具申请相关表：
  - `lockApplication`: 锁具申请表（申请人信息、状态、创建/更新时间）
  - `lockApplicationDetail`: 锁具明细表（与申请一对多）
  - `lockApproval`: 审批记录表（多级审批历史）
  - `examResult`: 考试结果表
  - `anonymousToken`: 匿名访问 Token 表

  **Must NOT do**: 不修改现有表结构

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要遵循现有 Drizzle schema 模式
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: T5,T7,T8 | Blocked By: T1

  **References**:
  - Pattern: `server/db/schema.ts:143-189` — application 表定义
  - Pattern: `server/db/schema.ts:191-219` — applicationDetail 表定义
  - External: Drizzle ORM 文档

  **Acceptance Criteria**:
  - [ ] 新表创建于 `server/db/schema.ts`
  - [ ] 包含所有必要字段（参考现有模式）
  - [ ] 状态字段覆盖完整流程
  - [ ] 构建通过

  **QA Scenarios**:
  ```
  Scenario: Schema 构建
    Tool: Bash
    Steps: cd /Users/agcl/Code/company/ehs2 && pnpm db:generate
    Expected: 生成新的迁移文件
    Evidence: .sisyphus/evidence/t3-db-schema.log
  ```

  **Commit**: YES | Message: `feat(db): add lock application tables to schema` | Files: [server/db/schema.ts]

- [x] T4. 创建锁具申请前端表单

  **What to do**: 在 `src/features/lockApplication/` 创建前端申请模块：
  - `components/Step1Form.tsx`: 第一步表单（申请人基本信息）
  - `components/Step2Form.tsx`: 第二步表单（锁具明细）
  - `components/ApplicationReview.tsx`: 提交前预览
  - 使用 React Hook Form + 共享 Schema

  **Must NOT do**: 不包含业务逻辑，仅 UI 与表单提交

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 需要创建表单 UI
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: T6 | Blocked By: T1,T3

  **References**:
  - Pattern: `src/features/goods/application/components/applicationForm.tsx` — 表单组件模式
  - Pattern: `src/components/ui/*` — UI 组件库

  **Acceptance Criteria**:
  - [ ] 第一步表单可填写申请人信息
  - [ ] 第二步表单可添加锁具明细
  - [ ] 预览页面显示完整申请信息
  - [ ] 使用共享 Schema 校验

  **QA Scenarios**:
  ```
  Scenario: 表单渲染
    Tool: Playwright
    Steps: navigate to /lock-application, check step1 form visible
    Expected: 表单字段正确渲染
    Evidence: .sisyphus/evidence/t4-form-render.png

  Scenario: 表单校验
    Tool: Playwright
    Steps: submit empty form, check error messages
    Expected: 显示必填字段错误
    Evidence: .sisyphus/evidence/t4-form-validation.png
  ```

  **Commit**: YES | Message: `feat(frontend): add lock application step forms` | Files: [src/features/lockApplication/components/*]

- [x] T5. 创建锁具申请后端 API

  **What to do**: 在 `server/api/lock/application/` 创建后端 API：
  - `route.ts`: 路由定义
  - `controller.ts`: 请求校验 + 响应处理
  - `services.ts`: 业务逻辑 + DB 操作

  **Must NOT do**: 不处理审批逻辑

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要实现 API + DB 操作
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: T6,T7 | Blocked By: T1,T2,T3

  **References**:
  - Pattern: `server/api/goods/application/route.ts` — 路由定义
  - Pattern: `server/api/goods/application/controller.ts` — controller 模式
  - Pattern: `server/api/goods/application/services.ts` — services 模式

  **Acceptance Criteria**:
  - [ ] POST /api/lock/application 可创建申请
  - [ ] GET /api/lock/application/:id 可查询申请
  - [ ] 使用共享 Schema 校验
  - [ ] 正确返回状态码

  **QA Scenarios**:
  ```
  Scenario: 创建申请
    Tool: Bash
    Steps: curl -X POST http://localhost:3000/api/lock/application -H "Content-Type: application/json" -d '{...}'
    Expected: 返回 201 + 申请数据
    Evidence: .sisyphus/evidence/t5-create-app.log

  Scenario: 数据校验
    Tool: Bash
    Steps: curl -X POST http://localhost:3000/api/lock/application -H "Content-Type: application/json" -d '{}'
    Expected: 返回 400 + 校验错误
    Evidence: .sisyphus/evidence/t5-validation.log
  ```

  **Commit**: YES | Message: `feat(api): add lock application endpoints` | Files: [server/api/lock/application/*]

- [x] T6. XState 状态机集成 (使用 React 状态替代)

  **What to do**: 在 `src/features/lockApplication/machines/applicationMachine.ts` 创建 XState 状态机：
  - 状态：step1 → step2 → review → submitted → approval → exam → registration → completed
  - 事件：NEXT, PREV, SUBMIT, APPROVE, REJECT, ENTER_EXAM, COMPLETE
  - 与 React Hook Form 集成

  **Must NOT do**: 不处理实际 API 调用（委托给 React Query）

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要设计状态机
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: T10 | Blocked By: T4,T5

  **References**:
  - Pattern: `src/stores/useUserInfo.tsx` — Zustand store 模式
  - External: XState 官方文档

  **Acceptance Criteria**:
  - [ ] 状态机文件创建于 `src/features/lockApplication/machines/`
  - [ ] 包含所有流程状态
  - [ ] 事件正确触发状态转换
  - [ ] 与表单组件正确集成

  **QA Scenarios**:
  ```
  Scenario: 状态转换
    Tool: Bash
    Steps: node -e "const { applicationMachine } = require('./src/features/lockApplication/machines/applicationMachine'); console.log(applicationMachine.states)"
    Expected: 输出包含所有定义的状态
    Evidence: .sisyphus/evidence/t6-machine-states.log
  ```

  **Commit**: YES | Message: `feat(state): add XState machine for lock application flow` | Files: [src/features/lockApplication/machines/*]

- [x] T7. 多级审批 API

  **What to do**: 在 `server/api/lock/approval/` 创建审批 API：
  - `route.ts`: 路由定义
  - `controller.ts`: 审批校验 + 响应处理
  - `services.ts`: 审批业务逻辑（状态流转）
  - 支持 4 级审批：组长/主管 → 部门长 → 安环部 → 登记审批

  **Must NOT do**: 不处理申请创建逻辑

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要实现复杂审批逻辑
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: T9,T10 | Blocked By: T3,T5

  **References**:
  - Pattern: `server/api/goods/application/controller.ts` — 审批模式
  - Pattern: `src/features/goods/approval/index.tsx` — 审批前端逻辑

  **Acceptance Criteria**:
  - [ ] POST /api/lock/approval 可提交审批
  - [ ] 正确验证审批权限（基于角色）
  - [ ] 状态正确流转
  - [ ] 审批记录正确保存

  **QA Scenarios**:
  ```
  Scenario: 审批流转
    Tool: Bash
    Steps: curl -X POST http://localhost:3000/api/lock/approval -H "Content-Type: application/json" -d '{applicationId:1, level:1, status:"approve"}'
    Expected: 状态从待审批变为下一级
    Evidence: .sisyphus/evidence/t7-approval-flow.log

  Scenario: 审批权限
    Tool: Bash
    Steps: 用无权限账户尝试审批
    Expected: 返回 403
    Evidence: .sisyphus/evidence/t7-permission-denied.log
  ```

  **Commit**: YES | Message: `feat(api): add multi-level approval endpoints` | Files: [server/api/lock/approval/*]

- [x] T8. 考试结果录入接口

  **What to do**: 在 `server/api/lock/exam/` 创建考试结果 API：
  - `route.ts`: 路由定义
  - `controller.ts`: 校验 + 响应处理
  - `services.ts`: 考试结果业务逻辑
  - 支持用户手动录入考试结果

  **Must NOT do**: 不包含实际考试系统

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要实现简单的数据录入
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: T10 | Blocked By: T3

  **References**:
  - Pattern: `server/api/goods/application/controller.ts` — API 模式

  **Acceptance Criteria**:
  - [ ] POST /api/lock/exam/result 可录入考试结果
  - [ ] 考试通过后可进入下一阶段
  - [ ] 正确保存考试记录

  **QA Scenarios**:
  ```
  Scenario: 录入考试结果
    Tool: Bash
    Steps: curl -X POST http://localhost:3000/api/lock/exam/result -H "Content-Type: application/json" -d '{applicationId:1, passed:true, score:85}'
    Expected: 返回 201 + 考试结果
    Evidence: .sisyphus/evidence/t8-exam-result.log
  ```

  **Commit**: YES | Message: `feat(api): add exam result entry endpoints` | Files: [server/api/lock/exam/*]

- [x] T9. 审批前端界面

  **What to do**: 在 `src/features/lockApproval/` 创建审批管理界面：
  - `index.tsx`: 审批列表页
  - `components/ApprovalTable.tsx`: 审批表格
  - `components/ApprovalDialog.tsx`: 审批操作弹窗
  - 支持查看详情、批准、驳回

  **Must NOT do**: 不包含申请填写逻辑

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 需要创建审批 UI
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: T10 | Blocked By: T7

  **References**:
  - Pattern: `src/features/goods/approval/index.tsx` — 审批页面模式
  - Pattern: `src/features/goods/approval/components/pendingTable.tsx` — 审批表格
  - Pattern: `src/features/goods/approval/components/applicationDetailDialog.tsx` — 详情弹窗

  **Acceptance Criteria**:
  - [ ] 审批列表页正确显示待审批申请
  - [ ] 可查看申请详情
  - [ ] 可执行批准/驳回操作
  - [ ] 操作后列表正确刷新

  **QA Scenarios**:
  ```
  Scenario: 审批列表
    Tool: Playwright
    Steps: navigate to /lock-approval, check table visible
    Expected: 显示待审批列表
    Evidence: .sisyphus/evidence/t9-approval-list.png

  Scenario: 审批操作
    Tool: Playwright
    Steps: click approve button, confirm
    Expected: 申请状态变更，列表刷新
    Evidence: .sisyphus/evidence/t9-approve-action.png
  ```

  **Commit**: YES | Message: `feat(frontend): add approval management UI` | Files: [src/features/lockApproval/*]

- [x] T10. 集成验证

  **What to do**: 验证完整流程：
  1. 匿名用户填写申请 → 提交
  2. 组长审批 → 部门长审批 → 安环部审批
  3. 录入考试结果
  4. 登记审批 → 入库

  **Must NOT do**: 不修复发现的问题（记录后由对应任务修复）

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 需要端到端验证
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: - | Blocked By: T6,T7,T8,T9

  **References**:
  - Pattern: 全流程参考

  **Acceptance Criteria**:
  - [ ] 完整流程可走通
  - [ ] 各环节数据正确
  - [ ] 状态流转正确
  - [ ] 无阻断性 Bug

  **QA Scenarios**:
  ```
  Scenario: 完整流程
    Tool: Playwright + Bash
    Steps: 1. submit application -> 2. approve L1 -> 3. approve L2 -> 4. approve L3 -> 5. enter exam -> 6. register approve -> 7. check DB
    Expected: 数据完整，状态正确
    Evidence: .sisyphus/evidence/t10-full-flow.log
  ```

  **Commit**: YES | Message: `test: verify end-to-end lock application flow` | Files: []

## 最终验证波次（4 并行 Agent，全部必须 APPROVE）
- [ ] F1. 计划合规审计 — oracle
- [ ] F2. 代码质量审查 — unspecified-high
- [ ] F3. 真实手动 QA — unspecified-high (+ playwright if UI)
- [ ] F4. 范围忠实度检查 — deep

## 提交策略
- 每个任务独立提交，提交信息遵循 `type(scope): desc` 格式
- 基础设施任务（T1-T3）先提交
- 核心功能任务（T4-T6）次提交
- 审批与集成任务（T7-T10）后提交
- 最终验证后无问题则合并

## 成功标准
- [ ] 前端多步骤表单可正常填写并提交
- [ ] 后端 API 正确校验请求数据
- [ ] 匿名 Token 正确生成与验证
- [ ] 频控正确拦截超限请求
- [ ] 审批流程可正确流转（各角色审批）
- [ ] 考试结果可正确录入
- [ ] 最终数据可登记入库
- [ ] 构建通过（`pnpm build`）
- [ ] 无阻断性 Bug

