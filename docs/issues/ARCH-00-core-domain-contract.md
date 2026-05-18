# ARCH-00 Phase 3 Alpha 核心数据合同

## 目标

定义 Phase 3 Alpha 的核心领域对象合同，让 Wave 1 到 Wave 4 可以在稳定数据边界上推进 Inbox、Source / Signal、Entity Profile、Project Node、Action Brief、Result Feedback 和 Command Center。

## 背景

当前 `DATA_MODEL.md` 仍以 v0.2 memory foundation 为基准，已经覆盖 Project、ContextItem、MemoryItem、ActionItem、Brief、ActionResult 和 AgentRun。Phase 3 Alpha 需要把 Source、Signal、Entity、ProjectNode、Commitment、Risk、Opportunity 等对象纳入合同，否则后续 Inbox、Entity、Project Node 和 Dashboard 容易各自发明字段。

## 涉及领域

Architecture / Data Model / Inbox / Memory / Entity / Project / Action / Result / Dashboard

## 涉及文件

- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md`（仅在执行顺序或范围需要澄清时）
- `docs/FILE_FUNCTION_NOTES.md`（如新增文件）

## 数据模型变化

预期新增或扩展：

- `Source`
- `Signal`
- `Entity`
- `EntityRelation`
- `ProjectNode`
- `Commitment`
- `Risk`
- `Opportunity`
- `EvidenceLink`
- `Project.sources`
- `Project.signals`
- `Project.entities`
- `Project.nodes`

也需要明确这些对象与现有 `ContextItem`、`MemoryItem`、`ActionItem`、`Brief`、`ActionResult`、`AgentRun` 的关系。

## UI / 交互

无直接 UI 交付，但合同必须足够支持后续：

- Inbox review flow。
- Entity profile。
- Project node detail。
- Result-driven memory update。
- Command Center priority queue。

## 明确不做

- 不一次性实现所有对象的完整 UI。
- 不引入后端、数据库、鉴权或真实 AI provider。
- 不接 Gmail / Slack / Notion / GitHub API。
- 不自动执行外部动作。
- 不把主界面改成聊天产品。

## 验收标准

1. `DATA_MODEL.md` 明确定义 Phase 3 Alpha 关键对象、字段和关系。
2. 数据合同说明哪些对象是 Alpha 必须落地，哪些是后续预留。
3. 现有 memory foundation 对象与新对象之间没有冲突字段或同义字段漂移。
4. `PROJECT_FUNCTION_STRUCTURE.md` 的模块边界与新合同一致。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

必须同步：

- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`

如新增文件，还必须同步：

- `docs/FILE_FUNCTION_NOTES.md`

