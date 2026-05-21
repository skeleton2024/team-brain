# NAV-01 Command Center Deep Links

## 目标

让 Command Center 和 AI Priority Queue 的条目能清楚定位到对应对象，让用户知道这条推荐为什么出现、证据来自哪里、下一步应该去哪个工作区处理。

## 背景

Wave 4 已经把 Inbox、Action、Memory Review、Commitment、Risk 和 Opportunity 聚合到 Command Center，但队列项还偏“展示推荐”，缺少到 Action、Memory、Commitment、Risk、Opportunity、Project Node 或 Source evidence 的明确操作链路。Wave 5 需要把 Alpha 从可展示闭环推进到可日常使用的工作台。

## 涉及领域

Dashboard / Action / Memory / Project / QA

## 涉及文件

- `src/domain/pipelines/buildCommandCenter.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`

## 数据模型变化

不新增持久化对象。允许扩展只读派生 `PriorityQueueItem`，补充定位用字段，例如 `targetAnchor`、`targetLabel` 或 `nextStepLabel`。如果实现新增字段，必须同步 `DATA_MODEL.md`。

## UI / 交互

- Priority Queue 条目展示目标类型、定位按钮、证据摘要和下一步提示。
- 点击定位按钮后使用现有 selected id / anchor / section state 打开对应 Action、Memory、Node 或工作区段落。
- 不需要复杂路由，不引入前端框架。

## 明确不做

- 不接外部 API。
- 不自动执行队列项。
- 不做营销 landing page。
- 不把主界面改成聊天入口。

## 验收标准

1. Command Center priority queue 每个关键类型都能输出可解释定位信息。
2. `renderApp()` 输出包含可测试的定位结构和 `data-*` 属性。
3. Evidence link 仍能追溯到 Source、Signal、Memory 或 Context。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`

