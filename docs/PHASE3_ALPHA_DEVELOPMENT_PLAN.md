# Phase 3 Alpha Development Plan

用途：定义 TeamMind 下一阶段如何用 Codex / AI 快速开发，同时尽量不丢上下文、不产生分支混乱。

最后更新：2026-05-18

## 1. 阶段目标

Phase 3 Alpha 的目标是做出一个已经可用的产品闭环：

```text
信息进入 Inbox
-> 整理为 Source / Signal
-> 形成或更新 Entity / Project / Memory
-> 生成 Action Brief
-> 写入 Result Feedback
-> 产生 Memory Update / Follow-up Action / Project State Update
-> Command Center 告诉用户下一步最重要的事
```

这一阶段不以登录、计费、套餐、多租户作为核心目标。这些能力进入长期 roadmap，但不是 Alpha 的阻塞项。

## 2. 默认开发模式

默认采用：

```text
一个主对话 = 一个 Wave
一个 Wave = 3-5 个 issue
一个 issue = 单独分支 + 单独提交 + 单独 smoke test
```

主对话负责：

- 阅读上下文。
- 制定本轮计划。
- 判断哪些 issue 可以并行。
- 创建 issue 分支。
- 合并回 wave integration 分支。
- 每合并一个 issue 跑 smoke test。
- 更新 `AI_HANDOFF.md`、`当前系统状态.md` 和 `docs/TEAM_DEV_LOG.md`。

## 3. 并行规则

可以并行：

- 不同页面或组件。
- 测试和文档。
- demo 数据补充。
- 互不重叠的 UI 区域。
- 已有数据合同下的展示层能力。
- 已有 pipeline 协议下的轻量规则实现。

必须串行：

- 核心数据对象定义。
- `AppState` 结构。
- 全局 store / repository。
- 主要路由和页面信息架构。
- pipeline 输入输出协议。
- memory reconcile 核心逻辑。
- action / result 状态流转协议。

判断标准：

```text
如果两个任务会同时改同一份数据合同、同一个核心状态流或同一段 pipeline 协议，就不要并行。
如果两个任务只是消费已经稳定的接口，并且主要改不同文件，可以并行。
```

## 4. 分支规则

长期分支：

```text
main
integration/phase-3-alpha
```

每轮开发分支：

```text
integration/phase-3-wave-00
integration/phase-3-wave-01
integration/phase-3-wave-02
```

每个 issue 分支：

```text
issue/INBOX-01-manual-source-inbox
issue/PIPE-01-source-to-signal
issue/ENTITY-01-entity-profile
```

规则：

- 不直接在 `main` 上开发。
- 不直接合 `main`。
- 每个 issue 从本轮稳定 base 开出。
- 每个 issue 完成后先合回本轮 wave integration。
- 每合并一个 issue，运行 `node scripts/smoke-test.mjs`。
- Wave 全部通过后，再合入 `integration/phase-3-alpha`。
- `integration/phase-3-alpha` 稳定后开 draft PR，不直接合 main。

## 5. 上下文保存规则

为了减少 Codex 上下文长度带来的信息丢失：

- 每个 Wave 开始前读 `AI_HANDOFF.md` 和 `当前系统状态.md`。
- 每完成 2-3 个 issue，更新一次这两个文件。
- 每个 issue 的验收结果写入 `docs/TEAM_DEV_LOG.md`。
- 每个新数据对象先进入 `DATA_MODEL.md`。
- 每个新增文件都要进入 `docs/FILE_FUNCTION_NOTES.md`。
- 每轮结束后，把“下一轮应该从哪里开始”写进 `AI_HANDOFF.md`。

## 6. Wave 0：施工系统与数据合同

目标：让后续开发能快速并行，但不丢上下文。

建议 issue：

```text
DEV-00-ai-development-rules
ARCH-00-core-domain-contract
DOC-00-current-system-status
DOC-01-ai-handoff
QA-00-smoke-test-baseline
```

串行要求：

- `ARCH-00` 必须在 Wave 1 前完成。
- 核心数据对象定义完成前，不要并行做 Inbox / Entity / Project Node 的深实现。

开发 prompt：

```text
请基于当前 integration 分支执行 Phase 3 Alpha Wave 0。
先阅读 README.md、最终产品形态.md、docs/AI_DEVELOPMENT_GUIDE.md、当前系统状态.md、AI_HANDOFF.md、PROJECT_FUNCTION_STRUCTURE.md、DATA_MODEL.md 和 docs/issues/README.md。
本轮目标是建立后续 AI 开发不会丢上下文的施工系统。

任务：
1. DEV-00：更新 AI 开发规则，明确一个主对话跑一个 Wave、哪些任务可以并行、哪些必须串行。
2. ARCH-00：定义 Phase 3 Alpha 核心数据对象合同，包括 Source、Signal、Memory、Entity、Project、ProjectNode、Action、Brief、Result。
3. DOC-00：维护当前系统状态，说明已完成、demo 状态、风险和下一步。
4. DOC-01：维护 AI_HANDOFF，作为新 Codex 对话的接手入口。
5. QA-00：增强 smoke test baseline，确保核心闭环仍可运行。

要求：
- 每个 issue 单独开分支。
- 每完成一个 issue 跑 node scripts/smoke-test.mjs。
- 每个 issue 完成后更新相关文档。
- 最后合入 integration/phase-3-wave-00，再合入 integration/phase-3-alpha。
- 开 draft PR，不直接合 main。
```

## 7. Wave 1：Inbox 到 Source / Signal

目标：用户可以手动输入真实业务信息，系统整理成 Source 和 Signal。

建议 issue：

```text
INBOX-01-manual-source-inbox
PIPE-01-source-to-signal
LINK-01-project-entity-suggestion
UI-01-inbox-review-flow
QA-01-inbox-smoke-flow
```

可并行判断：

- `INBOX-01` 和 `PIPE-01` 可以在数据合同稳定后并行。
- `LINK-01` 依赖 Entity / Project 的最小合同。
- `UI-01` 依赖 `INBOX-01` 的基础 UI。
- `QA-01` 可以在前几个 issue 完成后补。

开发 prompt：

```text
请基于 integration/phase-3-alpha 的最新稳定状态执行 Phase 3 Alpha Wave 1。
本轮目标是做出可用的 Inbox 第一版：用户可以粘贴邮件、Slack、会议纪要或碎片信息，系统生成 Source，并提取 Signal。

任务：
1. INBOX-01：新增手动 Source Inbox 页面，支持信息类型、标题、正文、来源、发生时间和参与对象。
2. PIPE-01：实现 Source -> Signal pipeline，可以先用本地规则或 mock AI，输出结构化 Signal。
3. LINK-01：为 Signal 建议关联 Entity 和 Project，先做本地建议和人工确认。
4. UI-01：实现 Inbox review flow，支持确认、忽略、转 memory、转 action。
5. QA-01：补 smoke test，覆盖录入、提取、确认流程。

要求：
- 每个 issue 单独分支。
- 每个 issue 完成后运行 node scripts/smoke-test.mjs。
- 不接 Gmail / Slack API。
- 不自动执行外部动作。
- 更新 DATA_MODEL.md、PROJECT_FUNCTION_STRUCTURE.md、docs/FILE_FUNCTION_NOTES.md、当前系统状态.md、AI_HANDOFF.md。
```

## 8. Wave 2：Entity Profile 与 Project Node

目标：系统能理解长期业务对象，并让项目从单节点演化为多节点。

建议 issue：

```text
ENTITY-01-entity-profile
ENTITY-02-entity-linking
PROJECT-01-project-nodes
PROJECT-02-node-detail-panel
QA-02-entity-project-flow
```

开发 prompt：

```text
请基于 Phase 3 Alpha Wave 1 稳定分支执行 Wave 2。
本轮目标是实现 Entity Profile 和 Project Node，让客户、投资人、合作方等对象形成画像，让项目支持单节点和多节点推进。

任务：
1. ENTITY-01：新增 Entity Profile 数据结构和详情页。
2. ENTITY-02：展示 Inbox / Signal / Memory / Project 与 Entity 的关联。
3. PROJECT-01：新增 Project Node 数据结构、列表和状态。
4. PROJECT-02：新增 Node Detail Panel，展示目标、上下文、action、waiting、result。
5. QA-02：测试 Entity 与 Project Node 的核心路径。

要求：
- 每个 issue 单独分支。
- 每个 issue 完成后运行 node scripts/smoke-test.mjs。
- 小项目允许只有一个默认节点。
- 大项目允许 AI 建议拆分，但必须保留人工确认。
- 更新相关文档和 handoff。
```

## 9. Wave 3：Memory Governance 与 Action 回流

目标：让 memory 状态、action brief、result feedback 真正进入业务闭环。

建议 issue：

```text
MEM-05-memory-governance-live
ACTION-01-brief-generation
ACTION-02-result-feedback
REC-03-result-to-memory-update
QA-03-action-loop-smoke
```

开发 prompt：

```text
请基于 Phase 3 Alpha Wave 2 稳定分支执行 Wave 3。
本轮目标是实现可用的 Memory Governance 与 Action 回流闭环。

任务：
1. MEM-05：确认、过期、争议、归档真正影响展示、建议和优先级。
2. ACTION-01：生成 Action Brief，包含目标、上下文、entity、memory、风险和成功标准。
3. ACTION-02：实现 Result Feedback 输入和结果记录。
4. REC-03：根据 result 生成新 memory、memory update、follow-up action 和项目状态变化。
5. QA-03：测试 Action Brief -> Result Feedback -> Memory Update 的完整路径。

要求：
- 每个 issue 单独分支。
- 每个 issue 完成后运行 node scripts/smoke-test.mjs。
- 高风险 action 仍只生成草稿和人工确认项。
- 结果回流必须能追溯证据。
- 更新相关文档和 handoff。
```

## 10. Wave 4：Command Center Alpha

目标：用户打开产品后能知道今天最应该处理什么。

建议 issue：

```text
DASH-01-command-center
COMMIT-01-commitment-waiting
RISK-01-risk-opportunity-radar
PRIORITY-01-ai-priority-queue
QA-04-alpha-e2e-smoke
```

开发 prompt：

```text
请基于 Phase 3 Alpha Wave 3 稳定分支执行 Wave 4。
本轮目标是实现可用的公司级 Command Center。

任务：
1. DASH-01：新增 Command Center 首页，聚合项目、inbox、memory、action 和 risk。
2. COMMIT-01：新增承诺、等待项、依赖项模型与展示。
3. RISK-01：新增风险和机会雷达。
4. PRIORITY-01：新增 AI Priority Queue，告诉用户今天最该处理什么。
5. QA-04：端到端 smoke test，覆盖 Inbox -> Memory -> Project -> Action -> Result -> Dashboard。

要求：
- 每个 issue 单独分支。
- 每个 issue 完成后运行 node scripts/smoke-test.mjs。
- Command Center 是工作首页，不做营销 landing page。
- 展示必须可追溯到 Source / Memory / Project / Action。
- 最后合入 integration/phase-3-alpha，开 draft PR，不直接合 main。
```

Wave 4 执行结果（2026-05-20）：

- `DASH-01` 完成 Command Center 聚合 pipeline 和首页展示。
- `COMMIT-01` 完成 commitment / waiting / dependency / follow-up 的 demo、migration 和展示。
- `RISK-01` 完成显式 risk / opportunity demo、migration 和雷达展示。
- `PRIORITY-01` 完成本地规则版 AI Priority Queue，包含 reason、targetId 和证据链。
- `QA-04` 扩展 smoke test 覆盖 Inbox -> Memory -> Project / Node -> Action -> Result -> Dashboard。
- Wave 4 保持不接外部 API、不自动执行外部动作、不把主界面改成聊天产品。

## 11. 后续阶段沿用方式

这套规则不仅用于 Phase 3，也用于后续阶段。

后续每个阶段都按这个模板新增计划：

```text
阶段目标：
稳定 base：
Wave 列表：
每个 Wave 的 issue：
哪些必须串行：
哪些可以并行：
每轮开发 prompt：
验收标准：
```

当项目进入登录、计费、多租户、外部集成和真实 AI provider 阶段时，仍然沿用：

- 一个主对话管理一个 Wave。
- 每个 issue 单独分支。
- 核心合同先串行。
- UI / 测试 / 文档 / adapter 可并行。
- 每完成一个 issue 跑 smoke test。
- 每轮更新 handoff 和当前状态。
