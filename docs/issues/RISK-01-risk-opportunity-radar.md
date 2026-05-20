# RISK-01 Risk / Opportunity Radar

## 目标

新增风险和机会雷达的第一版本地实现，让系统能展示需要关注的业务风险、机会和其证据来源。

## 背景

Command Center 不应只列任务，还应提示“什么正在变危险”和“什么值得追”。Risk / Opportunity 已在数据合同中定义，Wave 4 需要把它们用于公司级首页。

## 涉及领域

Dashboard / Memory / Entity / Project / Action

## 涉及文件

- `DATA_MODEL.md`
- `src/domain/types.js`
- `src/domain/pipelines/buildCommandCenter.js`
- `src/ui/render.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

## 数据模型变化

落地 `Project.risks` 和 `Project.opportunities` 的 demo / migration / 展示消费。若新增展示辅助字段，必须同步本文档和 `DATA_MODEL.md`。

## UI / 交互

- Command Center 展示高优先风险和机会。
- 项目工作区展示风险 / 机会摘要。
- 每条 risk / opportunity 显示 severity / impact、状态、证据来源和建议 action。

## 明确不做

- 不自动创建外部任务。
- 不自动承诺销售或融资结论。
- 不做复杂图谱或评分模型。

## 验收标准

1. Demo 数据包含至少两条 risk 和两条 opportunity。
2. Risk / Opportunity 能在 Command Center 中排序展示。
3. 每条展示项有 evidenceLinks 或相关对象 ID。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- `DATA_MODEL.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`
