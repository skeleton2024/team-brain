# ENTITY-02 Entity Linking

## 目标

让 Inbox / Signal / Memory / Project 与 Entity Profile 的关联在状态中持续维护。Signal 建议关联、Signal 转 Memory、Signal 转 Action 后，相关 Entity 应自动获得可追溯的 Source、Signal、Memory、Project 和下一步 Action 链接。

## 背景

`ENTITY-01` 已经提供 Entity Profile 面板和详情展示，但关联数据仍主要来自 demo 或 Wave 1 的最小建议结果。Wave 2 需要让 Entity Profile 成为真实业务对象画像：它应随着 Inbox review flow 自动积累证据，而不是只作为 Signal 卡片里的标签。

## 涉及领域

Entity / Inbox / Signal / Memory / Action / UI

## 涉及文件

- `src/domain/agentEngine.js`
- `src/domain/pipelines/linkSignals.js`
- `src/ui/render.js`
- `scripts/smoke-test.mjs`
- `docs/issues/README.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `PROJECT_FUNCTION_STRUCTURE.md`

## 数据模型变化

无新增对象。继续使用 `Entity.sourceIds`、`signalIds`、`memoryIds`、`projectIds`、`nextSuggestedActionId`，并同步兼容 `related*` 字段。

## UI / 交互

- Entity Profile 详情页展示从 Source / Signal / Memory / Project 汇总而来的关联证据。
- 用户在 Inbox 中点击“建议关联”后，Entity Profile 应能看到相关 Source 和 Signal。
- 用户把 Signal 转 Memory 或 Action 后，Entity Profile 应能看到新增 Memory 和下一步建议。

## 明确不做

- 不做复杂实体合并 UI。
- 不做关系图可视化。
- 不接 CRM、Gmail、Slack 或其他外部系统。
- 不自动确认 Entity 判断为事实；新建议仍保持 `watching`。

## 验收标准

1. Signal 建议关联会更新已有 Entity 或新 Entity 的 Source / Signal / Project 链接。
2. Signal 转 Memory 会把新 Memory 挂回相关 Entity。
3. Signal 转 Action 会把新 Action 作为相关 Entity 的下一步建议。
4. Entity Profile 渲染中能看到关联证据与下一步建议。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- 更新 `docs/issues/README.md` 的 Wave 2 issue 状态。
- 更新 `docs/FILE_FUNCTION_NOTES.md`。
