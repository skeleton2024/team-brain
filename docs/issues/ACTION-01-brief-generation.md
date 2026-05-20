# ACTION-01 Brief Generation

## 目标

把 Action Brief 从通用说明升级为更场景化、可执行、可审核的 brief，包含目标、上下文、相关 entity / node / memory、风险和成功标准。

## 背景

Wave 2 已经让 Action 能挂到 Entity 和 Project Node。Wave 3 需要让 brief 消费这些上下文，成为执行前的上下文包，而不是只复述 action 标题。

## 涉及领域

Action / Brief / Entity / ProjectNode / Memory / UI

## 涉及文件

- `src/domain/agentEngine.js`
- `src/ui/render.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

优先消费现有 `Brief.sections`、`Brief.evidenceMemoryIds`、`Brief.sourceContextIds` 和 `ActionItem` 字段。若新增与 Entity / Node / Risk 关联相关字段，必须同步 `DATA_MODEL.md`。

## UI / 交互

- 用户点击生成 Brief 后，Brief 面板展示场景化 sections。
- Brief 能显示关联 Entity、Project Node、证据 memory、风险和成功标准。
- Brief 保持草稿性质，用户人工确认后再执行。

## 明确不做

- 不自动发送邮件、Slack 或外部消息。
- 不接真实外部工具。
- 不做复杂富文本编辑器。
- 不把产品改成聊天界面。

## 验收标准

1. customer / investor / coding / operating 类 action 能生成不同结构的 brief sections。
2. Brief 包含 action 目标、背景、证据 memory、相关 Entity / Node、风险、成功标准和人工确认项。
3. 高风险 action 的 brief 保留 do-not-promise 或人工确认清单。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- 更新 `DATA_MODEL.md`、`PROJECT_FUNCTION_STRUCTURE.md` 和 `docs/FILE_FUNCTION_NOTES.md`。
