# UI-01 Inbox Review Flow

## 目标

让用户可以在 Inbox 中 review Signal，并执行确认、忽略、转 Memory、转 Action。

## 背景

Wave 1 的核心不是自动归档，而是让 Source / Signal 的判断停在人可确认的位置。系统可以建议，但关键判断必须能被人 review 后再进入 Memory 或 Action。

## 涉及领域

Inbox / Signal / Memory / Action / Evidence / UI

## 涉及文件

- `src/domain/agentEngine.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `DATA_MODEL.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

扩展 `SourceReference` 兼容 `sourceId` 和 `signalId`，用于 Signal 转 Memory 后保留 Source / Signal evidence chain。

## UI / 交互

Signal 卡片提供“确认”“忽略”“转 Memory”“转 Action”。转 Memory 生成 draft memory；转 Action 会先生成一条 draft memory 作为 evidence，再生成待处理 action。

## 明确不做

- 不自动确认 memory。
- 不自动对外发送消息。
- 不接 Gmail / Slack API。
- 不做复杂批量 review。

## 验收标准

1. Signal 可以确认或忽略。
2. Signal 可以转成带 Source / Signal 引用的 draft memory。
3. Signal 可以转成带 evidence memory 的待处理 action。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

同步 `DATA_MODEL.md` 和 `docs/FILE_FUNCTION_NOTES.md`。
