# MEM-03 支持记忆状态切换

## 目标

让用户能快速确认、标记过期、标记争议或归档记忆。

## 用户价值

TeamMind 的公司记忆不是静态笔记。创业团队认知会变化，系统必须允许用户管理记忆的可信状态。

## 涉及领域

Company Memory, Action Planning

## 涉及模块

- `src/domain/types.js`
- `src/ui/render.js`
- `src/main.js`
- `src/domain/agentEngine.js`
- `src/domain/pipelines/planActions.js`
- `scripts/smoke-test.mjs`

## 数据结构变化

沿用：

```text
MemoryStatus = "draft" | "confirmed" | "outdated" | "disputed" | "archived"
```

状态切换时更新：

```text
status
updatedAt
lastVerifiedAt
```

## UI 行为

Memory 卡片提供快捷状态操作：

- 确认。
- 标记过期。
- 标记有争议。
- 归档。

状态切换后：

- 立即保存。
- 状态 badge 更新。
- 如果变为 confirmed，记录 `lastVerifiedAt`。

## Domain 行为

行动生成时：

- `confirmed` 记忆优先参与。
- `draft` 可以参与，但权重低，行动应提示依据未确认。
- `outdated` 和 `archived` 默认不参与。
- `disputed` 不作为强证据。

## 不做范围

- 不做复杂审批流。
- 不做权限控制。
- 不做自动合并冲突。
- 不做完整版本历史。

## 验收标准

1. 用户可以快速切换 memory 状态。
2. confirmed 状态记录 `lastVerifiedAt`。
3. archived/outdated memory 不再作为新 action 的主要证据。
4. UI 能清楚区分不同状态。
5. `node scripts/smoke-test.mjs` 通过。

## 测试建议

- 将一条重要 memory 归档，再输入新上下文，确认新 action 不优先引用它。
- 将 draft 改为 confirmed，确认 UI 显示已确认。

