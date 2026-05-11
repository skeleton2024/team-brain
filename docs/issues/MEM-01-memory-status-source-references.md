# MEM-01 增加 memory status 和 sourceReferences

## 目标

让公司记忆从“系统生成的文本”升级为“可确认、可追溯的公司资产”。

## 用户价值

用户可以区分哪些记忆只是 AI 草稿，哪些已经被人工确认。团队后续做行动规划时，不会把未经确认的信息当作事实。

## 涉及领域

Company Memory

## 涉及模块

- `src/domain/types.js`
- `src/domain/agentEngine.js`
- `src/domain/pipelines/extractMemories.js`
- `src/ui/render.js`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

## 数据结构变化

`MemoryItem` 增加：

```text
status: "draft" | "confirmed" | "outdated" | "disputed" | "archived"
sourceReferences: SourceReference[]
createdBy: "ai" | "human"
updatedAt: string
lastVerifiedAt?: string
```

默认值：

- AI 新生成 memory：`status = "draft"`。
- Demo 中人工确认过的 memory：`status = "confirmed"`。
- `createdBy` 默认 `ai`。

## UI 行为

Memory 卡片展示：

- 状态 badge。
- 来源数量。
- 置信度。

建议状态文案：

```text
draft: 待确认
confirmed: 已确认
outdated: 已过期
disputed: 有争议
archived: 已归档
```

## Domain 行为

- 新 memory 必须有 status。
- 新 memory 必须有 sourceReferences。
- 暂时不改变 action ranking，后续 MEM-03/ACT-02 再使用状态权重。

## 不做范围

- 不做编辑记忆。
- 不做状态切换。
- 不做冲突处理。
- 不做真实 AI。

## 验收标准

1. 新提取的 memory 默认显示为“待确认”。
2. Demo memory 能显示不同状态。
3. 每张 memory 卡能显示来源数量。
4. 旧数据没有 status 时不会白屏，并能显示默认状态。
5. `node scripts/smoke-test.mjs` 通过。

## 测试建议

- 重置 demo，查看 memory 状态。
- 新增上下文，检查新增 memory 状态。
- 手动清空 localStorage 后重新打开页面。

