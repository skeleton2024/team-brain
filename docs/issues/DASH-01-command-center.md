# DASH-01 Command Center 首页

## 目标

新增公司级 Command Center 首页，让用户打开产品后能先看到当前最该处理的项目、Inbox、Memory review、Action 和风险概览。

## 背景

Wave 1 到 Wave 3 已经跑通 Source / Signal、Entity / Project Node、Memory Governance、Action Brief 和 Result Feedback。Wave 4 需要把这些对象聚合成工作首页，帮助用户判断“今天先看什么、做什么、担心什么”。

## 涉及领域

Dashboard / Inbox / Memory / Project / Action / Risk

## 涉及文件

- `src/domain/pipelines/buildCommandCenter.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

可新增只读派生对象 `CommandCenterSnapshot`，用于聚合展示，不直接持久化为用户业务数据。

## UI / 交互

- 增加 `Command Center` 视图入口。
- 首页展示项目健康、今日 Inbox、待处理 action、需要 review 的 memory、关键风险和机会摘要。
- 所有卡片都应能追溯到 Source / Memory / Project / Action 等现有对象。

## 明确不做

- 不做营销 landing page。
- 不做聊天式主界面。
- 不接 Gmail / Slack API。
- 不自动执行任何外部动作。

## 验收标准

1. 用户可进入 Command Center 视图。
2. Command Center 能从当前 project 聚合 inbox、memory、node、action、risk / opportunity 数据。
3. 展示项至少包含可追溯 ID 或证据摘要。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`
