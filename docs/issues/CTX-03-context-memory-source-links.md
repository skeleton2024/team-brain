# CTX-03 建立上下文和记忆的来源引用

## 目标

让每条公司记忆都能回到原始上下文，用户可以验证 TeamMind 为什么得出这个判断。

## 用户价值

用户不需要盲信 AI 生成的公司记忆。看到“客户担心数据权限”时，可以点开来源，回到原始访谈片段。

## 涉及领域

Context Intake, Company Memory

## 涉及模块

- `src/domain/types.js`
- `src/domain/agentEngine.js`
- `src/domain/pipelines/extractMemories.js`
- `src/ui/render.js`
- `src/main.js`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

## 数据结构变化

新增或补齐：

```text
SourceReference
  contextId: string
  quote: string
  note?: string
  confidence?: number
```

`MemoryItem` 增加：

```text
sourceReferences: SourceReference[]
```

## Domain 行为

提取 memory 时：

- 每条新 memory 至少包含一个 `sourceReferences`。
- `contextId` 指向本次输入的 context。
- `quote` 使用能支持该 memory 的原文片段。

如果本地规则引擎无法精确定位片段：

- 可以先使用触发该 memory 的句子。
- 如果句子太长，截取合理长度。
- 不要留空。

## UI 行为

Memory 卡片显示：

- 来源数量。
- 来源上下文标题。

Memory 详情或展开区域显示：

- 引用片段。
- 点击来源可查看 Context 原文。

## 不做范围

- 不做全文高亮定位。
- 不做向量检索。
- 不做跨项目引用。
- 不做复杂引用版本管理。

## 验收标准

1. 新提取的 memory 都有 `sourceReferences`。
2. UI 能看到每条 memory 的来源数量。
3. 用户能从 memory 查看来源 context 标题和引用片段。
4. Demo 数据中的 memory 带来源引用。
5. `node scripts/smoke-test.mjs` 通过。

## 测试建议

- 输入一段客户反馈，检查生成的客户顾虑是否包含原文片段。
- 输入一段工程进展，检查工程阻塞 memory 的 `contextId` 是否正确。
- 删除或切换项目后不应出现错误引用。

