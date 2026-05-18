# PIPE-01 Source 到 Signal Pipeline

## 目标

实现本地 `Source -> Signal` pipeline，让手动录入的 Source 可以被整理为结构化 Signal。

## 背景

Source 保存原文，Signal 承载从原文中抽取出的业务含义。Wave 1 后续的 Entity / Project 关联、人工 review、转 memory 和转 action 都依赖 Signal。

## 涉及领域

Inbox / Source / Signal / Pipeline / UI

## 涉及文件

- `src/domain/pipelines/extractSignals.js`
- `src/domain/agentEngine.js`
- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `src/data/demo.js`

## 数据模型变化

落地已在 `DATA_MODEL.md` 定义的 `Project.signals` 和 `Signal` 字段，不新增合同外字段。

## UI / 交互

用户可以在最近 Source 列表中点击“提取 Signal”。系统使用本地规则从 Source 原文中生成 Signal，Source 状态更新为 `processed`。

## 明确不做

- 不接真实 AI provider。
- 不做 Gmail / Slack API。
- 不自动转 memory 或 action。
- 不做人工 review 状态流转。

## 验收标准

1. `extractSignals()` 返回 `{ signals, runSummary }`。
2. 每条 Signal 包含 `sourceId`、`type`、`summary`、`quote`、`confidence` 和建议草稿。
3. 已处理 Source 不会重复生成相同 Signal。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

新增 pipeline 文件后同步 `docs/FILE_FUNCTION_NOTES.md`。
