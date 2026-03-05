import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

//值班人员库
export const dutyStaff = sqliteTable("dutyStaff", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 姓名
  name: text("name").notNull(),

  // 工号
  no: text("no").notNull(),

  // 职位
  position: text("position"),

  // 班次：0=白班，1=夜班
  shift: integer("shift").notNull(),

  // 电话
  phone: text("phone"),

  //状态
  status: integer("status").notNull(),
});

//值班表库
export const dutySchedule = sqliteTable("dutySchedule", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 日期：YYYY-MM-DD
  date: text("date").notNull(),

  // 班次：0=白班，1=夜班
  shift: integer("shift").notNull(),

  // 当天排班的值班人姓名
  name: text("name").notNull(),

  // 工号
  no: text("no").notNull(),

  // 职位
  position: text("position"),
});

//换班表
export const dutySwap = sqliteTable("dutySwap", {
  // 主键
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 换班人（发起换班的人）
  from_name: text("from_name").notNull(), // 换班人姓名
  from_no: text("from_no").notNull(), // 换班人工号
  from_position: text("from_position").notNull(), // 换班人职位
  from_date: text("from_date").notNull(), // 换班日期：YYYY-MM-DD
  from_shift: integer("from_shift").notNull(), // 换班人班次：0=白班，1=夜班

  // 被换人（顶班/与之互换的人）
  to_name: text("to_name").notNull(), // 被换人姓名
  to_no: text("to_no").notNull(), // 被换人工号
  to_position: text("to_position").notNull(), // 被换人职位
  to_date: text("to_date").notNull(), // 被换日期：YYYY-MM-DD
  to_shift: integer("to_shift").notNull(), // 被换人班次：0=白班，1=夜班

  // 状态：0=申请中，1=已同意，2=已拒绝，3=已取消
  status: integer("status").notNull().default(0),

  // 原因说明
  reason: text("reason"),

  // 创建时间 & 更新时间（YYYY-MM-DD hh-mm-ss）
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

//值班日志库
export const dutyLog = sqliteTable("dutyLog", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 填写人姓名
  name: text("name").notNull(),

  // 填写人工号
  no: text("no").notNull(),

  // 日期：YYYY-MM-DD
  date: text("date").notNull(),

  // 班次：0=白班，1=夜班
  shift: integer("shift").notNull(),

  // 日志内容
  log: text("log").notNull(),

  // 待办事项
  todo: text("todo"),

  // 创建时间：YYYY-MM-DD hh-mm-ss
  createTime: text("create_time").notNull(),

  // 更新时间：YYYY-MM-DD hh-mm-ss
  updateTime: text("update_time").notNull(),
});

//物料库存表
export const materialStore = sqliteTable("materialStore", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 物料编码，唯一标识一个物料
  materialCode: text("material_code").notNull().unique(),

  // 物料名称
  materialName: text("material_name").notNull(),

  // 规格型号
  spec: text("spec"),

  // 单位（个/包/箱等）
  unit: text("unit").notNull(),

  // 当前库存数量
  num: integer("num").notNull().default(0),

  // 库存下限阈值
  threshold: integer("threshold").notNull().default(0),

  // 物料类别（劳保/办公/维修等）
  type: text("type"),

  // 存放位置（仓库/货架）
  location: text("location"),

  // 供应商 / 品牌
  supplier: text("supplier"),

  // 创建时间（使用文本 YYYY-MM-DD hh-mm-ss）
  createTime: text("create_time").notNull(),

  // 更新时间（使用文本 YYYY-MM-DD hh-mm-ss）
  updateTime: text("updated_time").notNull(),
});

//申请单表
export const application = sqliteTable("application", {
  // id
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 申请单号
  applicationCode: text("application_code").notNull().unique(),

  //标题
  title: text("title").notNull(),

  // 操作类型：IN / OUT
  operation: text("operation", { enum: ["IN", "OUT"] }).notNull(),

  // 申请时间
  applicationTime: text("application_time").notNull(),

  // 申请人姓名
  applicant: text("applicant").notNull(),

  // 申请人工号
  applicantNo: text("applicant_no").notNull(),

  //审批时间
  approveTime: text("approve_time"),

  //审批人姓名
  approver: text("approver"),

  //审批人工号
  approverNo: text("approver_no"),

  // 来源（部门/项目）
  origin: text("origin"),

  // 用途说明
  purpose: text("purpose"),

  // 状态：0=未提交 1=已保存 2=待审核，3=已完成，4=已驳回 5=废弃
  status: integer("status").notNull().default(0),

  // 创建时间（使用文本 YYYY-MM-DD hh-mm-ss）
  createTime: text("create_time").notNull(),

  // 更新时间（使用文本 YYYY-MM-DD hh-mm-ss）
  updateTime: text("updated_time").notNull(),
});

//申请明细表
export const applicationDetail = sqliteTable("application_detail", {
  //id
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 所属申请单号（application.application_code）
  applicationCode: text("application_code").notNull(),

  // 物料编码（对应 materialStore.material_code）
  materialCode: text("material_code").notNull(),

  // 物料名称快照（记录当时的名称，避免主数据修改影响历史记录）
  materialName: text("material_name").notNull(),

  // 规格型号快照
  spec: text("spec"),

  // 单位快照
  unit: text("unit").notNull(),

  // 申请数量
  quantity: integer("quantity").notNull(),

  // 类别快照（可选，方便统计）
  type: text("type"),

  // 备注
  remark: text("remark"),
});

//操作记录表
export const materialLog = sqliteTable("material_log", {
  //id
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 来源申请单号
  applicationCode: text("application_code").notNull(),

  // 物料编码（唯一标识物料）
  materialCode: text("material_code").notNull(),

  // 物料名称快照
  materialName: text("material_name").notNull(),

  // 规格型号快照
  spec: text("spec"),

  // 单位快照
  unit: text("unit").notNull(),

  // 操作数量（正数）
  quantity: integer("quantity").notNull(),

  // 操作类型：IN / OUT
  operation: text("operation", { enum: ["IN", "OUT"] }).notNull(),

  // 操作人（仓管员）
  // operator: text("operator").notNull(),

  // 实际出入库位置（仓库/货架位）
  location: text("location"),

  // 来源（部门/项目），方便统计“哪个部门用了多少”
  origin: text("origin"),

  // 备注
  remark: text("remark"),

  //时间（使用文本 YYYY-MM-DD hh-mm-ss）
  time: text("time").notNull(),
});

// 权限定义表
export const permissionDefinition = sqliteTable("permission_definition", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(), // 权限代码，如 "ADMIN"
  name: text("name").notNull(), // 权限名称，如 "系统管理员"
  description: text("description"), // 权限描述
  routes: text("routes").notNull(), // JSON string of string[], 可访问的路由列表
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// 用户权限表
export const userPermission = sqliteTable("user_permission", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: text("employee_id").unique().notNull(),
  permissions: text("permissions").notNull(), // JSON string of string[]
  createdAt: text("created_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss
  updatedAt: text("updated_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss
});

//积分人员表
export const pointPerson = sqliteTable("point_person", {
  //自增主键ID
  id: integer("id").primaryKey({ autoIncrement: true }),

  //工号
  no: text("no").unique().notNull(),

  //姓名
  name: text("name").notNull(),

  //部门
  dept: text("dept"),

  //0=禁用，1=启用
  active: integer("active").notNull().default(1),

  //创建时间
  createdAt: text("created_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss

  //更新时间
  updatedAt: text("updated_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss
});

//积分分类表
export const pointCategories = sqliteTable("point_categories", {
  //自增主键ID
  id: integer("id").primaryKey({ autoIncrement: true }),

  //积分分类名称
  categoryName: text("category_name").notNull(),

  //积分分类描述
  description: text("description"),

  //创建时间
  createdAt: text("created_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss

  //更新时间
  updatedAt: text("updated_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss
});

//积分事件表
export const pointEvent = sqliteTable("point_event", {
  //自增主键ID
  id: integer("id").primaryKey({ autoIncrement: true }),

  //积分事件名称
  name: text("name").notNull(),

  //积分事件描述
  description: text("description"),

  //积分事件类型
  categoryId: integer("category_id").notNull(),

  //积分事件默认积分
  defaultPoint: integer("default_point").notNull(),

  //创建时间
  createdAt: text("created_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss

  //更新时间
  updatedAt: text("updated_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss
});

//积分记录表
export const pointLog = sqliteTable("point_log", {
  //自增主键ID
  id: integer("id").primaryKey({ autoIncrement: true }),

  //积分事件名称
  pointName: text("point_name").notNull(),

  //积分事件描述
  description: text("description"),

  //积分ID
  eventId: integer("event_id").notNull(),

  //积分事件默认积分
  defaultPoint: integer("default_point").notNull(),

  //实际积分
  point: integer("point").notNull(),

  //工号
  no: text("no").notNull(),

  //姓名
  name: text("name").notNull(),

  //部门
  dept: text("dept").notNull(),

  //月份
  month: text("month").notNull(),

  //创建时间
  createdAt: text("created_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss

  //更新时间
  updatedAt: text("updated_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss
}, (table) => ({
  //月份索引
  idxMonth: index("idx_point_log_month").on(table.month),
  //月份部门索引
  idxMonthDept: index("idx_point_log_month_dept").on(table.month, table.dept),
  //工号月份索引
  idxNoMonth: index("idx_point_log_no_month").on(table.no, table.month),
}));

export const webhookConfig = sqliteTable("webhook_config", {
  //自增主键ID
  id: integer("id").primaryKey({ autoIncrement: true }),

  //webhook key
  webhookKey: text("webhook_key").notNull(),

  //场景
  scene: text("scene").notNull(),

  //描述
  description: text("description"),

  //创建时间
  createdAt: text("created_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss

  //更新时间
  updatedAt: text("updated_at").notNull(), // 格式：YYYY-MM-DD HH:mm:ss
});

// ============================================
// Lock Application Tables
// ============================================

// 锁具申请表
export const lockApplication = sqliteTable("lock_application", {
  // 主键
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 申请单号
  applicationCode: text("application_code").notNull().unique(),

  // 申请人姓名
  applicantName: text("applicant_name").notNull(),

  // 申请人工号
  applicantNo: text("applicant_no").notNull(),

  // 部门
  department: text("department").notNull(),

  // 联系电话
  phone: text("phone").notNull(),

  // 所属产线
  productionLine: text("production_line"),

  // 工序
  process: text("process"),

  // 班组
  team: text("team"),

  // 上岗证照片URL
  certificatePhoto: text("certificate_photo"),

  // 组长/主管
  leaderName: text("leader_name"),
  leaderNo: text("leader_no"),

  // 部门长
  managerName: text("manager_name"),
  managerNo: text("manager_no"),

  // 安环部审批人
  safetyOfficerName: text("safety_officer_name"),
  safetyOfficerNo: text("safety_officer_no"),

  // 状态
  status: text("status").notNull().default("submitted"),
  // draft/submitted/approval_l1/approval_l2/approval_l3/exam_eligible/exam_passed/registration/registered/rejected

  // 当前审批级别
  currentApprovalLevel: integer("current_approval_level").default(1),

  // 申请时间
  applicationTime: text("application_time").notNull(),

  // 创建时间
  createTime: text("create_time").notNull(),

  // 更新时间
  updateTime: text("update_time").notNull(),
});

// 审批记录表
export const lockApproval = sqliteTable("lock_approval", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 申请ID
  applicationId: integer("application_id").notNull(),

  // 审批级别 (1=组长/主管, 2=部门长, 3=安环部, 4=登记审批)
  approvalLevel: integer("approval_level").notNull(),

  // 审批状态 (实际存储值: approve/reject)
  status: text("status").notNull(), // pending/approve/reject

  // 审批人
  approver: text("approver"),

  // 审批人工号
  approverNo: text("approver_no"),

  // 审批意见
  comment: text("comment"),

  // 审批时间
  approvalTime: text("approval_time"),

  // 创建时间
  createTime: text("create_time").notNull(),
});

// 考试结果表
export const examResult = sqliteTable("exam_result", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 申请ID
  applicationId: integer("application_id").notNull(),

  // 是否通过
  passed: integer("passed").notNull(), // 0=false, 1=true

  // 考试分数
  score: integer("score").notNull(),

  // 考试日期
  examDate: text("exam_date").notNull(),

  // 备注
  remark: text("remark"),

  // 录入人
  enteredBy: text("entered_by"),

  // 创建时间
  createTime: text("create_time").notNull(),

  // ========================================
  // 实操考核相关字段
  // ========================================

  // 实操考核日期
  practiceDate: text("practice_date"),

  // 实操考核是否通过 (0=false, 1=true)
  practicePassed: integer("practice_passed"),

  // 实操考核分数
  practiceScore: integer("practice_score"),

  // 分配的锁具类型 (red/yellow)
  lockType: text("lock_type"),

  // 分配的锁具数量
  lockQuantity: integer("lock_quantity"),

  // 理论成绩截图URL
  screenshotUrl: text("screenshot_url"),
});

// 匿名访问Token表
export const anonymousToken = sqliteTable("anonymous_token", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Token值
  token: text("token").notNull().unique(),

  // 关联的申请ID（可选）
  applicationId: integer("application_id"),

  // 到期时间
  expiresAt: text("expires_at"),

  // 创建时间
  createTime: text("create_time").notNull(),

  // 更新时间
  updateTime: text("update_time").notNull(),
});

// ============================================
// Lock Module Config Tables
// ============================================

// 锁具配置表 (部门、工序、班组枚举值)
export const lockConfig = sqliteTable("lock_config", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 类型: department=部门, process=工序, team=班组
  type: text("type").notNull(),

  // 配置名称
  name: text("name").notNull(),

  // 配置编码 (工序用)
  code: text("code"),

  // 工序ID (班组用，关联到工序)
  processId: integer("process_id"),

  // 责任经理姓名 (工序用)
  managerName: text("manager_name"),

  // 责任经理工号 (工序用)
  managerNo: text("manager_no"),

  // 安环工程师姓名
  safetyEngineerName: text("safety_engineer_name"),

  // 安环工程师工号
  safetyEngineerNo: text("safety_engineer_no"),

  // 排序
  sortOrder: integer("sort_order").default(0),

  // 状态: 0=禁用, 1=启用
  status: integer("status").default(1),

  // 创建时间
  createTime: text("create_time").notNull(),

  // 更新时间
  updateTime: text("update_time").notNull(),
});

// 亿纬学堂考试配置表
export const lockExamConfig = sqliteTable("lock_exam_config", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 亿纬学堂课程链接
  courseUrl: text("course_url"),

  // 及格分数
  passingScore: integer("passing_score").default(60),

  // 实操考核文件URL
  practiceFileUrl: text("practice_file_url"),

  // 状态: 0=禁用, 1=启用
  status: integer("status").default(1),

  // 备注
  remark: text("remark"),

  // 创建时间
  createTime: text("create_time").notNull(),

  // 更新时间
  updateTime: text("update_time").notNull(),
});

// 锁具库存表
export const lockInventory = sqliteTable("lock_inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 锁具编号
  lockNumber: text("lock_number").notNull().unique(),

  // 锁具类别 (red/yellow)
  lockType: text("lock_type").notNull(),

  // 持有人姓名
  holderName: text("holder_name").notNull(),

  // 持有人工号
  holderNo: text("holder_no").notNull(),

  // 部门
  department: text("department").notNull(),

  // 所属申请单号
  applicationCode: text("application_code").notNull(),

  // 状态: in_use=使用中, returned=已归还, scrapped=已报废
  status: text("status").notNull().default("in_use"),

  // 登记时间
  registerTime: text("register_time").notNull(),

  // 创建时间
  createTime: text("create_time").notNull(),

  // 更新时间
  updateTime: text("update_time").notNull(),
});

// ============================================
// System Module Tables 
// ============================================

// 通用审批人员表
export const systemApprover = sqliteTable("system_approver", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 姓名
  name: text("name").notNull(),

  // 工号
  no: text("no").notNull(),

  // 状态: 0=禁用, 1=启用
  status: integer("status").default(1),

  // 创建时间
  createTime: text("create_time").notNull(),

  // 更新时间
  updateTime: text("update_time").notNull(),
});
