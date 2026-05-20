# MEM-05 Memory Governance Live

## 目标

让 memory 状态真正影响系统展示、行动建议和优先级，而不是只作为卡片上的静态标签。

## 背景

Wave 0 到 Wave 2 已经具备 memory 状态、来源引用、Entity Profile 和 Project Node。Wave 3 需要把 memory governance 接入 Action Loop：confirmed memory 应更积极参与行动和 brief，draft memory 需要提示确认，outdated / disputed / archived memory 不能继续作为强证据推动下一步。

## 涉及领域

Memory / Action / ProjectNode / UI / QA

## 涉及文件

- `src/domain/agentEngine.js`
- `src/ui/render.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

优先消费现有 `MemoryItem.status`、`confidence`、`lastVerifiedAt` 和 `sourceReferences`。如需新增轻量派生字段，必须同步 `DATA_MODEL.md`。

## UI / 交互

- Memory 区域显示 governance summary：可信、待确认、过期、争议、归档数量。
- Action / Brief 相关展示能区分强证据和弱证据。
- 用户仍通过现有 memory 状态按钮人工治理，不自动覆盖旧判断。

## 明确不做

- 不自动删除 memory。
- 不自动把 disputed / outdated memory 覆盖为新事实。
- 不接真实 AI provider。
- 不接 Gmail / Slack API。
- 不自动执行外部动作。

## 验收标准

1. confirmed memory 在行动建议和 brief 证据中优先出现。
2. archived / outdated memory 默认不再作为新 action 的证据。
3. disputed memory 可以展示，但在行动或 brief 中标记为需要人工确认。
4. UI 能看到 memory governance 对当前项目的影响。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- 更新 `DATA_MODEL.md`、`PROJECT_FUNCTION_STRUCTURE.md` 和 `docs/FILE_FUNCTION_NOTES.md` 中与 memory governance 相关的说明。
