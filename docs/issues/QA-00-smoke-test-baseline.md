# QA-00 Phase 3 Alpha smoke test baseline

## 目标

增强 `node scripts/smoke-test.mjs`，让它成为 Phase 3 Alpha 后续 Wave 的最低安全网：核心闭环能跑、关键对象可追溯、不会退化成只检查数量的测试。

## 背景

当前 smoke test 已覆盖 context intake、memory extraction、action、brief、result feedback 和 reconciliation 基础能力。进入 Phase 3 Alpha 后，数据合同会扩展到 Source、Signal、Entity、ProjectNode、Action Brief 和 Result-driven updates。Wave 0 需要先把 baseline 断言补强，避免后续 Wave 改动破坏已有闭环而不被发现。

## 涉及领域

QA / Memory / Action / Result / Agent Runs

## 涉及文件

- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`（如测试反映新增合同）
- `docs/FILE_FUNCTION_NOTES.md`（如测试职责说明需要更新）

## 数据模型变化

本 issue 原则上不新增业务字段。若为了覆盖 `ARCH-00` 合同需要检查新字段，只同步测试断言和文档说明，不在测试里发明新模型。

## UI / 交互

无直接 UI 变化。

## 明确不做

- 不引入浏览器 e2e 测试框架。
- 不依赖真实 localStorage、网络或外部 API。
- 不接真实 AI provider。
- 不把 smoke test 扩成慢速完整测试套件。

## 验收标准

1. smoke test 覆盖 context -> memory -> action -> brief -> result 的核心闭环。
2. smoke test 校验 AI/规则生成的 memory 具备 source references。
3. smoke test 校验 reconciliation / pending update / result-related memory update 的基础结构。
4. smoke test 校验 action 和 brief 保留 evidence / source 追溯。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

按实际改动同步：

- `docs/FILE_FUNCTION_NOTES.md`
- `DATA_MODEL.md`（仅当测试暴露合同变化时）

