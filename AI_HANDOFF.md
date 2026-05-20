# TeamMind AI Handoff

用途：给新的 Codex / AI 对话框快速接手项目，减少重复解释和上下文丢失。

最后更新：2026-05-20

## 1. 当前产品判断

TeamMind 的长期目标是公司级 AI operating system。它要吸收公司信息，沉淀可治理记忆，理解客户、投资人、项目、节点和行动之间的关系，并通过行动结果回流持续更新公司判断。

当前不优先做登录、计费、套餐、多租户和复杂外部自动执行。Phase 3 Alpha 的目标是做出可真实使用的 Alpha：手动信息进入、Source / Signal 整理、Entity Profile、Project Node、Memory Governance、Action Brief、Result Feedback 和 Command Center。

## 2. 开发前必须先读

新的 AI 开发会话默认按这个顺序阅读：

```text
README.md
-> 最终产品形态.md
-> docs/AI_DEVELOPMENT_GUIDE.md
-> docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md
-> 当前系统状态.md
-> PROJECT_FUNCTION_STRUCTURE.md
-> DATA_MODEL.md
-> docs/issues/README.md
-> 当前 issue spec
```

如果任务很小，可以只读直接相关文件，但必须说明实际参考了哪些文件。

## 3. 默认开发方式

默认采用“一个主对话跑一个 Wave”的方式：

- 一个主对话负责 3-5 个 issue 的上下文、分支、合并和验收。
- 每个 issue 仍然单独开分支、单独提交、单独 smoke test。
- 核心数据合同、全局状态、路由、pipeline 协议必须先串行定下来。
- UI、测试、文档、互不重叠的小模块可以并行。
- 每完成 2-3 个 issue，更新本文件和 `当前系统状态.md`。
- Wave 结束后更新开发计划和团队日志。

## 4. 当前稳定分支

Phase 3 Alpha 的阶段集成分支：

```text
integration/phase-3-alpha
```

Wave 0 本地集成分支：

```text
integration/phase-3-wave-00
```

Wave 1 本地集成分支：

```text
integration/phase-3-wave-01
```

Wave 2 本地集成分支：

```text
integration/phase-3-wave-02
```

Wave 3 本地集成分支：

```text
integration/phase-3-wave-03
```

历史 memory foundation 分支仍可作为上下文参考，但不再作为后续开发主 base：

```text
integration/CTX-01-MEM-01-MEM-03-REC-01-CTX-03-MEM-02-memory-foundation
```

## 5. Phase 3 Alpha Wave 0 状态

Wave 0 已建立后续开发的施工系统：

```text
DEV-00：Wave 0 issue spec 与 issue 顺序
ARCH-00：Phase 3 Alpha 核心数据合同
QA-00：smoke test baseline
DOC-00：当前系统状态
DOC-01：AI handoff
```

关键结果：

- `DATA_MODEL.md` 已定义 Source、Signal、Entity、EntityRelation、ProjectNode、Commitment、Risk、Opportunity 和 EvidenceLink。
- `PROJECT_FUNCTION_STRUCTURE.md` 已对齐 Phase 3 Alpha 的 pipeline、repository 接口和功能领域边界。
- `scripts/smoke-test.mjs` 已增强对 action evidence、brief source、result feedback 和 reconciliation 的断言。
- 新生成 action 已带 `whyNow`、`evidenceMemoryIds`、`expectedArtifact`。
- 新生成 brief 已带 `evidenceMemoryIds`、`sourceContextIds`。
- result 已带 `whatChanged`、`newEvidence`、`followUpNeeded`。
- 每个 issue 分支完成后和合回 wave 后均运行 `node scripts/smoke-test.mjs` 通过。

## 6. Phase 3 Alpha Wave 1 状态

Wave 1 已完成 Inbox 到 Source / Signal 的第一版闭环：

```text
INBOX-01-manual-source-inbox
PIPE-01-source-to-signal
LINK-01-project-entity-suggestion
UI-01-inbox-review-flow
QA-01-inbox-smoke-flow
```

关键结果：

- 用户可以手动录入真实业务信息并生成 `Source`。
- `Source` 可以通过本地规则提取为结构化 `Signal`。
- `Signal` 可以建议关联 Entity / Project，Entity 默认保持 `watching`，不自动确认为事实。
- Inbox review flow 支持确认、忽略、转 Memory、转 Action。
- 转 Action 仍保留 `requiresHumanConfirmation`，不执行任何外部动作。
- `scripts/smoke-test.mjs` 已覆盖 `addManualSource -> processSource -> suggestSignalLinks -> reviewSignal -> renderApp`。

Wave 1 明确不做：

- 不接 Gmail / Slack API。
- 不自动执行外部动作。
- 不自动发送消息或承诺。
- 不把主界面改成聊天产品。

本轮 issue 分支：

```text
issue/INBOX-01-manual-source-inbox
issue/PIPE-01-source-to-signal
issue/LINK-01-project-entity-suggestion
issue/UI-01-inbox-review-flow
issue/QA-01-inbox-smoke-flow
```

每个 issue 完成后、每次合回 `integration/phase-3-wave-01` 后均运行 `node scripts/smoke-test.mjs` 通过。

## 7. Phase 3 Alpha Wave 2 状态

Wave 2 已完成 Entity Profile 与 Project Node 的第一版可用闭环：

```text
ENTITY-01-entity-profile
ENTITY-02-entity-linking
PROJECT-01-project-nodes
PROJECT-02-node-detail-panel
QA-02-entity-project-flow
```

关键结果：

- Entity 建议已升级为可查看的 `Entity Profile` 面板，支持状态治理。
- Entity Profile 展示 Source / Signal / Memory / Project / Action 关联，并兼容 Wave 1 的 `related*` 字段与目标 `sourceIds` 等字段。
- Signal 建议关联、Signal 转 Memory、Signal 转 Action 会持续回写 Entity 的证据链和下一步建议。
- `Project.nodes` 已落地；新项目和旧项目都会有默认单节点。
- Project Nodes 面板支持节点状态切换，Node Detail Panel 展示目标、成功标准、输入上下文、证据链、相关 action 和 result。
- QA smoke 覆盖手动 Source -> Signal -> Entity -> Memory / Action -> Project Node -> Result 的贯通路径。
- 每个 issue 完成后、每次合回 `integration/phase-3-wave-02` 后均运行 `node scripts/smoke-test.mjs` 通过。

Wave 2 明确不做：

- 不接 Gmail / Slack API。
- 不自动执行外部动作。
- 不自动拆分复杂多节点。
- 不做复杂关系图、CRM 同步或聊天界面。

本轮 issue 分支：

```text
issue/ENTITY-01-entity-profile
issue/ENTITY-02-entity-linking
issue/PROJECT-01-project-nodes
issue/PROJECT-02-node-detail-panel
issue/QA-02-entity-project-flow
```

## 8. Phase 3 Alpha Wave 3 状态

Wave 3 已完成 Memory Governance 与 Action Loop 的第一版可用闭环：

```text
MEM-05-memory-governance-live
ACTION-01-brief-generation
ACTION-02-result-feedback
REC-03-result-to-memory-update
QA-03-action-loop-smoke
```

关键结果：

- Memory governance 已进入 action / brief：confirmed 优先，draft / disputed 需要人工复核，outdated / archived 默认不作为新 brief 证据。
- Action Brief 已按 customer follow-up、investor reply、coding brief 等场景输出不同 sections，并消费 Entity、Project Node、Memory 和成功标准。
- Result Feedback 表单已结构化保存 summary、whatChanged、newEvidence 和 followUpNeeded。
- Result 会生成待确认 memory update 建议、follow-up action 和 Project Node 状态建议，但不自动覆盖 memory 或自动修改 node 状态。
- 已完成 action 会保留在 actions 中，便于 result history、memory detail 和 node detail 继续追溯。
- QA smoke 覆盖 Manual Source -> Signal -> Memory / Action -> Memory Governance -> Scenario Brief -> Structured Result -> Memory Update -> Follow-up Action -> Project Node suggestion。
- 每个 issue 完成后、每次合回 `integration/phase-3-wave-03` 后均运行 `node scripts/smoke-test.mjs` 通过。

Wave 3 明确不做：

- 不接 Gmail / Slack API。
- 不自动执行外部动作。
- 不自动发送消息、邮件或承诺。
- 不把主界面改成聊天产品。

本轮 issue 分支：

```text
issue/MEM-05-memory-governance-live
issue/ACTION-01-brief-generation
issue/ACTION-02-result-feedback
issue/REC-03-result-to-memory-update
issue/QA-03-action-loop-smoke
```

## 9. 下一步：Wave 4

下一轮建议从 Command Center Alpha 开始：

```text
DASH-01-command-center
COMMIT-01-commitment-waiting
RISK-01-risk-opportunity-radar
PRIORITY-01-ai-priority-queue
QA-04-alpha-e2e-smoke
```

Wave 4 重点：

- 把 inbox、memory、project、node、action、commitment、risk 和 opportunity 聚合成公司级工作首页。
- 展示今日最需要处理的 inbox、action、waiting、risk 和 memory review。
- 形成 priority queue，但继续保持人工确认和不自动外部执行边界。

## 10. 不要做

- 不要把主界面改成聊天产品。
- 不要优先接 Gmail / Slack / Notion / Linear / GitHub 自动执行。
- 不要自动发送邮件、Slack 或外部承诺。
- 不要直接合 main。
- 不要多个 issue 混在一个分支里，除非这是明确的 wave integration 分支。
- 不要修改核心数据结构但不更新 `DATA_MODEL.md`。
- 不要新增文件但不更新 `docs/FILE_FUNCTION_NOTES.md`。

## 11. 完成后必须记录

完成一个 issue 或一个 Wave 后，至少记录：

```text
完成了什么：
分支：
提交：
测试：
更新的文档：
遗留风险：
下一步：
```

这些记录可以写入 `docs/TEAM_DEV_LOG.md`，也可以同步更新本文件中的当前状态摘要。
