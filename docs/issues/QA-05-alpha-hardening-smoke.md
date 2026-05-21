# QA-05 Alpha Hardening Smoke

## 目标

扩展 smoke test，覆盖 Wave 5 的人工状态推进、Command Center 定位、localStorage 兼容和 UI 关键文案。

## 背景

Wave 4 的 smoke 已覆盖 Command Center、Priority Queue、Commitment、Risk 和 Opportunity。Wave 5 会增加可用性和兼容性能力，因此需要把这些 hardening 行为纳入长期基线，避免后续迭代回退。

## 涉及领域

QA / Dashboard / Memory / Storage / Docs

## 涉及文件

- `scripts/smoke-test.mjs`
- `src/ui/render.js`
- `src/services/store.js`
- `AI_HANDOFF.md`
- `当前系统状态.md`
- `docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md`
- `docs/issues/README.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`

## 数据模型变化

无。

## UI / 交互

不新增产品入口，只为 Wave 5 已实现入口补断言。

## 明确不做

- 不引入浏览器 e2e 框架。
- 不接真实外部服务。
- 不扩大到 Phase 4 的登录、权限或计费。

## 验收标准

1. Smoke 覆盖 Command Center deep link / locator 结构。
2. Smoke 覆盖人工 review 状态推进。
3. Smoke 覆盖关键手动编辑入口。
4. Smoke 覆盖 legacy / partial project 兼容渲染。
5. Smoke summary 增加 Wave 5 关键计数或状态。
6. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- `AI_HANDOFF.md`
- `当前系统状态.md`
- `docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md`
- `docs/issues/README.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`

