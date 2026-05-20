# QA-03 Action Loop Smoke

## 目标

补充 smoke test，覆盖 Memory Governance -> Action Brief -> Result Feedback -> Memory Update / Follow-up Action / Project Node 的完整闭环。

## 背景

Wave 3 的前四个 issue 会改变 action loop 的核心行为。QA-03 需要确认这些能力串起来后仍然稳定：可信 memory 驱动 action，brief 能解释执行上下文，result 能被写回并生成可追溯的后续判断。

## 涉及领域

QA / Memory / Action / Brief / Result / Reconciliation / ProjectNode / UI

## 涉及文件

- `scripts/smoke-test.mjs`
- `src/domain/agentEngine.js`
- `src/ui/render.js`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

无新增字段。加强对 Wave 3 已有字段和行为的断言。

## UI / 交互

无新增页面。验证现有 UI 能渲染 memory governance summary、scenario brief、result feedback 和 memory update 建议。

## 明确不做

- 不引入浏览器 e2e 框架。
- 不接外部 API。
- 不自动执行外部动作。
- 不把主界面改成聊天产品。

## 验收标准

1. Smoke 覆盖 confirmed / draft / outdated / disputed / archived memory 对 action / brief 的影响。
2. Smoke 覆盖场景化 brief sections。
3. Smoke 覆盖结构化 result feedback。
4. Smoke 覆盖 result 生成 memory update 和 follow-up action。
5. Smoke 覆盖 Project Node result / next step 展示。
6. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- 更新 `docs/FILE_FUNCTION_NOTES.md`。
