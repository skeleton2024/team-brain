# REC-02 新增 reconcileMemories pipeline

## 目标

让系统处理“公司认知变化”，而不是每次输入上下文都机械追加新记忆。

## 用户价值

当新的客户反馈推翻旧判断时，TeamMind 应该提示“这条旧记忆可能过期”或“新旧信息有冲突”，而不是让列表越来越乱。

## 涉及领域

Memory Reconciliation, Company Memory

## 涉及模块

- `src/domain/pipelines/reconcileMemories.js`
- `src/domain/pipelines/extractMemories.js`
- `src/domain/agentEngine.js`
- `src/domain/types.js`
- `src/ui/render.js`
- `scripts/smoke-test.mjs`

## 代码结构变化

新增：

```text
src/domain/pipelines/reconcileMemories.js
```

建议导出：

```text
reconcileMemories({ existingMemories, candidateMemories, now })
```

返回：

```text
{
  acceptedMemories: MemoryItem[],
  reconciliationResults: ReconciliationResult[],
  memoryUpdates: RelatedMemoryUpdate[]
}
```

## Domain 行为

至少支持：

```text
new
duplicate
update
conflict
outdate
```

第一版规则可以简单：

- 同 type 且 title/content 高度相似：`duplicate`。
- 同 type 且主题相同但内容更完整：`update`。
- 同 type 且出现明显否定或相反判断：`conflict` 或 `outdate`。
- 无匹配：`new`。

## UI 行为

第一版可以先轻量展示：

- 本次新增了几条记忆。
- 跳过了几条重复记忆。
- 发现了几条冲突或过期建议。

冲突处理的完整交互可放到后续 `REC-03`。

## 不做范围

- 不做复杂语义相似度。
- 不做向量数据库。
- 不做自动覆盖冲突记忆。
- 不做多人审核流。

## 验收标准

1. 重复输入同一段上下文，不会无限新增完全相同 memory。
2. 输入“客户已经不担心价格”时，如果旧 memory 是“客户担心价格”，系统能产生过期或冲突提示。
3. `conflict` 不自动覆盖旧 memory。
4. `reconciliationResults` 可被 UI 或 AgentRun 查看。
5. `node scripts/smoke-test.mjs` 通过。

## 测试建议

- 连续输入两次同一客户反馈。
- 先输入“客户担心价格”，再输入“客户明确表示价格不是问题”。
- 检查 memory 数量和 reconciliation result。

