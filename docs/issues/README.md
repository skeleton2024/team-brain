# TeamMind Issues Development Guide

用途：把产品计划拆成可执行、可验证、可并行管理的 issue，并约束 issue 分支、验收和合并方式。

最后更新：2026-05-18

## 1. Issue 的作用

每个 issue spec 必须让新的 Codex 对话或人类开发者独立理解：

- 为什么做。
- 属于哪个产品领域。
- 改哪些模块。
- 数据结构是否变化。
- UI 应该如何出现。
- 明确不做什么。
- 如何验收。

不要用“优化一下”“增强 AI”“完善体验”这类模糊任务直接开工。

## 2. 当前阶段

Milestone 1 memory foundation 已经进入集成基线。后续主要以 Phase 3 Alpha 为目标：

```text
Inbox
-> Source / Signal
-> Entity Profile
-> Project Node
-> Memory Governance
-> Action Brief
-> Result Feedback
-> Command Center
```

详细 Wave 计划见：

```text
docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md
```

## 3. Issue 命名

建议格式：

```text
AREA-序号-short-name
```

示例：

```text
INBOX-01-manual-source-inbox
PIPE-01-source-to-signal
ENTITY-01-entity-profile
PROJECT-01-project-nodes
ACTION-01-brief-generation
DASH-01-command-center
```

## 4. Issue Spec 模板

```text
# ISSUE-ID 标题

## 目标

这次改动要让 TeamMind 具备什么能力。

## 背景

为什么现在做，和最终产品形态、当前 Wave 的关系是什么。

## 涉及领域

Inbox / Memory / Entity / Project / Action / Result / Dashboard / QA / Docs

## 涉及文件

预计会改哪些文件。

## 数据模型变化

新增或修改哪些字段。若没有，写“无”。

## UI / 交互

用户如何看到或使用这个能力。

## 明确不做

本 issue 不包含哪些内容。

## 验收标准

1. ...
2. ...
3. `node scripts/smoke-test.mjs` 通过。

## 文档同步

需要更新哪些文档。
```

## 5. 并行规则

每个 Wave 最多安排 3-5 个 issue。

可以并行：

- 独立页面。
- 独立组件。
- 测试。
- 文档。
- demo 数据。
- 已稳定接口下的展示能力。

必须串行：

- 核心数据合同。
- `AppState`。
- store / repository。
- pipeline 输入输出协议。
- 全局路由。
- memory reconcile 核心逻辑。
- action / result 状态流转。

如果不确定是否可以并行，默认先串行定合同，再并行做实现。

## 6. 分支规则

每个 issue 单独分支：

```text
issue/ISSUE-ID-short-name
```

每个 Wave 有自己的集成分支：

```text
integration/phase-3-wave-01
```

每个阶段有稳定集成分支：

```text
integration/phase-3-alpha
```

规则：

- issue 分支从本轮稳定 base 开出。
- issue 完成后合回 wave integration。
- 每合并一个 issue，跑 `node scripts/smoke-test.mjs`。
- Wave 完成后合回阶段 integration。
- 阶段 integration 通过后开 draft PR。
- 不直接合 main。

## 7. 完成标准

每个 issue 合并前必须满足：

- 符合 issue spec。
- 没有超出明确范围的大重构。
- 新数据字段已更新 `DATA_MODEL.md`。
- 新文件已更新 `docs/FILE_FUNCTION_NOTES.md`。
- 行为变化已更新 PRD、阶段计划或 issue spec。
- Demo 数据能展示新增能力，或说明为什么不需要。
- `node scripts/smoke-test.mjs` 通过。
- 没有新增自动外部执行。
- 没有把主界面改成聊天产品。

## 8. 当前旧 issue

Milestone 1 的旧 issue 仍保留在本目录，作为已完成或历史上下文：

```text
CTX-01-context-metadata.md
CTX-03-context-memory-source-links.md
MEM-01-memory-status-source-references.md
MEM-02-edit-company-memory.md
MEM-03-memory-status-transitions.md
MEM-04-memory-detail-panel.md
REC-01-extract-memories-pipeline.md
REC-02-reconcile-memories-pipeline.md
```

## 9. Phase 3 Alpha Wave 0 issue

Wave 0 的目标是建立 Phase 3 Alpha 的施工系统和核心合同。当前建议按以下顺序串行执行：

```text
DEV-00-ai-development-rules.md
ARCH-00-core-domain-contract.md
QA-00-smoke-test-baseline.md
DOC-00-current-system-status.md
DOC-01-ai-handoff.md
```

执行原则：

- 每个 issue 单独分支。
- `ARCH-00` 必须在 Wave 1 深实现前完成。
- `QA-00` 应在核心数据合同稳定后增强 smoke baseline。
- `DOC-00` 和 `DOC-01` 在 Wave 结束时记录最终状态。
- 每个 issue 完成后运行 `node scripts/smoke-test.mjs`。

## 10. Phase 3 Alpha Wave 1 issue

Wave 1 的目标是落地 Inbox -> Source / Signal 的第一版可用闭环。当前已按以下顺序完成：

```text
INBOX-01-manual-source-inbox.md
PIPE-01-source-to-signal.md
LINK-01-project-entity-suggestion.md
UI-01-inbox-review-flow.md
QA-01-inbox-smoke-flow.md
```

执行原则：

- `INBOX-01` 先落地手动 Source Inbox 和 `Project.sources`。
- `PIPE-01` 在 Source 合同稳定后落地 `extractSignals()`。
- `LINK-01` 在 Signal 合同稳定后落地 `linkSignals()` 和 Entity / Project 建议。
- `UI-01` 消费前面三个 issue 的能力，补 review flow。
- `QA-01` 最后增强 smoke，覆盖录入、提取、建议、review 和渲染断言。
- 每个 issue 单独分支、单独提交；每个 issue 完成后和合回 wave 后都运行 `node scripts/smoke-test.mjs`。
- 不接 Gmail / Slack API，不自动执行外部动作，不把主界面改成聊天产品。

## 11. Phase 3 Alpha Wave 2 issue

Wave 2 的目标是落地 Entity Profile 与 Project Node，让长期业务对象和项目推进节点成为可查看、可治理的一等对象。当前建议按以下顺序串行执行：

```text
ENTITY-01-entity-profile.md
ENTITY-02-entity-linking.md
PROJECT-01-project-nodes.md
PROJECT-02-node-detail-panel.md
QA-02-entity-project-flow.md
```

执行原则：

- `ENTITY-01` 先把 Entity 建议升级为可查看的 Profile，并兼容 Wave 1 的 `related*` 字段。
- `ENTITY-02` 再展示 Inbox / Signal / Memory / Project 与 Entity 的关联。
- `PROJECT-01` 定义 Project Node 的最小结构、状态和列表展示。
- `PROJECT-02` 在 Node 合同稳定后补 Node Detail Panel。
- `QA-02` 最后覆盖 Entity 与 Project Node 的核心路径。
- 每个 issue 单独分支、单独提交；每个 issue 完成后和合回 wave 后都运行 `node scripts/smoke-test.mjs`。
- 不接 Gmail / Slack API，不自动执行外部动作，不把主界面改成聊天产品。

## 12. Phase 3 Alpha Wave 3 issue

Wave 3 的目标是落地 Memory Governance 与 Action Loop，让 memory 状态、Action Brief、Result Feedback 和 result-to-memory update 真正进入业务闭环。当前已按以下顺序串行完成：

```text
MEM-05-memory-governance-live.md
ACTION-01-brief-generation.md
ACTION-02-result-feedback.md
REC-03-result-to-memory-update.md
QA-03-action-loop-smoke.md
```

执行结果：

- `MEM-05` 让 memory 状态影响展示、行动建议和优先级。
- `ACTION-01` 把 Action Brief 场景化，消费 Entity / Node / Memory / Risk / Success Criteria。
- `ACTION-02` 完整化 Result Feedback 输入和记录。
- `REC-03` 根据 result 生成 memory update、follow-up action 和 project / node 状态建议。
- `QA-03` 覆盖 Action Brief -> Result Feedback -> Memory Update 的完整闭环。
- 本 Wave 全程串行；每个 issue 单独分支、单独提交；每个 issue 完成后和合回 wave 后都已运行 `node scripts/smoke-test.mjs` 通过。
- 不接 Gmail / Slack API，不自动执行外部动作，不把主界面改成聊天产品。

## 13. Phase 3 Alpha Wave 4 issue

Wave 4 的目标是落地公司级 Command Center Alpha，让用户打开产品后能知道今天最应该处理什么。当前建议按以下顺序串行执行：

```text
DASH-01-command-center.md
COMMIT-01-commitment-waiting.md
RISK-01-risk-opportunity-radar.md
PRIORITY-01-ai-priority-queue.md
QA-04-alpha-e2e-smoke.md
```

执行原则：

- `DASH-01` 先建立 Command Center 视图和聚合 pipeline。
- `COMMIT-01` 落地承诺、等待项和依赖项，作为首页关键输入。
- `RISK-01` 再补风险 / 机会雷达。
- `PRIORITY-01` 基于上述输入生成可解释优先级队列。
- `QA-04` 最后扩展 smoke，覆盖 Alpha 端到端闭环。
- 每个 issue 单独分支、单独提交；每个 issue 完成后和合回 wave 后都运行 `node scripts/smoke-test.mjs`。
- 不接 Gmail / Slack API，不自动执行外部动作，不把主界面改成聊天产品。

## 14. Phase 3 Alpha Wave 5 issue

Wave 5 的目标是 Alpha Hardening / Human Review Loop / Usability Polish，让现有 Alpha 从“能展示闭环”变成“更像用户可以每天使用的工作台”。当前已按以下顺序串行完成：

```text
NAV-01-command-center-deep-links.md
REVIEW-01-human-review-actions.md
EDIT-01-alpha-manual-editing.md
RESILIENCE-01-local-storage-hardening.md
QA-05-alpha-hardening-smoke.md
```

执行原则：

- `NAV-01` 先补 Command Center / Priority Queue 到具体对象的定位和证据链路。
- `REVIEW-01` 再补 Memory、Commitment、Risk、Opportunity 的最小人工 review 动作。
- `EDIT-01` 在 review 动作稳定后补 Action / Commitment / Risk / Opportunity 的轻量手动修改。
- `RESILIENCE-01` 加强旧 localStorage、缺字段、空状态和异常状态兼容。
- `QA-05` 最后扩展 smoke，覆盖 Wave 5 hardening 行为和文档收口。
- 每个 issue 单独分支、单独提交；每个 issue 完成后和合回 wave 后都运行 `node scripts/smoke-test.mjs` 通过。
- 不接 Gmail / Slack / Notion / Linear / GitHub 等真实外部 API，不自动发送消息，不把主界面改成聊天产品。

执行结果：

- `NAV-01` 让 Priority Queue 条目带 `targetAnchor`、`targetLabel` 和 `nextStepLabel`。
- `REVIEW-01` 让 Memory、Commitment、Risk、Opportunity 能本地状态推进并保留证据链。
- `EDIT-01` 让 Action、Commitment、Risk、Opportunity 有轻量手动编辑入口。
- `RESILIENCE-01` 增强旧 localStorage、空项目和 partial project 兼容。
- `QA-05` 在 smoke summary 中加入 `commandTargets`、`reviewActions`、`manualEditForms` 和 `hardeningCases`。

## 15. 推荐开工提示词

```text
请按照 docs/AI_DEVELOPMENT_GUIDE.md 和 docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md 工作。
本次实现 docs/issues/ISSUE-ID-short-name.md。
要求每个 issue 单独开分支，完成后运行 node scripts/smoke-test.mjs。
如果涉及数据模型，更新 DATA_MODEL.md。
如果新增文件，更新 docs/FILE_FUNCTION_NOTES.md。
不要直接合 main，最后进入当前 wave integration 分支。
```
