# PRIORITY-01 AI Priority Queue

## 目标

新增本地规则版 AI Priority Queue，按照紧急性、证据、风险、等待和行动状态告诉用户今天最该处理什么。

## 背景

Wave 4 的核心价值是从“对象都有了”升级为“系统能排序”。第一版 Priority Queue 可以使用本地规则，不接真实 AI provider，但输出必须可解释、可追溯、可人工确认。

## 涉及领域

Dashboard / Action / Memory / Project / Risk / Opportunity

## 涉及文件

- `src/domain/pipelines/buildCommandCenter.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

## 数据模型变化

可新增只读派生对象 `PriorityQueueItem`，包含：

- `id`
- `type`
- `title`
- `reason`
- `priority`
- `evidenceLinks`
- `targetId`

该对象由 pipeline 生成，不需要持久化。

## UI / 交互

- Command Center 顶部展示 Priority Queue。
- 每个队列项说明为什么现在处理，以及关联 action / memory / risk / commitment。
- 高风险或待确认项必须保留人工确认提示。

## 明确不做

- 不自动执行队列项。
- 不自动修改外部系统。
- 不做不可解释的黑盒排名。

## 验收标准

1. Priority Queue 至少聚合 action、overdue commitment、risk、memory review。
2. 每个队列项包含 reason 和可追溯引用。
3. 队列排序稳定且可由 smoke test 断言。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`
