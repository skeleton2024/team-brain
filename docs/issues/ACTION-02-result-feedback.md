# ACTION-02 Result Feedback

## 目标

完善 Result Feedback 输入和记录，让用户能把行动执行结果结构化写回系统，并保留可追溯证据。

## 背景

当前系统已有 `recordActionResult()` 和基础结果回流，但还缺少完整 review flow。Wave 3 需要让 result 成为行动闭环的正式输入：说明 outcome、what changed、new evidence、是否需要 follow-up，并能被后续 memory update 和 Project Node 状态建议消费。

## 涉及领域

Action / Result / Memory / ProjectNode / UI / QA

## 涉及文件

- `src/domain/agentEngine.js`
- `src/main.js`
- `src/ui/render.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

优先消费现有 `ActionResult.outcome`、`summary`、`whatChanged`、`newEvidence`、`followUpNeeded`、`relatedMemoryUpdates` 和 `memoryIds`。如需新增结果 review 状态，必须同步 `DATA_MODEL.md`。

## UI / 交互

- Result Feedback 表单支持 outcome、summary、what changed、new evidence、follow-up needed。
- 结果保存后展示在 action / node / memory 相关区域。
- 用户能看见结果是否产生 memory update 建议。

## 明确不做

- 不自动执行 follow-up action。
- 不自动覆盖旧 memory。
- 不接外部消息或任务系统。
- 不做复杂审批流。

## 验收标准

1. 用户可以结构化录入 action result。
2. Result 能回写 action 状态，并挂到相关 Project Node。
3. Result 生成的上下文和 memory 能追溯到原始 result。
4. UI 能展示 result 的 what changed、new evidence 和 follow-up 标记。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- 更新 `DATA_MODEL.md`、`PROJECT_FUNCTION_STRUCTURE.md` 和 `docs/FILE_FUNCTION_NOTES.md`。
