# CTX-01 增加上下文元数据

## 目标

让每段输入上下文从“纯文本”升级为“可追溯证据”，为后续来源引用、记忆校准和行动判断提供基础。

## 用户价值

用户以后回看公司记忆时，可以知道这段信息来自什么时候、谁参与、重要程度如何，而不是只看到一段孤立文本。

## 涉及领域

Context Intake

## 涉及模块

- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

## 数据结构变化

`ContextItem` 增加：

```text
occurredAt: string
participants: string[]
tags: string[]
importance: "low" | "medium" | "high"
updatedAt: string
```

兼容要求：

- 旧 context 没有这些字段时，migration 或读取逻辑要补默认值。
- 默认 `occurredAt` 可等于 `createdAt`。
- 默认 `participants` 和 `tags` 为空数组。
- 默认 `importance` 为 `medium`。

## UI 行为

上下文输入表单增加：

- 发生日期。
- 参与人，逗号分隔。
- 标签，逗号分隔。
- 重要程度选择。

上下文列表展示：

- 类型。
- 标题。
- 发生日期。
- 重要程度。
- 标签。

## 不做范围

- 不做文件上传。
- 不做日历集成。
- 不做参与人的用户系统。
- 不做高级标签管理。

## 验收标准

1. 用户可以在表单中录入发生日期、参与人、标签和重要程度。
2. 保存后刷新页面字段仍存在。
3. Demo 数据包含至少 3 条带元数据的上下文。
4. 旧 localStorage 数据不会导致白屏。
5. `node scripts/smoke-test.mjs` 通过。

## 测试建议

- 新建上下文并刷新页面。
- 输入多个参与人和标签，检查是否被解析成数组。
- 使用旧 demo reset 后页面正常。

