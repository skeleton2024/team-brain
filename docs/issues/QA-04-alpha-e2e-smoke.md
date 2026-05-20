# QA-04 Alpha E2E Smoke

## 目标

扩展 smoke test，覆盖 Wave 4 的端到端路径：Inbox -> Memory -> Project / Node -> Action -> Result -> Command Center / Priority Queue。

## 背景

Wave 4 会新增 Command Center、Commitment / Waiting、Risk / Opportunity 和 Priority Queue。QA-04 需要把这些对象放入最低验收线，确保后续开发不会破坏公司级首页。

## 涉及领域

QA / Dashboard / Inbox / Memory / Project / Action / Result

## 涉及文件

- `scripts/smoke-test.mjs`
- `src/domain/pipelines/buildCommandCenter.js`
- `src/ui/render.js`
- `src/data/demo.js`
- `docs/TEAM_DEV_LOG.md`
- `AI_HANDOFF.md`
- `当前系统状态.md`

## 数据模型变化

无新增持久化字段。测试应断言 Wave 4 已落地的字段和派生对象。

## UI / 交互

无新增 UI，负责验证已有 UI 和 pipeline 输出。

## 明确不做

- 不引入浏览器 e2e 框架。
- 不接真实外部服务。
- 不把 smoke test 变成慢速集成测试。

## 验收标准

1. `buildCommandCenter()` 输出 priorityQueue、todayInbox、commitments、risks、opportunities 和 memoryReview。
2. `renderApp()` 输出 Command Center、Priority Queue、Risk Radar 和 Commitment 文案。
3. Alpha 闭环对象数量和关键链接被断言。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- `AI_HANDOFF.md`
- `当前系统状态.md`
- `docs/TEAM_DEV_LOG.md`
- `docs/FILE_FUNCTION_NOTES.md`
