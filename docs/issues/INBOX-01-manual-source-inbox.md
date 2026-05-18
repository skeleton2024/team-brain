# INBOX-01 手动 Source Inbox

## 目标

让用户可以在 Company Inbox 中手动录入真实业务信息，并保存为 Phase 3 Alpha 的 `Source` 对象。

## 背景

Wave 1 的第一步是让信息能进入系统。Source 是统一原始信息入口，后续 `PIPE-01`、`LINK-01` 和 `UI-01` 都依赖可持久化的 Source。

## 涉及领域

Inbox / Source / UI / Data

## 涉及文件

- `src/domain/types.js`
- `src/domain/agentEngine.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `src/data/demo.js`

## 数据模型变化

落地已在 `DATA_MODEL.md` 定义的 `Project.sources` 和 `Source` 字段，不新增合同外字段。

## UI / 交互

用户在 Company Inbox 中填写信息类型、标题、原文、来源、发生时间、参与对象、标签和重要程度。保存后 Source 进入最近 Source 列表，状态默认为 `new`。

## 明确不做

- 不做 Gmail / Slack API 接入。
- 不从 Source 抽取 Signal。
- 不做人工 review、转 memory 或转 action。
- 不自动执行任何外部动作。

## 验收标准

1. 新项目和旧项目都能拥有 `sources` 数组，旧 localStorage 不白屏。
2. 用户可以提交手动 Source，原文不会被 AI 改写覆盖。
3. Demo 能展示至少一个 Source。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

新增 issue spec 后同步 `docs/FILE_FUNCTION_NOTES.md`。
