# QA-01 Inbox Smoke Flow

## 目标

增强 smoke test，覆盖 Wave 1 的 Inbox -> Source -> Signal -> Link -> Review 主流程。

## 背景

Wave 1 引入 Source、Signal、Entity 建议和 review flow。现有 smoke 已覆盖 memory/action/result 基础闭环，需要补充 Inbox 第一版的端到端断言。

## 涉及领域

QA / Inbox / Source / Signal / Entity / Memory / Action / UI

## 涉及文件

- `scripts/smoke-test.mjs`
- `docs/issues/QA-01-inbox-smoke-flow.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

无。

## UI / 交互

Smoke 通过 `renderApp()` 检查 Inbox 表单、Source 处理按钮、Signal 关联按钮和 review 按钮都可渲染。

## 明确不做

- 不新增产品功能。
- 不接浏览器 e2e 框架。
- 不接外部 API。

## 验收标准

1. Smoke 能创建手动 Source。
2. Smoke 能处理 Source 并抽取 Signal。
3. Smoke 能为 Signal 建议 Entity / Project。
4. Smoke 能把 Signal 转为 Memory 和 Action。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

同步 `docs/FILE_FUNCTION_NOTES.md`。
