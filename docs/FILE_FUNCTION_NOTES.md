# TeamMind 全文件功能备注

用途：给人类队友和 AI 协作者快速理解仓库里每个文件的作用、修改边界和检查重点。  
最后更新：2026-05-13

## 1. 根目录文件

### `README.md`

项目入口说明。它面向第一次打开仓库的人，解释 TeamMind 是什么、MVP 范围、本地运行方式和当前架构。

主要作用：

- 给出项目的一句话定位。
- 列出 MVP 当前已有能力。
- 指向核心产品和开发文档。
- 说明如何用 `npm run dev` 或 `python -m http.server 4173` 本地运行。
- 说明当前不是生产级后端产品。

修改时注意：

- 新增重要文档时，应在 Product Docs 中加链接。
- 不要把详细需求全部塞进 README，详细内容放 PRD 或 issue spec。

### `最终产品形态.md`

长期产品愿景文档。它回答“TeamMind 最终要成为怎样的公司级 AI operating system”。

主要作用：

- 定义终极产品形态。
- 说明 Inbox、Memory、Entity、Project、Action、Agent、Command Center 等长期模块。
- 作为后续阶段规划和优先级判断的最高层产品上下文。

修改时注意：

- 只有长期产品共识变化时才修改。
- 不要把具体实现细节或短期 issue 执行记录塞进这里。

### `AI_HANDOFF.md`

AI 接手入口文档。它给新的 Codex / AI 对话框快速恢复当前上下文。

主要作用：

- 说明当前产品判断。
- 列出开发前必须阅读的文档。
- 记录当前稳定分支和下一步。
- 减少长对话结束后上下文丢失。

修改时注意：

- 每完成 2-3 个 issue 或一个 Wave 后更新。
- 保持简短，只写接手必须知道的信息。

### `当前系统状态.md`

当前系统状态文档。它记录已完成、仍偏 demo、下一阶段和风险。

主要作用：

- 给新对话说明当前代码和产品实际状态。
- 区分已完成能力、demo 形状和未完成能力。
- 指向下一阶段 Wave 计划。

修改时注意：

- Wave 结束后必须更新。
- 不要把详细日志塞进这里，详细日志放 `docs/TEAM_DEV_LOG.md`。

### `PRD.md`

v0.2 产品需求文档。它回答“为什么做、先做什么、不做什么”。

主要作用：

- 定义 TeamMind 的产品定位：公司专属上下文 Agent。
- 定义核心闭环：Context Intake -> Memory Extraction -> Memory Reconciliation -> Top 3 Action Planning -> Scenario Brief -> Result Feedback -> Memory Update。
- 记录 v0.2 的目标、里程碑和不做范围。
- 给后续 issue 开发提供产品判断标准。

修改时注意：

- 行为或产品边界变化必须同步更新这里。
- 不要把 TeamMind 改成聊天机器人、prompt 工具或普通知识库问答。

### `PROJECT_FUNCTION_STRUCTURE.md`

项目功能结构和架构边界文档。它回答“代码应该放在哪里、模块边界是什么”。

主要作用：

- 说明当前文件结构。
- 定义 v0.2 目标架构。
- 解释 UI、App Controller、Domain、Services、Data 的职责。
- 说明未来要新增的 pipeline、schema、provider、repository 文件。
- 给 AI 协作者提供修改守则。

修改时注意：

- 新增目录或改变模块职责时同步更新。
- 保持它和 `DATA_MODEL.md`、`docs/issues/` 一致。

### `DATA_MODEL.md`

v0.2 数据模型基准文档。它回答“数据对象长什么样、字段怎么流转”。

主要作用：

- 定义 `AppState`、`Project`、`ContextItem`、`MemoryItem`、`ActionItem`、`Brief`、`ActionResult`、`AgentRun` 等目标模型。
- 定义 memory status、action status、source references、reconciliation result。
- 说明旧数据迁移、AI 输出校验和写入安全规则。

修改时注意：

- 新增或修改字段时必须先或同时更新这里。
- 不要在代码里发明和本文档冲突的同义字段。

### `package.json`

Node 项目配置和本地脚本入口。

主要作用：

- 声明项目名、版本、模块类型。
- 提供 `npm run dev` 和 `npm run start`，本质都是启动 Python 静态服务器。
- 提供 `npm run smoke`，执行 `scripts/smoke-test.mjs`。

修改时注意：

- 当前项目没有构建工具和依赖包，新增依赖前要确认确实必要。
- 如果引入前端框架或测试框架，需要同步更新 README 和架构文档。

### `index.html`

静态应用 HTML 入口。

主要作用：

- 声明中文页面和 viewport。
- 加载 `src/styles.css`。
- 提供根节点 `#app`。
- 以 ES Module 方式加载 `src/main.js`。

修改时注意：

- 这里不放业务逻辑。
- 如果新增全局资源或 meta 信息，应保持静态部署兼容。

## 2. `docs/` 协作文档

### `docs/TEAM_DEV_LOG.md`

团队共享开发日志。

主要作用：

- 记录当前协作结论。
- 说明远程仓库、分支现状和是否存在 `dev` 分支。
- 给出 v0.2 issue 开发顺序。
- 维护任务看板、易冲突文件、完成标准和开发日志。

修改时注意：

- 每次开始或完成重要 issue，可以追加日志。
- 这里记录协作事实和决策，不替代 issue spec。

### `docs/AI_DEVELOPMENT_GUIDE.md`

AI 和开发者开发规范指南。

主要作用：

- 说明 AI 每次开发前应阅读哪些上下文文档。
- 定义一个主对话跑一个 Wave 的默认开发方式。
- 定义哪些任务可以并行、哪些必须串行。
- 定义 issue 分支、wave integration、阶段 integration 和 draft PR 规则。
- 定义开工说明、改后总结、文档同步和验证规则。
- 约束产品边界：不改成聊天产品，不做自动外部执行。

修改时注意：

- 改变协作流程、AI 开发规则或分支策略时同步更新。
- 不要在这里重复完整 PRD 或数据模型，只写开发行为规范。

### `docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md`

Phase 3 Alpha 开发计划。它把下一阶段拆成 Wave、issue、并行规则和开发 prompt。

主要作用：

- 定义 Phase 3 Alpha 的阶段目标。
- 给出 Wave 0 到 Wave 4 的开发顺序。
- 写清每轮哪些任务可以并行、哪些需要串行。
- 提供每轮可以直接交给 Codex 的开发 prompt。

修改时注意：

- Phase 3 Alpha 的开发顺序变化时同步更新。
- 后续 Phase 4 / Phase 5 应新增独立阶段计划，不要把所有未来内容塞进这个文件。

### `docs/FILE_FUNCTION_NOTES.md`

当前文件，也就是全文件功能备注。

主要作用：

- 逐一说明仓库内所有文件的职责。
- 标明修改时容易影响的边界。
- 帮助人类和 AI 快速检查文件作用。

修改时注意：

- 新增文件后要在这里补一节。
- 文件职责发生变化时要同步更新。

## 3. `docs/issues/` Issue 规格

### `docs/issues/README.md`

issue 开发说明总览。

主要作用：

- 说明 issue spec 的写法和用途。
- 说明 issue 命名、模板、验收和分支规则。
- 指向当前阶段 Wave 计划。
- 区分历史 Milestone 1 issue 和后续 Phase 3 Alpha issue。

修改时注意：

- 新增 issue 后应检查这里的顺序是否需要更新。

### `docs/issues/CTX-01-context-metadata.md`

上下文元数据 issue。

主要作用：

- 让上下文输入支持发生日期、参与人、标签和重要程度。
- 要求 demo 数据和持久化同步升级。
- 为后续 source references 和 context detail 打基础。

通常会改：

- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/data/demo.js`

### `docs/issues/CTX-03-context-memory-source-links.md`

上下文和记忆来源引用 issue。

主要作用：

- 要求每条 memory 带 `sourceReferences`。
- source reference 至少包含 `contextId` 和原文片段。
- 为用户从记忆回到原始上下文验证判断打基础。

通常会改：

- `src/domain/types.js`
- `src/domain/agentEngine.js`
- 未来的 `src/domain/pipelines/extractMemories.js`
- `src/ui/render.js`

### `docs/issues/MEM-01-memory-status-source-references.md`

memory 状态和来源引用 issue。

主要作用：

- 给 `MemoryItem` 增加 `status`、`sourceReferences`、`createdBy`、`updatedAt`、`lastVerifiedAt`。
- 新 AI memory 默认 `draft`。
- UI 显示状态 badge、来源数量和置信度。

通常会改：

- `src/domain/types.js`
- `src/domain/agentEngine.js`
- 未来的 `src/domain/pipelines/extractMemories.js`
- `src/ui/render.js`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

### `docs/issues/MEM-02-edit-company-memory.md`

编辑公司记忆 issue。

主要作用：

- 允许用户编辑 memory 的标题、类型、内容和状态。
- 保存后刷新仍保留。
- 保证编辑不会破坏 action 关联。

通常会改：

- `src/ui/render.js`
- `src/main.js`
- `src/services/store.js`

### `docs/issues/MEM-03-memory-status-transitions.md`

memory 状态流转 issue。

主要作用：

- 支持 confirmed、outdated、disputed、archived 等状态切换。
- 后续 action planning 会优先使用 confirmed memory。
- outdated 和 archived 默认不参与新行动生成。

通常会改：

- `src/domain/types.js`
- `src/ui/render.js`
- `src/main.js`
- `src/domain/agentEngine.js`

### `docs/issues/MEM-04-memory-detail-panel.md`

memory 详情面板 issue。

主要作用：

- 显示单条记忆详情。
- 展示来源上下文。
- 展示相关行动和结果。
- 支持从 memory 跳回 source context。

通常会改：

- `src/ui/render.js`
- `src/main.js`

### `docs/issues/REC-01-extract-memories-pipeline.md`

拆出 memory 提取 pipeline issue。

主要作用：

- 把 `agentEngine.js` 里的 memory 提取逻辑迁移到 `src/domain/pipelines/extractMemories.js`。
- 保持 `absorbContext()` 对外行为不变。
- 让 `agentEngine.js` 更像 orchestrator。

通常会改：

- `src/domain/agentEngine.js`
- `src/domain/pipelines/extractMemories.js`
- `scripts/smoke-test.mjs`

### `docs/issues/REC-02-reconcile-memories-pipeline.md`

新增 memory reconcile pipeline issue。

主要作用：

- 在候选记忆写入前与已有记忆比较。
- 输出新增、重复、更新、冲突、过期建议。
- 为后续人工处理冲突打基础。

通常会改：

- `src/domain/pipelines/reconcileMemories.js`
- `src/domain/agentEngine.js`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

### `docs/issues/DEV-00-ai-development-rules.md`

Phase 3 Alpha Wave 0 的开发规则固化 issue。

主要作用：

- 要求补齐 Wave 0 issue spec。
- 明确 Wave 0 的分支、验收和文档同步入口。
- 保证后续 issue 不再只依赖阶段计划里的任务列表。

### `docs/issues/ARCH-00-core-domain-contract.md`

Phase 3 Alpha 核心数据合同 issue。

主要作用：

- 要求在 `DATA_MODEL.md` 中定义 Source、Signal、Entity、ProjectNode、Commitment、Risk、Opportunity 等 Alpha 对象。
- 对齐这些对象与现有 ContextItem、MemoryItem、ActionItem、Brief、ActionResult 和 AgentRun 的关系。
- 为 Wave 1 到 Wave 4 的实现提供稳定字段边界。

### `docs/issues/QA-00-smoke-test-baseline.md`

Phase 3 Alpha smoke test baseline issue。

主要作用：

- 要求增强 `scripts/smoke-test.mjs`。
- 把核心闭环、source references、reconciliation、action evidence、brief source 等作为后续 Wave 的最低验收线。

### `docs/issues/DOC-00-current-system-status.md`

当前系统状态维护 issue。

主要作用：

- 要求 Wave 0 结束后更新 `当前系统状态.md`。
- 记录 Phase 3 Alpha 的实际基线、风险和下一步。
- 同步 `docs/TEAM_DEV_LOG.md`。

### `docs/issues/DOC-01-ai-handoff.md`

AI handoff 维护 issue。

主要作用：

- 要求 Wave 0 结束后更新 `AI_HANDOFF.md`。
- 让下一个 Codex 对话能从 Wave 1 的 Inbox / Source / Signal 起点接手。
- 同步 `docs/TEAM_DEV_LOG.md`。

### `docs/issues/INBOX-01-manual-source-inbox.md`

Phase 3 Alpha Wave 1 的手动 Source Inbox issue。

主要作用：

- 要求落地 `Project.sources` 和 `Source` 的本地持久化。
- 要求 Company Inbox 支持用户手动录入邮件、会议纪要、网页摘录或业务碎片。
- 明确本 issue 不做 Signal 抽取、外部 API 接入或自动外部动作。

通常会改：

- `src/domain/types.js`
- `src/domain/agentEngine.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `src/data/demo.js`

### `docs/issues/PIPE-01-source-to-signal.md`

Phase 3 Alpha Wave 1 的 Source 到 Signal pipeline issue。

主要作用：

- 要求新增本地 `extractSignals()` pipeline。
- 要求 Source 可以被处理成结构化 Signal。
- 明确本 issue 不做人工 review、转 memory、转 action 或真实外部 AI provider。

通常会改：

- `src/domain/pipelines/extractSignals.js`
- `src/domain/agentEngine.js`
- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `src/data/demo.js`

### `docs/issues/LINK-01-project-entity-suggestion.md`

Phase 3 Alpha Wave 1 的 Signal 到 Entity / Project 建议关联 issue。

主要作用：

- 要求新增本地 `linkSignals()` pipeline。
- 要求 Signal 能产生 `suggestedEntityIds` 和 `suggestedProjectIds`。
- 要求 Source 同步保留 `relatedEntityIds` 和 `relatedProjectIds`。
- 明确本 issue 不做复杂关系图、CRM 集成或自动确认为事实。

通常会改：

- `src/domain/pipelines/linkSignals.js`
- `src/domain/agentEngine.js`
- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

### `docs/issues/UI-01-inbox-review-flow.md`

Phase 3 Alpha Wave 1 的 Inbox review flow issue。

主要作用：

- 要求 Signal 支持确认、忽略、转 Memory、转 Action。
- 要求 Signal 转化后的 Memory 能追溯到 Source 和 Signal。
- 要求转 Action 时保留人工确认边界，不自动执行外部动作。

通常会改：

- `src/domain/agentEngine.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `DATA_MODEL.md`
- `docs/FILE_FUNCTION_NOTES.md`

### `docs/issues/QA-01-inbox-smoke-flow.md`

Phase 3 Alpha Wave 1 的 Inbox smoke test issue。

主要作用：

- 要求 `scripts/smoke-test.mjs` 覆盖手动 Source、Signal 抽取、Entity / Project 建议和 Signal review。
- 确认 Inbox 相关 UI 控件可以由 `renderApp()` 渲染。
- 不新增产品功能或外部 API。

通常会改：

- `scripts/smoke-test.mjs`
- `docs/FILE_FUNCTION_NOTES.md`

### `docs/issues/ENTITY-01-entity-profile.md`

Phase 3 Alpha Wave 2 的 Entity Profile issue。

主要作用：

- 要求把 Wave 1 的 Entity 建议升级为可查看、可治理的画像。
- 要求 Entity Profile 展示基础信息、状态、来源、Signal、Memory、Project 和下一步建议。
- 要求兼容目标字段 `sourceIds` / `signalIds` / `memoryIds` / `projectIds` 与 Wave 1 的 `related*` 字段。
- 明确本 issue 不做复杂关系图、外部 CRM / Gmail / Slack 同步或完整编辑表单。

通常会改：

- `src/data/demo.js`
- `src/domain/agentEngine.js`
- `src/domain/pipelines/linkSignals.js`
- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`

### `docs/issues/ENTITY-02-entity-linking.md`

Phase 3 Alpha Wave 2 的 Entity Linking issue。

主要作用：

- 要求 Signal 建议关联后回写 Entity 的 Source / Signal / Project 链接。
- 要求 Signal 转 Memory 后把新 Memory 挂回相关 Entity。
- 要求 Signal 转 Action 后把下一步建议挂回相关 Entity。
- 明确本 issue 不做复杂实体合并 UI、关系图或外部系统同步。

通常会改：

- `src/domain/agentEngine.js`
- `src/domain/pipelines/linkSignals.js`
- `src/ui/render.js`
- `scripts/smoke-test.mjs`

### `docs/issues/PROJECT-01-project-nodes.md`

Phase 3 Alpha Wave 2 的 Project Nodes issue。

主要作用：

- 要求落地 `Project.nodes` 和默认单节点。
- 要求 Project Nodes 面板展示节点目标、状态、成功标准和关联对象数量。
- 要求用户可以切换节点状态，但不自动执行节点动作。
- 明确 Node Detail Panel 留给 `PROJECT-02`。

通常会改：

- `src/data/demo.js`
- `src/domain/agentEngine.js`
- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`

### `docs/issues/PROJECT-02-node-detail-panel.md`

Phase 3 Alpha Wave 2 的 Node Detail Panel issue。

主要作用：

- 要求用户可以打开单个 Project Node 详情。
- 要求详情展示节点目标、输入上下文、成功标准、Source / Signal / Memory / Action / Result 关联。
- 要求相关 Action 沿用现有 action 选择逻辑，继续只生成 Brief 和人工确认项。
- 明确本 issue 不做节点编辑表单、自动拆分节点或自动执行动作。

通常会改：

- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`

### `docs/issues/QA-02-entity-project-flow.md`

Phase 3 Alpha Wave 2 的 Entity / Project flow smoke issue。

主要作用：

- 要求 smoke test 覆盖手动 Source -> Signal -> Entity -> Memory / Action -> Project Node -> Result 的核心路径。
- 要求 ProjectNode 自动维护 Source、Signal、Memory、Action 和 Result 链接。
- 要求 Entity Profile 与 Node Detail Panel 能在同一条 flow 中展示关联证据。
- 明确本 issue 不做外部 API、自动执行或浏览器 e2e 框架。

通常会改：

- `scripts/smoke-test.mjs`
- `src/domain/agentEngine.js`

### `docs/issues/MEM-05-memory-governance-live.md`

Phase 3 Alpha Wave 3 的 Memory Governance Live issue。

主要作用：

- 要求 memory 状态真实影响展示、行动建议、brief 证据和优先级。
- 要求 confirmed memory 更积极参与 action loop。
- 要求 outdated / archived memory 默认不作为新行动强证据。
- 明确本 issue 不自动删除或覆盖 memory，不接外部 API。

通常会改：

- `src/domain/agentEngine.js`
- `src/ui/render.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

### `docs/issues/ACTION-01-brief-generation.md`

Phase 3 Alpha Wave 3 的 Action Brief Generation issue。

主要作用：

- 要求 Brief 从通用说明升级为场景化执行包。
- 要求 Brief 消费 action、entity、node、memory、风险和成功标准。
- 要求高风险 brief 保留人工确认和不要承诺项。

通常会改：

- `src/domain/agentEngine.js`
- `src/ui/render.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

### `docs/issues/ACTION-02-result-feedback.md`

Phase 3 Alpha Wave 3 的 Result Feedback issue。

主要作用：

- 要求完善 result feedback 输入和记录。
- 要求 result 保存 what changed、new evidence、follow-up needed 和相关 memory updates。
- 要求 result 能挂回 action、memory 和 Project Node。

通常会改：

- `src/domain/agentEngine.js`
- `src/main.js`
- `src/ui/render.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`

### `docs/issues/REC-03-result-to-memory-update.md`

Phase 3 Alpha Wave 3 的 Result to Memory Update issue。

主要作用：

- 要求根据 result 生成 memory update 建议。
- 要求需要后续动作时生成 pending follow-up action。
- 要求 Project Node 展示 result 带来的下一步建议或状态变化。
- 明确关键 memory update 仍需人工确认，不自动覆盖旧判断。

通常会改：

- `src/domain/agentEngine.js`
- `src/domain/pipelines/reconcileMemories.js`
- `src/ui/render.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`

### `docs/issues/QA-03-action-loop-smoke.md`

Phase 3 Alpha Wave 3 的 Action Loop smoke issue。

主要作用：

- 要求 smoke 覆盖 Memory Governance -> Action Brief -> Result Feedback -> Memory Update / Follow-up Action / Project Node 的完整路径。
- 要求验证 Wave 3 UI 渲染和核心对象链接。
- 不新增产品功能或外部 API。

通常会改：

- `scripts/smoke-test.mjs`
- `src/domain/agentEngine.js`
- `src/ui/render.js`

### `docs/issues/DASH-01-command-center.md`

Phase 3 Alpha Wave 4 的 Command Center 首页 issue。

主要作用：

- 要求新增公司级 Command Center 视图。
- 要求聚合 Inbox、Memory、Project、Node、Action、Risk 和 Opportunity。
- 明确 Command Center 是工作首页，不是营销 landing page 或聊天入口。

### `docs/issues/COMMIT-01-commitment-waiting.md`

Phase 3 Alpha Wave 4 的 Commitment / Waiting / Dependency issue。

主要作用：

- 要求落地承诺、等待项、依赖项和 follow-up 的第一版展示。
- 要求 Command Center 能识别逾期承诺和阻塞等待。
- 明确不自动发送催办、不代表用户承诺。

### `docs/issues/RISK-01-risk-opportunity-radar.md`

Phase 3 Alpha Wave 4 的 Risk / Opportunity Radar issue。

主要作用：

- 要求展示风险和机会雷达。
- 要求每条风险 / 机会能追溯证据。
- 明确不做复杂图谱、外部任务同步或自动业务结论。

### `docs/issues/PRIORITY-01-ai-priority-queue.md`

Phase 3 Alpha Wave 4 的 AI Priority Queue issue。

主要作用：

- 要求用本地规则生成可解释的优先级队列。
- 要求聚合 action、commitment、risk 和 memory review。
- 明确不自动执行队列项或外部动作。

### `docs/issues/QA-04-alpha-e2e-smoke.md`

Phase 3 Alpha Wave 4 的 Alpha 端到端 smoke issue。

主要作用：

- 要求 smoke test 覆盖 Command Center、Priority Queue、Commitment、Risk 和 Opportunity。
- 要求验证 render output 包含 Wave 4 关键 UI。
- 不引入浏览器 e2e 框架或真实外部服务。

### `docs/issues/NAV-01-command-center-deep-links.md`

Phase 3 Alpha Wave 5 的 Command Center 定位链路 issue。

主要作用：

- 要求 Priority Queue 和 Command Center 条目能定位到 Action、Memory、Commitment、Risk、Opportunity、Project Node 或 Source evidence。
- 要求展示推荐原因、证据摘要和下一步处理入口。
- 明确不引入复杂路由、不自动执行外部动作。

### `docs/issues/REVIEW-01-human-review-actions.md`

Phase 3 Alpha Wave 5 的人工 review 动作 issue。

主要作用：

- 要求 Memory Review、Commitment、Risk 和 Opportunity 支持最小状态推进。
- 要求所有本地 review 动作保留已有证据链。
- 明确不自动发送催办、邮件、Slack 或外部承诺。

### `docs/issues/EDIT-01-alpha-manual-editing.md`

Phase 3 Alpha Wave 5 的轻量手动编辑 issue。

主要作用：

- 要求 Action priority / status、Commitment status / dueAt、Risk / Opportunity status 提供轻量修改入口。
- 要求修改结果同步影响 Command Center 和项目区展示。
- 明确不做复杂表单系统或后端。

### `docs/issues/RESILIENCE-01-local-storage-hardening.md`

Phase 3 Alpha Wave 5 的 localStorage 兼容和空状态 hardening issue。

主要作用：

- 要求旧项目、空项目和缺字段项目仍能 migration 和渲染。
- 要求 Command Center、证据链和项目区在异常数据下不白屏。
- 明确不引入数据库迁移系统或 schema 校验库。

### `docs/issues/QA-05-alpha-hardening-smoke.md`

Phase 3 Alpha Wave 5 的 hardening smoke issue。

主要作用：

- 要求 smoke 覆盖 Command Center 定位、人工 review、轻量编辑和 legacy / partial project 兼容。
- 要求 smoke summary 增加 Wave 5 关键计数或状态。
- 不引入浏览器 e2e 框架或真实外部服务。

## 4. `scripts/` 文件

### `scripts/smoke-test.mjs`

核心闭环 smoke test。

主要作用：

- 从 `DEMO_PROJECT` 克隆一个项目。
- 调用 `absorbContext()` 模拟新增上下文。
- 找到一个未完成 action。
- 调用 `generateBrief()` 生成 Brief。
- 调用 `recordActionResult()` 写入结果回流。
- 检查 contexts、memories、actions、briefs、results 都存在。
- 直接检查 `extractMemories()` pipeline 输出 `{ memories, runSummary }`，并确认候选记忆带 `sourceReferences`。
- 检查新生成 action 的 `whyNow`、`evidenceMemoryIds`、`expectedArtifact`。
- 检查新生成 brief 的 `evidenceMemoryIds` 和 `sourceContextIds`。
- 检查 result feedback 的 `whatChanged`、`newEvidence`、`followUpNeeded` 和 memory update 结构。
- Phase 3 Alpha Wave 3 起，覆盖 Memory Governance -> Scenario Brief -> Structured Result Feedback -> Memory Update / Follow-up Action / Project Node suggestion 的完整 action loop。

修改时注意：

- 每个 issue 完成后都要能通过它。
- 数据模型升级后，应补充对应断言，避免只检查数量。
- 不依赖浏览器 DOM，便于 Node 中执行。

## 5. `src/` 应用代码

### `src/main.js`

应用控制器。

主要作用：

- 加载或创建初始 state。
- 调用 `renderApp(state)` 渲染页面。
- 绑定创建项目、吸收上下文、生成 Brief、结果回流、重置 Demo、导出 JSON 等事件。
- 调用 domain 层的 `absorbContext()`、`generateBrief()`、`recordActionResult()`。
- 调用 store 层的 `loadState()`、`saveState()`、`resetState()`、`makeProject()`。
- 管理 `activeProjectId` 和 `selectedActionId`。
- 读取结构化 Result Feedback 表单字段：summary、whatChanged、newEvidence、followUpNeeded。
- Phase 3 Alpha Wave 5 起，处理 Command Center 定位链接，把 priority queue 的 target 转成现有 selected action / memory / node state 并滚动到锚点。
- Phase 3 Alpha Wave 5 起，绑定 Commitment、Risk 和 Opportunity 的本地 review 状态推进按钮。

修改时注意：

- 不要在这里写复杂业务推理。
- UI 新按钮通常需要在这里绑定事件。
- 数据结构变化时，要确认表单读取和 state 更新逻辑同步。
- 多人协作时这里很容易冲突。

### `src/styles.css`

全局界面样式。

主要作用：

- 定义颜色、字体、布局和响应式规则。
- 控制 sidebar、topbar、pipeline、四栏工作区、memory card、action card、brief card、表单等视觉表现。
- 提供状态 badge、类型色点、空状态和移动端布局。

修改时注意：

- 当前 UI 是静态原生 CSS，没有组件库。
- 新 UI 状态要保证移动端不溢出。
- 不要让界面变成聊天产品布局。
- 颜色和圆角应保持现有克制风格。

### `src/data/demo.js`

内置 demo 项目数据。

主要作用：

- 提供 `DEMO_PROJECT`。
- 初始化一个名为 `Northstar Copilot` 的演示项目。
- 包含一条 context、五条 memory、三条 action。
- 让用户打开页面即可看到完整产品形态。

修改时注意：

- 每次数据模型新增字段，都要同步 demo 数据。
- demo 应覆盖新增能力，例如 memory status、sourceReferences、context metadata、commitment / waiting、risk / opportunity。
- demo 不应包含真实敏感信息。

### `src/domain/types.js`

共享类型枚举和展示标签。

主要作用：

- 定义 `CONTEXT_TYPES`。
- 定义 `MEMORY_TYPES` 及其标签、短标签和色调。
- 定义 `ACTION_TYPES`。
- 定义 priority、risk、action status、result outcome 的展示标签。
- 定义 commitment type / status 的展示标签。
- 定义 risk / opportunity status 和 impact 展示标签。

修改时注意：

- 新增状态、类型或标签时，同步 `DATA_MODEL.md` 和 UI。
- 这里只放稳定常量，不放业务函数。
- 当前已有 memory status 展示常量，MEM-03 会继续补状态流转。

### `src/domain/agentEngine.js`

当前本地规则 Agent 引擎。

主要作用：

- 暴露核心闭环入口：`absorbContext(project, input)`、`generateBrief(project, actionId)`、`recordActionResult(project, actionId, resultInput)`。
- 调用 `extractMemories()` pipeline 把上下文转成候选 memory。
- 为 memory 生成 action。
- 为 action 生成场景化 Brief，按客户跟进、投资人回复、工程 brief 等类型组织 sections。
- 处理结构化结果回流，保留 done action，生成 result learning memory、memory update 建议、node 状态建议和 follow-up actions。
- Phase 3 Alpha Wave 5 起，提供 Memory、Commitment、Risk 和 Opportunity 的本地人工 review 状态推进函数，保留原有证据链。

当前内部职责：

- `proposeActions()`：按 memory type 生成 action。
- `buildBrief()`：生成通用 brief sections。
- `recordActionResult()`：写入结果并产生新的记忆和后续行动。

修改时注意：

- v0.2 会逐步把内部逻辑拆到 `src/domain/pipelines/*`。
- 对外三个入口应尽量保持稳定，减少 UI 层改动。
- 不要在这里直接调用外部 SaaS 或真实发送动作。
- 新增 AI 输出时必须保证可追溯、可校验。

### `src/domain/pipelines/extractMemories.js`

记忆提取 pipeline。

主要作用：

- 暴露 `extractMemories({ project, context, now })`。
- 用本地关键词规则把 `ContextItem.body` 拆成候选 `MemoryItem`。
- 为每条候选 memory 补齐 `status`、`sourceReferences`、`createdBy`、`createdAt` 和 `updatedAt`。
- 返回 `{ memories, runSummary }`，不直接保存或修改 project state。

修改时注意：

- 不在这里做 reconciliation，也不直接过滤已有记忆；去重仍由 `agentEngine.js` 编排。
- 后续接真实 AI provider 时，应保持输出结构稳定并补 schema 校验。
- 每条 AI 生成的 memory 必须能追溯到 `context.id`。

### `src/domain/pipelines/extractSignals.js`

Source 到 Signal pipeline。

主要作用：

- 暴露 `extractSignals({ project, source, now })`。
- 用本地关键词规则把 `Source.body` 拆成候选 `Signal`。
- 为每条 Signal 补齐 `sourceId`、`type`、`summary`、`quote`、`confidence`、`suggestedMemory`、`suggestedAction`、`status`、`createdBy` 和时间字段。
- 返回 `{ signals, runSummary }`，不直接保存或修改 project state。

修改时注意：

- 不在这里做人工确认、转 memory 或转 action。
- 不调用真实外部 provider，也不执行 Gmail / Slack 等外部动作。
- 后续可替换为真实 AI provider，但输出结构必须保持稳定。

### `src/domain/pipelines/linkSignals.js`

Signal 到 Entity / Project 建议关联 pipeline。

主要作用：

- 暴露 `linkSignals({ project, signals, now })`。
- 基于 Source 参与对象建议 Entity。
- 为 Signal 补齐 `suggestedEntityIds` 和 `suggestedProjectIds`。
- 为 Source 生成 `relatedEntityIds` 和 `relatedProjectIds` 更新建议。
- 返回结构化更新，不直接写入 project state。

修改时注意：

- 不把建议自动确认为事实，Entity 默认 `watching`。
- 不做复杂实体合并或关系图可视化。
- 不接 CRM、Gmail、Slack 等外部系统。

### `src/domain/pipelines/buildCommandCenter.js`

Command Center 聚合 pipeline。

主要作用：

- 暴露 `buildCommandCenter({ project, now })`。
- 汇总 Source / Signal、Memory review、Open Action、Project Node、Risk 和 Opportunity。
- 输出只读 `CommandCenterSnapshot`，供首页展示今日焦点。
- 生成本地规则版 Priority Queue，每个队列项包含 reason 和证据链接。
- Phase 3 Alpha Wave 5 起，Priority Queue 条目包含只读 `targetAnchor`、`targetLabel` 和 `nextStepLabel`，用于定位到 Action、Memory、Commitment、Risk、Opportunity 或证据区。
- 第一版使用本地规则，不写入 state，不执行外部动作。

修改时注意：

- 新增 commitment、risk、opportunity 或 priority 规则时，保持输出可追溯。
- 不在这里触发 DOM、localStorage 或外部 SaaS。

### `src/services/store.js`

本地持久化服务。

主要作用：

- 定义 localStorage key：`teammind.mvp.state.v1`。
- 创建初始 state。
- 从 localStorage 读取 state。
- 保存 state。
- 重置 demo state。
- 创建新 project。
- 生成稳定 ID。
- 兼容迁移 `commitments`，保证旧 localStorage 缺少字段时不会白屏。
- 兼容迁移 `risks` 和 `opportunities`，保证 Command Center 输入稳定。

修改时注意：

- 当前依赖浏览器 `window.localStorage`，Node smoke test 不直接调用 `loadState()`。
- v0.2 需要增加 `schemaVersion` 和 migration。
- 未来会把 localStorage 细节迁移到 repository abstraction。
- 不要把业务判断放进 store。

### `src/ui/render.js`

HTML 渲染层。

主要作用：

- `renderApp(state)` 根据当前 state 输出完整页面 HTML。
- 渲染 sidebar、topbar、pipeline、上下文输入、memory 列表、action 列表、brief 面板和结果回流表单。
- 渲染 Command Center 工作首页。
- 渲染 Command Center / Priority Queue 的对象定位入口、目标锚点和证据链接。
- 渲染 Command Center 和项目区里的 Memory / Commitment / Risk / Opportunity 最小 review 操作按钮。
- 渲染 action result history、what changed、new evidence 和 follow-up 标记。
- 暴露 `getActiveProject(state)` 给 controller 使用。
- 提供 `escapeHtml()` 防止用户输入直接破坏 HTML。

当前主要渲染函数：

- `renderSidebar()`
- `renderTopbar()`
- `renderCommandCenter()`
- `renderPriorityQueue()`
- `renderPipeline()`
- `renderContextIntake()`
- `renderMemories()`
- `renderActions()`
- `renderBrief()`
- `renderBriefSections()`

修改时注意：

- 这里只负责展示，不做业务推理。
- 新增交互入口要提供稳定 `data-*` 属性给 `main.js` 绑定。
- 用户输入展示必须继续经过 `escapeHtml()`。
- 这是当前最容易产生 merge conflict 的文件之一。

## 6. 未来计划文件

这些文件在 v0.2 文档中已经规划，但当前仓库还不存在：

- `src/domain/schemas.js`
- `src/domain/pipelines/reconcileMemories.js`
- `src/domain/pipelines/planActions.js`
- `src/domain/pipelines/composeBrief.js`
- `src/domain/pipelines/processResult.js`
- `src/services/agentProvider.js`
- `src/services/repositories/localProjectRepository.js`

新增这些文件时，应同步更新：

- `PROJECT_FUNCTION_STRUCTURE.md`
- `DATA_MODEL.md`
- `docs/FILE_FUNCTION_NOTES.md`
- 对应 issue spec
- `scripts/smoke-test.mjs`

## 7. 快速检查清单

人类或 AI 修改前先确认：

- 当前改动对应哪个 issue？
- 是否涉及数据模型？
- 是否要更新 demo？
- 是否会影响 `render.js`、`main.js` 或 `agentEngine.js` 的共享区域？
- 是否需要更新 smoke test？
- 是否保持“草稿/人工确认优先，不自动外部执行”的产品边界？

修改后至少运行：

```bash
node scripts/smoke-test.mjs
```
