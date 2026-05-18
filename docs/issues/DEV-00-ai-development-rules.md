# DEV-00 AI 开发规则与 Wave 0 issue 固化

## 目标

把 Phase 3 Alpha Wave 0 的施工规则从阶段计划落成可执行 issue spec，确保后续每个 Codex 对话都能按同一套分支、验收和文档同步规则工作。

## 背景

Phase 3 Alpha 采用“一个主对话跑一个 Wave、每个 issue 单独分支”的协作方式。当前 `docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md` 已经给出 Wave 0 的任务清单，但 `docs/issues/` 还没有对应 issue spec。没有 spec 时，后续开发容易把规则、数据合同、文档和测试混在同一个分支里。

## 涉及领域

Docs / QA / Development Workflow

## 涉及文件

- `docs/issues/DEV-00-ai-development-rules.md`
- `docs/issues/ARCH-00-core-domain-contract.md`
- `docs/issues/QA-00-smoke-test-baseline.md`
- `docs/issues/DOC-00-current-system-status.md`
- `docs/issues/DOC-01-ai-handoff.md`
- `docs/issues/README.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

无。

## UI / 交互

无直接 UI 变化。本 issue 只影响开发协作说明和 issue 验收入口。

## 明确不做

- 不修改应用运行时代码。
- 不定义 Phase 3 Alpha 核心数据字段，数据合同由 `ARCH-00` 完成。
- 不增强 smoke test，测试基线由 `QA-00` 完成。
- 不创建真实外部集成或自动执行外部动作。

## 验收标准

1. Wave 0 的 5 个 issue spec 都存在于 `docs/issues/`。
2. `docs/issues/README.md` 能说明 Phase 3 Alpha 当前 issue 顺序。
3. `docs/FILE_FUNCTION_NOTES.md` 已记录新增 issue spec 文件职责。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

必须同步：

- `docs/issues/README.md`
- `docs/FILE_FUNCTION_NOTES.md`

