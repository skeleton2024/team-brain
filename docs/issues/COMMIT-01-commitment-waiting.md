# COMMIT-01 Commitment / Waiting / Dependency

## 目标

落地承诺、等待项、依赖项和 follow-up 的第一版模型与展示，让 Command Center 能识别逾期承诺、外部等待和阻塞条件。

## 背景

最终产品形态要求系统区分主动 Action、等待 Waiting、依赖 Dependency 和 Follow-up。Wave 4 先用本地数据和规则展示这些对象，不做外部催办或自动承诺。

## 涉及领域

Dashboard / Project / Action / Result

## 涉及文件

- `DATA_MODEL.md`
- `src/domain/types.js`
- `src/domain/pipelines/buildCommandCenter.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

## 数据模型变化

补齐或落地 `Project.commitments` 与 `Commitment` 字段：

- `type`: `commitment` / `waiting` / `dependency` / `follow_up`
- `status`: `open` / `waiting` / `blocked` / `done` / `overdue` / `archived`
- `evidenceLinks`

## UI / 交互

- Command Center 显示逾期承诺、等待项和依赖项。
- 项目工作区展示当前项目的承诺 / waiting 列表。
- 逾期状态由本地规则判断，但不自动发送催办。

## 明确不做

- 不自动发邮件、Slack 或提醒。
- 不代表用户承诺任何业务条件。
- 不做完整 commitment 编辑器。

## 验收标准

1. Demo 数据包含 commitment、waiting、dependency 和 follow-up 示例。
2. 逾期项能在 Command Center 中突出显示。
3. Project Node 的 waiting / risk 关联不被破坏。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- `DATA_MODEL.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`
