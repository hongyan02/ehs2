# EHS 管理平台

面向安环/值班/物资/积分等业务的综合管理平台，前端基于 Next.js，后端 API 通过 Hono 聚合在同一代码库内。

## 技术栈

- Next.js App Router
- Hono（统一 API 路由入口）
- Drizzle ORM（SQLite）
- React Query、Zustand、React Hook Form

## 本地开发

```bash
# 安装依赖
pnpm install

# 数据库迁移（首次运行或 schema 变更后）
pnpm db:migrate

# 启动开发服务器
pnpm dev
```

### 常用命令

| 命令               | 说明                     |
| ------------------ | ------------------------ |
| `pnpm dev`         | 启动开发服务器           |
| `pnpm build`       | 构建生产版本             |
| `pnpm start`       | 运行生产版本（端口 802） |
| `pnpm db:generate` | 生成数据库迁移文件       |
| `pnpm db:migrate`  | 执行数据库迁移           |
| `pnpm lint`        | 代码检查                 |

## 环境变量

- `NEXT_PUBLIC_API_CONFIG_LOCAL`：本地 API Base URL（例如 `http://localhost:3000/api`）
- `NEXT_PUBLIC_API_CONFIG_IMS`：IMS 服务地址
- `JWT_SECRET`：权限 JWT 签名密钥
- `DATABASE_URL`：数据库连接字符串（SQLite: `file:./ehs.sqlite`，PostgreSQL: `postgres://...`）
- `WEBHOOK_BASE_URL`：企业微信 Webhook 基地址（默认 `https://qyapi.weixin.qq.com/cgi-bin/webhook/send`）
- `SCHEDULER_WORKER_PATH`：可选，定时任务 Worker 路径覆盖
- `SCHEDULER_MAX_CONCURRENCY`：可选，定时任务并发上限
- `POSTGRES_URL`：PostgreSQL 数据库连接字符串（使用 PostgreSQL 时需要）

## 数据库配置

项目默认使用 SQLite（`ehs.sqlite`），也支持 PostgreSQL：

- **SQLite**：开箱即用，无需额外配置
- **PostgreSQL**：设置 `POSTGRES_URL` 环境变量，并使用 `drizzle.pg.config.ts` 进行迁移

## 目录结构

- `src/app`：前端页面与 API 路由入口（`src/app/api/[...route]/route.ts`）
- `src/features`：业务模块 UI
- `src/config`：菜单与 API 配置
- `src/stores`：全局状态（用户信息、权限）
- `server/api`：Hono API 模块（route/controller/services 分层）
- `server/db`：数据库连接与 schema
- `server/utils/scheduler`：定时任务调度与 Worker

## API 架构

- 统一入口：`src/app/api/[...route]/route.ts` 通过 `hono/vercel` 将 `server/api/index.ts` 挂载为 `/api` 路由。
- 模块分层：每个 API 模块遵循 `route.ts`（路由）→ `controller.ts`（校验/响应）→ `services.ts`（业务逻辑/DB）。
- 数据访问：`server/db/db` + `server/db/schema.ts`（Drizzle ORM）。

## 权限架构

权限分为三层：API 权限、路由权限、菜单权限。

- 权限定义表：`permission_definition`（`server/db/schema.ts`）
  - `code`：权限代码，例如 `ADMIN`
  - `routes`：可访问的路由前缀列表（JSON string）
- 用户权限表：`user_permission`
  - `employeeId` → `permissions`（JSON string）
- 登录流程：`/api/auth/login` 调用 IMS 登录 → 读取 `user_permission` → 签发 `Permission-Token`（JWT，HttpOnly）
- API 权限：`server/middleware/auth.ts` 中 `authMiddleware` + `requirePermission` 控制
- 路由权限：`getPermissionRouteMap()` 由 `permission_definition.routes` 构建路由前缀映射
- 菜单权限：`src/config/sidebar.ts` 中 `require` 字段控制显示；`AppSidebar` 按用户权限过滤

## 如何设置权限

### 1) 创建权限定义（API 权限/路由权限基础）

API：`POST /api/system/permissions/definitions`

```json
{
  "code": "DUTY",
  "name": "值班管理",
  "description": "值班相关模块",
  "routes": ["/dutyManagement", "/api/dutyLog", "/api/dutySchedule"]
}
```

### 2) 给用户绑定权限

API：`POST /api/system/permissions/users`

```json
{
  "employeeId": "A001234",
  "permissions": ["DUTY", "POINT"]
}
```

### 3) API 使用权限

在路由定义中加 `requirePermission("CODE")`：

```ts
permissionsRouter.get(
  "/definitions",
  requirePermission("ADMIN"),
  getPermissionDefinitionsController,
);
```

### 4) 路由权限

将需要保护的页面/接口前缀加入权限定义的 `routes` 字段。路由前缀匹配逻辑在
`server/api/system/permissions/services.ts:getPermissionRouteMap()`。

### 5) 菜单权限

在 `src/config/sidebar.ts` 的菜单项上加入 `require`，前端会按权限过滤显示：

```ts
{
  title: "权限管理",
  url: "/system/permissions",
  require: "ADMIN"
}
```

## 现有模块

- 系统管理：权限管理、Webhook 配置、定时任务（`/system/permissions`、`/system/webhook`、`/system/corn`）
- 值班管理：人员、日志、稽查、换班、排班（`/dutyManagement/*`）
- 积分管理：人员、分类、事件、日志、排名、KPI（`/points/*`）
- 物资管理：库存、申请、审批、出入库记录（`/goods/*`）
- 锁具管理：申请、审批、库存（`/lockApplication`、`/lockApproval`、`/lockInventory`）
- Webhook：值班日志推送、带班通知、日志稽查（`server/api/webhook/*`）
- 认证：IMS 登录、权限 Token（`server/api/auth`）

### 生产环境

```bash
pnpm build
pnpm start
```
