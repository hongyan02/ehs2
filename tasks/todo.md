# Tasks

## 2026-03-13 人员新增模态框手动录入无法提交

- [x] 检查 `src/features/points/components/PersonManagement.tsx` 和 `src/features/points/components/PersonDialog.tsx`，确认未调用 API 的根因
- [x] 修复 `PersonDialog` 中姓名/工号的表单状态同步，保证可提交列表外人员
- [x] 补充表单校验反馈，避免提交被静默拦截
- [x] 运行针对性的静态验证

## Review

- 根因：`name` 和 `no` 同时被 `Controller` 与隐藏 `register` 字段重复注册。手动输入列表外人员时，自动完成组件更新了 `Controller` 的值，但隐藏字段仍为空，导致 `required` 校验失败，`handleSubmit` 未执行，所以没有发起创建 API。
- 修复：移除重复注册的隐藏字段，改为只使用 `Controller` 管理自动完成字段；根据 `field.value` 派生当前选项，保证手动输入值会回写到表单状态；补充错误提示，避免再次出现“按钮没反应”的静默失败。
- 验证：`npx eslint src/features/points/components/PersonDialog.tsx` 通过；`npx tsc --noEmit` 通过。
