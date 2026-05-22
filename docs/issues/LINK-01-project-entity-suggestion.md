# LINK-01 Project / Entity 建议关联

## 目标

为 Signal 生成本地 Entity / Project 关联建议，让用户在后续 review flow 中能确认或纠正系统判断。

## 背景

Wave 1 不只要抽取 Signal，还要让 Signal 开始落到业务对象和当前项目上。这个 issue 先做最小建议层，不把建议直接当成确认事实。

## 涉及领域

Signal / Entity / Project / Inbox / Pipeline / UI

## 涉及文件

- `src/domain/pipelines/linkSignals.js`
- `src/domain/agentEngine.js`
- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

## 数据模型变化

落地已在 `DATA_MODEL.md` 定义的 `Project.entities`、`Source.relatedEntityIds`、`Signal.suggestedEntityIds` 和 `Signal.suggestedProjectIds`，不新增合同外字段。

## UI / 交互

Signal 卡片显示建议的 Entity 和 Project。用户可以点击“建议关联”，系统根据 Source 参与对象生成 watching 状态的 Entity 建议。

## 明确不做

- 不做复杂实体合并。
- 不做关系图可视化。
- 不把建议自动确认为事实。
- 不接外部 CRM、Gmail 或 Slack。

## 验收标准

1. `suggestSignalLinks()` 可以为 Signal 补齐 Entity / Project 建议。
2. 新生成的 Entity 状态为 `watching`，可追溯到 Source 和 Signal。
3. Source 的 `relatedEntityIds` 和 `relatedProjectIds` 同步更新。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

新增 pipeline 文件后同步 `docs/FILE_FUNCTION_NOTES.md`。
