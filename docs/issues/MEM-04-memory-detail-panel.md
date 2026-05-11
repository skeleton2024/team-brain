# MEM-04 增加记忆详情面板

## 目标

让用户能打开一条公司记忆，查看它的来源、关联行动和执行结果。

## 用户价值

团队不只需要“记忆列表”，还需要理解每条记忆为什么存在、影响过哪些行动、是否被后续结果验证或推翻。

## 涉及领域

Company Memory, Context Intake, Action Planning, Result Feedback

## 涉及模块

- `src/ui/render.js`
- `src/main.js`
- `src/domain/types.js`
- `src/data/demo.js`

## 数据结构变化

优先复用现有关系：

- `MemoryItem.sourceReferences[].contextId`
- `ActionItem.evidenceMemoryIds[]`
- `ActionResult.relatedMemoryUpdates[]`

如当前缺少字段，先按 `DATA_MODEL.md` 补齐。

## UI 行为

点击 memory 后显示详情面板。

详情内容：

- 标题、类型、状态、置信度。
- 完整内容。
- 来源上下文和引用片段。
- 关联 actions。
- 关联 results 或 memory updates。

交互：

- 可以从来源跳到 context 原文。
- 可以从关联 action 跳到 action detail 或 Brief。
- 可以进入编辑态。

## 不做范围

- 不做复杂图谱视图。
- 不做跨项目关系。
- 不做全文搜索。
- 不做协作评论。

## 验收标准

1. 用户可以打开 memory 详情。
2. 详情中能看到来源 context 和 quote。
3. 详情中能看到引用该 memory 的 actions。
4. 详情不会破坏当前 Brief/Action 选择状态。
5. `node scripts/smoke-test.mjs` 通过。

## 测试建议

- 打开 demo 中一条有来源的 memory。
- 点击来源 context，确认能看到原文。
- 生成 Brief 后，检查相关 memory 详情是否显示关联 action。

