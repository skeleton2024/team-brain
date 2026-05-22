# REC-03 Result To Memory Update

## 目标

根据 action result 生成 memory update 建议、follow-up action 和 project / node 状态变化建议，让真实反馈进入下一轮判断。

## 背景

TeamMind 的核心价值是学习闭环。当前 result 已能生成 result learning memory 和部分 pending memory updates，但 Wave 3 需要把这条路径产品化：结果可以确认、更新、争议化或淘汰旧 memory，也可以产生下一步 action 和节点状态建议，但关键变更仍需人工确认。

## 涉及领域

Reconciliation / Result / Memory / Action / ProjectNode / QA

## 涉及文件

- `src/domain/agentEngine.js`
- `src/domain/pipelines/reconcileMemories.js`
- `src/ui/render.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

优先消费现有 `RelatedMemoryUpdate`、`pendingMemoryUpdates`、`reconciliationResults`、`ActionResult.memoryIds` 和 `ProjectNode.resultIds`。如新增 project / node 状态建议字段，必须同步 `DATA_MODEL.md`。

## UI / 交互

- Result 保存后展示 memory update 建议。
- 用户可以看到建议操作：confirm / update / dispute / outdate / archive。
- Follow-up action 保持 pending / draft，不自动执行。
- Project Node 可以显示 result 带来的状态或下一步建议。

## 明确不做

- 不自动应用高影响 memory update。
- 不自动关闭项目或节点。
- 不自动发送 follow-up。
- 不接外部 API。

## 验收标准

1. Positive result 可以建议确认或更新相关 memory。
2. Negative / blocked result 可以建议 dispute / outdate 相关 memory。
3. 需要后续动作时生成 pending follow-up action。
4. Project Node 能展示 result 和下一步建议。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- 更新 `DATA_MODEL.md`、`PROJECT_FUNCTION_STRUCTURE.md` 和 `docs/FILE_FUNCTION_NOTES.md`。
