# MEM-02 支持编辑公司记忆

## 目标

让用户可以修正 AI 提取错误，提高公司记忆可信度。

## 用户价值

AI 第一次提取不可能总是准确。用户必须能把“差不多对”改成“团队真正认可的表达”。

## 涉及领域

Company Memory

## 涉及模块

- `src/ui/render.js`
- `src/main.js`
- `src/services/store.js`
- `src/domain/types.js`
- `scripts/smoke-test.mjs`

## 数据结构变化

沿用 `MemoryItem`，编辑时更新：

```text
title
type
content
status
updatedAt
lastVerifiedAt
```

如果用户把状态改为 `confirmed`，建议同步写入：

```text
lastVerifiedAt = now
```

## UI 行为

Memory 卡片或详情中提供编辑入口。

编辑字段：

- 标题。
- 类型。
- 内容。
- 状态。

保存后：

- 退出编辑态。
- UI 立即更新。
- state 持久化。

取消后：

- 不写入更改。

## Domain 行为

- 编辑 memory 不应删除 sourceReferences。
- 编辑 memory 不应破坏已有 action 的 `evidenceMemoryIds`。
- 如果修改了 type，关联 action 可以暂时不自动重算，后续 ACT issue 再处理。

## 不做范围

- 不做多人协作冲突。
- 不做版本历史。
- 不做富文本编辑器。
- 不做批量编辑。

## 验收标准

1. 用户可以进入 memory 编辑态。
2. 用户可以保存标题、类型、内容和状态。
3. 刷新页面后修改仍存在。
4. sourceReferences 不丢失。
5. 已有关联 action 不报错。
6. `node scripts/smoke-test.mjs` 通过。

## 测试建议

- 把一条 draft memory 改为 confirmed。
- 修改 memory 内容后刷新。
- 检查引用该 memory 的 action 仍能渲染。

