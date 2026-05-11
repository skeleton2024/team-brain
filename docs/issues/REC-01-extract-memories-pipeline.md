# REC-01 拆出 extractMemories pipeline

## 目标

把记忆提取逻辑从 `agentEngine.js` 中拆出来，为后续真实 AI provider 和 schema 校验做准备。

## 用户价值

这个 issue 不直接增加新 UI，但它能减少后续开发混乱，让“提取记忆”成为一个可测试、可替换、可审计的独立能力。

## 涉及领域

Memory Reconciliation

## 涉及模块

- `src/domain/agentEngine.js`
- `src/domain/pipelines/extractMemories.js`
- `src/domain/types.js`
- `scripts/smoke-test.mjs`

## 代码结构变化

新增：

```text
src/domain/pipelines/extractMemories.js
```

建议导出：

```text
extractMemories({ project, context, now })
```

返回：

```text
{
  memories: MemoryItem[],
  runSummary: string
}
```

## Domain 行为

- 保持 `absorbContext(project, input)` 对外行为不变。
- 现有本地规则可以移动到 pipeline 文件。
- 每条 memory 保持或补齐 `sourceReferences`。
- 不在 pipeline 中直接保存 state。

## 不做范围

- 不接真实 LLM。
- 不做 reconciliation。
- 不改 UI。
- 不大改 action 生成。

## 验收标准

1. `agentEngine.js` 中的 memory 提取逻辑被迁移到 `extractMemories.js`。
2. `absorbContext()` 的调用方不需要改变。
3. 输入上下文后仍能生成 memory。
4. 新 memory 结构符合 `DATA_MODEL.md`。
5. `node scripts/smoke-test.mjs` 通过。

## 测试建议

- 对 demo project 跑 smoke test。
- 手动输入客户反馈、工程进展、投资人问题，检查 memory 类型仍合理。

