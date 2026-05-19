# ENTITY-01 Entity Profile

## 目标

把 Wave 1 生成的 Entity 建议升级为可查看、可治理的 Entity Profile。用户应能在主工作区看到 Entity 列表，打开单个对象画像，查看状态、角色、组织、来源、关联记忆和下一步建议。

## 背景

Wave 1 已经能从 Source / Signal 中建议 Entity，但它们目前只在 Signal 建议里作为标签出现。Wave 2 需要让客户、投资人、团队成员、伙伴、产品和市场等长期对象成为一等业务对象，为后续 Entity Linking、Project Node 和 Command Center 提供上下文。

## 涉及领域

Entity / Inbox / Memory / Action / UI

## 涉及文件

- `src/data/demo.js`
- `src/domain/agentEngine.js`
- `src/domain/pipelines/linkSignals.js`
- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`
- `docs/issues/README.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

- 代码开始兼容并优先消费 `Entity.sourceIds`、`signalIds`、`memoryIds`、`projectIds`。
- 为兼容 Wave 1 localStorage，继续保留并同步 `relatedSourceIds`、`relatedSignalIds`、`relatedMemoryIds`、`relatedProjectIds`。
- `Entity.lastInteractionAt` 和 `Entity.nextSuggestedActionId` 用于 Profile 摘要展示。

## UI / 交互

- 在主工作区新增 `Entity Profile` 面板。
- Entity 卡片显示类型、状态、关系阶段和关联数量。
- Entity 详情显示基础画像、最近互动、相关 Source / Signal / Memory / Project、下一步建议。
- 用户可以把 Entity 状态切换为 active / watching / inactive / archived。

## 明确不做

- 不做复杂关系图可视化。
- 不做 CRM、Gmail、Slack 或外部系统同步。
- 不自动把 Entity 画像确认为事实；Signal 建议生成的 Entity 仍默认 `watching`。
- 不做完整 Entity 编辑表单。

## 验收标准

1. Demo 数据中的 Entity 可以在主界面看到并打开详情。
2. Entity Profile 可以展示相关 Source / Signal / Memory / Project 和下一步建议。
3. Entity 状态可以在本地状态中切换，不触发外部动作。
4. 旧的 `related*` 字段和新的目标字段都能被正常渲染。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- 更新 `DATA_MODEL.md` 的 Entity 兼容说明。
- 更新 `docs/issues/README.md` 的 Wave 2 issue 顺序。
- 更新 `docs/FILE_FUNCTION_NOTES.md` 的 issue spec 说明。
