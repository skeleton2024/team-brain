# TeamMind 项目功能结构文档

版本：v0.2 开发指南  
状态：给队友和 AI 协作者使用的架构上下文  
仓库：`skeleton2024/team-brain`  
最后更新：2026-05-11

## 0. 阅读顺序

新队友或新的 Codex 对话框进入项目时，建议按这个顺序阅读：

```text
README.md
-> 最终产品形态.md
-> docs/AI_DEVELOPMENT_GUIDE.md
-> docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md
-> AI_HANDOFF.md
-> 当前系统状态.md
-> PRD.md
-> PROJECT_FUNCTION_STRUCTURE.md
-> DATA_MODEL.md
-> docs/issues/README.md
-> 当前要实现的 issue spec
```

`最终产品形态.md` 回答“长期要做成什么”。
`docs/AI_DEVELOPMENT_GUIDE.md` 回答“AI 和开发者每次开发前后怎么留下可追溯记录”。
`docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md` 回答“下一阶段按哪些 Wave 开发、哪些可以并行”。
`AI_HANDOFF.md` 和 `当前系统状态.md` 回答“新的对话框从哪里接手”。
`PRD.md` 回答“当前产品需求和阶段边界”。
`PROJECT_FUNCTION_STRUCTURE.md` 回答“代码应该放在哪里、模块边界是什么”。
`DATA_MODEL.md` 回答“数据对象长什么样、状态怎么流转”。
`docs/issues/` 回答“某个具体 issue 怎么开发、怎么验收”。

## 1. 产品边界

TeamMind 是面向早期创业团队的公司专属上下文 Agent。核心闭环是：

```text
上下文输入
-> 公司记忆提取
-> 公司记忆校准
-> Top 3 下一步行动
-> 行动 Brief
-> 结果回流
-> 公司记忆更新
```

开发时必须保持这个产品边界：

- 不是聊天机器人。
- 不是 prompt 模板工具。
- 不是普通知识库问答。
- 不自动发送邮件、Slack、Gmail。
- 不自动承诺谈判条件。
- 不自动修改、提交或 merge 代码。
- 所有外部动作先生成草稿或 Brief，由人确认。

## 2. 当前技术栈

当前 v0.1/v0.2 过渡阶段：

- 前端：HTML、CSS、原生 JavaScript。
- 模块系统：ES Modules。
- 状态管理：应用内 JavaScript state。
- 持久化：浏览器 localStorage。
- 本地运行：Python `http.server` 或 `npm run dev`。
- 测试：Node smoke test。
- 部署：任意静态托管服务。
- 仓库：GitHub 私有仓库 `skeleton2024/team-brain`。

当前暂不引入：

- React/Vue/Svelte。
- 后端 API。
- 数据库。
- 鉴权。
- LLM API。
- 外部 SaaS 集成。
- 构建工具。

这样做的原因不是长期坚持原生 JS，而是为了先把核心产品闭环和数据模型跑稳。等 v0.2 的记忆、行动、Brief、结果回流变得可信，再替换 UI 框架、数据库和 AI provider。

## 3. 当前文件结构

```text
team-brain/
  index.html
  README.md
  最终产品形态.md
  AI_HANDOFF.md
  当前系统状态.md
  PRD.md
  PROJECT_FUNCTION_STRUCTURE.md
  DATA_MODEL.md
  package.json
  docs/
    PHASE3_ALPHA_DEVELOPMENT_PLAN.md
    AI_DEVELOPMENT_GUIDE.md
    TEAM_DEV_LOG.md
    FILE_FUNCTION_NOTES.md
    issues/
      README.md
      CTX-01-context-metadata.md
      CTX-03-context-memory-source-links.md
      MEM-01-memory-status-source-references.md
      MEM-02-edit-company-memory.md
      MEM-03-memory-status-transitions.md
      MEM-04-memory-detail-panel.md
      REC-01-extract-memories-pipeline.md
      REC-02-reconcile-memories-pipeline.md
      DEV-00-ai-development-rules.md
      ARCH-00-core-domain-contract.md
      QA-00-smoke-test-baseline.md
      DOC-00-current-system-status.md
      DOC-01-ai-handoff.md
      INBOX-01-manual-source-inbox.md
      PIPE-01-source-to-signal.md
      LINK-01-project-entity-suggestion.md
      UI-01-inbox-review-flow.md
      QA-01-inbox-smoke-flow.md
      ENTITY-01-entity-profile.md
      ENTITY-02-entity-linking.md
      PROJECT-01-project-nodes.md
      PROJECT-02-node-detail-panel.md
      QA-02-entity-project-flow.md
      DASH-01-command-center.md
      COMMIT-01-commitment-waiting.md
      RISK-01-risk-opportunity-radar.md
      PRIORITY-01-ai-priority-queue.md
      QA-04-alpha-e2e-smoke.md
  scripts/
    smoke-test.mjs
  src/
    main.js
    styles.css
    data/
      demo.js
    domain/
      agentEngine.js
      types.js
      pipelines/
        extractMemories.js
        extractSignals.js
        linkSignals.js
        reconcileMemories.js
        buildCommandCenter.js
    services/
      store.js
    ui/
      render.js
      source-references.css
```

## 4. v0.2 / Phase 3 Alpha 目标架构

v0.2 不重写产品，而是基于现有代码拆清楚边界。Phase 3 Alpha 在此基础上增加 Source / Signal、Entity、ProjectNode、Commitment、Risk、Opportunity 等对象合同，仍然保持静态本地 MVP，不引入后端、鉴权或真实外部自动执行。

目标结构：

```text
UI Layer
  src/ui/render.js

App Controller
  src/main.js

Domain Orchestrator
  src/domain/agentEngine.js

Domain Pipelines
  src/domain/pipelines/extractSignals.js
  src/domain/pipelines/extractMemories.js
  src/domain/pipelines/reconcileMemories.js
  src/domain/pipelines/linkSignals.js
  src/domain/pipelines/planActions.js
  src/domain/pipelines/composeBrief.js
  src/domain/pipelines/processResult.js
  src/domain/pipelines/buildCommandCenter.js

Domain Types and Schemas
  src/domain/types.js
  src/domain/schemas.js

Services
  src/services/store.js
  src/services/agentProvider.js
  src/services/repositories/localProjectRepository.js

Data
  src/data/demo.js
```

### 4.1 分层规则

UI Layer：

- 只负责展示和收集用户输入。
- 不做记忆提取、行动判断、Brief 生成。
- 不直接读写 localStorage。

App Controller：

- 负责事件绑定、状态切换、调用 domain 和 services。
- 可以做轻量编排。
- 不写复杂业务推理。

Domain Orchestrator：

- 保留产品闭环入口。
- 对外提供 `absorbContext()`、`generateBrief()`、`recordActionResult()`。
- 调用各 pipeline。
- 不关心 UI 细节。

Domain Pipelines：

- 每个 pipeline 负责一个明确的 Agent 能力。
- 输入和输出必须是结构化对象。
- Source / Signal / Memory / Entity / Project / Action / Result 的输入输出协议必须先按 `DATA_MODEL.md` 固定。
- 未来接 LLM 时，pipeline 仍然负责 schema 校验、fallback 和安全规则。

Services：

- 负责持久化、AI provider、未来外部系统 adapter。
- 不承载产品判断。

Data：

- 提供 demo 项目和测试样本。
- demo 数据必须覆盖核心闭环。
- Phase 3 Alpha 的 demo 数据应逐步覆盖 Source、Signal、Entity、ProjectNode、Commitment、Risk、Opportunity。

## 5. 当前模块职责

### `index.html`

静态应用入口。

职责：

- 提供根节点 `#app`。
- 加载 `src/styles.css`。
- 加载 `src/main.js`。

### `src/main.js`

应用控制器。

职责：

- 读取和保存状态。
- 调用渲染函数。
- 绑定按钮、表单和选择事件。
- 调用 domain 层完成上下文吸收、Brief 生成、结果回流。
- 管理当前选中的项目和行动。

不应该放在这里：

- 记忆提取规则。
- 行动优先级算法。
- Brief 模板生成。
- localStorage 细节。

### `src/domain/agentEngine.js`

当前本地 Agent 引擎。v0.1 里它同时承担了提取、行动、Brief、回流。v0.2 应逐步把它拆成 orchestrator。

当前对外入口：

```text
absorbContext(project, input)
generateBrief(project, actionId)
recordActionResult(project, actionId, resultInput)
```

v0.2 目标：

- 保留这三个入口，避免 UI 层大改。
- 把内部逻辑迁移到 `src/domain/pipelines/*`。
- 每次 pipeline 运行产生 `AgentRun`。
- 每个 AI 或规则输出都能追溯 sourceReferences。

REC-01 当前进展：

- `absorbContext()` 已调用 `src/domain/pipelines/extractMemories.js` 获取候选记忆。
- `agentEngine.js` 继续负责 context 写入、去重、action 生成、Brief 和结果回流编排。

### `src/domain/types.js`

共享枚举和展示标签。

职责：

- 上下文类型。
- 记忆类型。
- 记忆状态。
- 行动类型。
- 行动状态。
- 结果状态。
- 风险和优先级标签。

v0.2 要求：

- 只放稳定枚举、标签、常量。
- 不放业务函数。
- 新增字段时同步更新 `DATA_MODEL.md`。

### `src/domain/schemas.js`

v0.2 计划新增。

职责：

- 定义结构化输出校验。
- 校验 Memory、Action、Brief、ActionResult、AgentRun。
- 阻止非法 AI 输出写入 state。

第一版可以手写轻量校验函数，不必马上引入 Zod。

### `src/domain/pipelines/extractMemories.js`

REC-01 已新增。

职责：

- 从 `ContextItem` 中提取候选 `MemoryItem`。
- 每条 memory 必须包含 `sourceReferences`。
- 输出候选记忆，不直接改 state。
- 当前实现使用本地关键词规则，返回 `{ memories, runSummary }`，为后续真实 AI provider 和 schema 校验预留边界。

### `src/domain/pipelines/reconcileMemories.js`

REC-02 已新增。

职责：

- 比较候选记忆和已有记忆。
- 判断 `new`、`duplicate`、`update`、`conflict`、`outdate`。
- 输出 reconciliation result，由 orchestrator 决定如何写入 state。

### `src/domain/pipelines/extractSignals.js`

Phase 3 Alpha Wave 1 已新增。

职责：

- 从 `Source` 中抽取结构化 `Signal`。
- 保留原始 Source，不直接覆盖正文。
- 输出 `{ signals, runSummary }`，不直接改 state。
- 第一版可以使用本地规则或 mock AI，不接真实外部集成。

### `src/domain/pipelines/linkSignals.js`

Phase 3 Alpha Wave 1 已新增。

职责：

- 为 Signal 建议关联 Entity、Project、ProjectNode 和 Memory。
- 输出可人工确认的建议，不自动覆盖已有对象。
- 为 Inbox review flow 和 Entity/Profile linkage 提供统一协议。

### `src/domain/pipelines/planActions.js`

v0.2 计划新增。

职责：

- 基于当前可信记忆生成最多 Top 3 actions。
- 每个 action 必须包含 `whyNow` 和 `evidenceMemoryIds`。
- 高风险 action 必须包含人工确认清单。

### `src/domain/pipelines/composeBrief.js`

v0.2 计划新增。

职责：

- 根据 action type 生成不同 Brief schema。
- 输出可执行、可审核、可编辑的 Brief。
- 不执行外部动作。

### `src/domain/pipelines/processResult.js`

v0.2 计划新增。

职责：

- 处理行动结果回流。
- 判断哪些记忆被确认、更新、废弃或产生冲突。
- 生成必要的后续行动。

### `src/domain/pipelines/buildCommandCenter.js`

Phase 3 Alpha Wave 4 已新增。

职责：

- 汇总 inbox、memory、project、node、action、commitment、risk 和 opportunity。
- 生成今日优先级队列。
- 输出可追溯的 Dashboard 数据，不直接执行外部动作。
- 第一版使用本地规则生成 Command Center snapshot，后续 `COMMIT-01`、`RISK-01` 和 `PRIORITY-01` 会继续补齐输入和排序。

### `src/services/store.js`

当前本地持久化服务。

职责：

- 初始化 demo state。
- 从 localStorage 读取 state。
- 保存 state。
- 创建项目和 ID。

v0.2 要求：

- 增加 `schemaVersion`。
- 支持旧数据迁移。
- 逐步把 localStorage 细节移到 repository。

### `src/services/repositories/localProjectRepository.js`

v0.2 计划新增。

职责：

- 封装本地项目读写。
- 暴露 repository 方法。
- 为未来 Supabase/Postgres 替换留接口。

目标接口：

```text
getState()
saveState(state)
createProject(input)
updateProject(project)
addContext(projectId, context)
addSource(projectId, source)
addSignal(projectId, signal)
updateMemory(projectId, memory)
upsertEntity(projectId, entity)
upsertProjectNode(projectId, node)
addAction(projectId, action)
addBrief(projectId, brief)
addResult(projectId, result)
upsertCommitment(projectId, commitment)
upsertRisk(projectId, risk)
upsertOpportunity(projectId, opportunity)
```

### `src/services/agentProvider.js`

v0.2 计划新增。

职责：

- 封装 AI provider。
- 第一版是 mock/rule provider。
- 未来可接 OpenAI API。
- provider 只服务 pipeline，不直接驱动 UI。

目标接口：

```text
extractMemories(input)
reconcileMemories(input)
planActions(input)
composeBrief(input)
processResult(input)
```

### `src/ui/render.js`

纯渲染层。

职责：

- 根据 state 输出 HTML。
- 渲染项目、上下文、记忆、行动、Brief、结果回流。
- 提供必要的 `data-*` 属性给 `main.js` 绑定事件。

不应该放在这里：

- localStorage。
- 记忆提取。
- action ranking。
- Brief 内容生成。
- AI 调用。

### `src/data/demo.js`

Demo 数据。

职责：

- 提供可演示的项目。
- 覆盖真实使用场景。
- 每次数据模型升级时同步更新。

v0.2 demo 至少覆盖：

- 一条客户访谈。
- 一条投资人问题。
- 一条工程进展。
- 一条创始人笔记。
- 已确认记忆。
- 待确认记忆。
- 有来源引用的记忆。
- 至少一个 Brief。
- 至少一个结果回流。

### `scripts/smoke-test.mjs`

核心闭环测试。

职责：

- 模拟上下文输入。
- 模拟手动 Source 输入。
- 验证 Source 能生成 Signal。
- 验证 Signal 能建议 Entity / Project。
- 验证 Signal review 可以转 Memory / Action。
- 验证能生成记忆。
- 验证能生成行动。
- 验证能生成 Brief。
- 验证结果回流能写入结果和新记忆。
- 验证 Wave 3 action loop：memory governance、scenario brief、structured result feedback、memory update suggestion、follow-up action 和 Project Node status suggestion。

每个 issue 完成后至少运行：

```bash
node scripts/smoke-test.mjs
```

## 6. 功能领域

Phase 3 Alpha 的功能领域以 `DATA_MODEL.md` 的对象合同为边界：

```text
Inbox: Source -> Signal
Memory: Signal -> Memory / Reconciliation
Entity: Signal / Memory -> Entity Profile
Project: Project -> ProjectNode
Action: Memory / Signal / Node -> Action -> Brief
Result: ActionResult -> Memory Update / Follow-up Action
Command Center: Project / Node / Action / Commitment / Risk / Opportunity -> Priority Queue
```

原则：

- UI 只消费这些对象，不临时发明业务字段。
- pipeline 输出建议，controller 决定如何写入 state。
- store / repository 只负责持久化，不承载业务判断。
- 高风险 action、brief、commitment 仍然保留人工确认，不自动执行。

### 6.1 Context Intake

目标：让每段上下文成为可追溯证据。

负责内容：

- Phase 3 Alpha 的 `Source`。
- 从 Source 抽取的 `Signal`。
- 原始文本。
- 上下文类型。
- 发生时间。
- 参与人。
- 标签。
- 重要程度。
- 与 memory 的 source link。

主要文件：

- `src/main.js`
- `src/ui/render.js`
- `src/domain/types.js`
- `src/domain/pipelines/extractSignals.js`
- `src/domain/pipelines/linkSignals.js`
- `src/domain/pipelines/extractMemories.js`
- `src/data/demo.js`

### 6.2 Company Memory

目标：让公司记忆成为核心资产。

负责内容：

- 记忆类型。
- 记忆状态。
- 置信度。
- 来源引用。
- 人工编辑。
- 记忆详情。
- 与 action/result 的关联。

主要文件：

- `src/domain/types.js`
- `src/ui/render.js`
- `src/main.js`
- `src/domain/pipelines/reconcileMemories.js`
- `src/services/store.js`

### 6.3 Memory Reconciliation

目标：处理公司认知变化。

负责内容：

- 新记忆。
- 重复记忆。
- 更新旧记忆。
- 冲突判断。
- 过期判断。

主要文件：

- `src/domain/pipelines/extractMemories.js`
- `src/domain/pipelines/reconcileMemories.js`
- `src/domain/agentEngine.js`

### 6.4 Action Planning

目标：生成少量高价值下一步行动。

负责内容：

- Top 3 actions。
- whyNow。
- evidenceMemoryIds。
- memory governance 权重：confirmed 优先，draft / disputed 需要人工复核，outdated / archived 默认不作为新行动证据。
- owner/deadline suggestion。
- blockedBy。
- expectedArtifact。
- humanConfirmationChecklist。

主要文件：

- `src/domain/pipelines/planActions.js`
- `src/domain/types.js`
- `src/ui/render.js`

### 6.5 Brief Composer

目标：把 action 变成真实可执行 Brief。

负责内容：

- customer_followup Brief。
- investor_reply Brief。
- coding_brief Brief。
- 根据 action type 生成不同 sections，例如客户跟进、投资人回复和工程 brief 使用不同结构。
- Brief 消费相关 Entity、ProjectNode、Memory 和 success criteria，而不是只复述 action 标题。
- memory governance summary：说明 brief 使用了哪些可参与推理的 memory、排除了哪些过期或归档证据。
- 可编辑保存。
- 风险和人工确认。

主要文件：

- `src/domain/pipelines/composeBrief.js`
- `src/ui/render.js`
- `src/main.js`
- `src/services/store.js`

### 6.6 Result Feedback

目标：让执行结果改变记忆和下一步行动。

负责内容：

- 行动结果。
- whatChanged。
- newEvidence。
- followUpNeeded。
- relatedMemoryUpdates。
- projectNodeUpdates。
- action history。
- 结构化 Result Feedback 表单和 result history 展示。
- 已完成 action 的保留和追溯，避免回流后丢失 result 入口。
- result-to-memory update 建议：positive 可建议 confirm / update，blocked 可建议 dispute，neutral 可建议 update。
- result-to-node status 建议：blocked 建议 node blocked，正向且无后续建议 done，否则继续 active；这些建议不自动应用。

主要文件：

- `src/domain/pipelines/processResult.js`
- `src/domain/pipelines/reconcileMemories.js`
- `src/ui/render.js`
- `src/main.js`

### 6.7 Agent Runs

目标：让 AI/规则运行可审计。

负责内容：

- pipeline 运行记录。
- input/output summary。
- provider/model。
- success/failed。
- error。

主要文件：

- `src/domain/agentEngine.js`
- `src/domain/pipelines/*`
- `src/services/store.js`
- `src/ui/render.js`

### 6.8 Entity and Relations

目标：让系统理解客户、投资人、伙伴、团队成员、产品和市场等长期对象。

负责内容：

- Entity Profile。
- EntityRelation。
- Entity 与 Source / Signal / Memory / Project / Action 的关联。
- 最近互动和下一步建议。

主要文件：

- `src/domain/pipelines/linkSignals.js`
- `src/domain/types.js`
- `src/ui/render.js`
- `src/main.js`
- `src/data/demo.js`

### 6.9 Project Nodes

目标：让项目从单一事项演化为可推进、可复盘的节点结构。

负责内容：

- 默认单节点。
- 多节点拆分建议。
- 节点目标、状态、成功标准、等待项、风险和结果。

主要文件：

- `src/domain/types.js`
- `src/ui/render.js`
- `src/main.js`
- `src/data/demo.js`
- 未来 `src/domain/pipelines/planActions.js`

### 6.10 Command Center Inputs

目标：为公司级首页提供可排序、可追溯的优先级输入。

负责内容：

- Commitment。
- Waiting / Dependency / Follow-up。
- Risk。
- Opportunity。
- Priority Queue。

主要文件：

- `src/domain/pipelines/buildCommandCenter.js`
- 未来 `src/domain/pipelines/processResult.js`
- `src/ui/render.js`
- `src/main.js`
- `src/data/demo.js`

## 7. Issue 开发流程

以后开发不要直接说“优化记忆”或“加点 AI”。应该用 issue 驱动：

```text
选择一个 issue spec
-> 阅读 PRD 相关章节
-> 阅读 DATA_MODEL 对应对象
-> 确认涉及模块
-> 小步修改代码
-> 更新 demo/migration
-> 运行 smoke test
-> 更新文档
```

每个 issue 必须回答：

- 它属于哪个功能领域？
- 它改善了闭环的哪一步？
- 它改变了哪些数据结构？
- 它的 UI 入口在哪里？
- 它不做哪些事情？
- 它如何验收？

## 8. 当前建议开发顺序

Milestone 1 已完成 memory foundation。Phase 3 Alpha 建议顺序：

```text
Wave 0: DEV-00 -> ARCH-00 -> QA-00 -> DOC-00 -> DOC-01
Wave 1: INBOX-01 -> PIPE-01 -> LINK-01 -> UI-01 -> QA-01
Wave 2: ENTITY-01 -> ENTITY-02 -> PROJECT-01 -> PROJECT-02 -> QA-02
Wave 3: MEM-05 -> ACTION-01 -> ACTION-02 -> REC-03 -> QA-03
Wave 4: DASH-01 -> COMMIT-01 -> RISK-01 -> PRIORITY-01 -> QA-04
```

理由：

- 先定核心数据合同，再做深实现。
- 先把信息进入系统跑通，再做对象画像和项目节点。
- 先让 memory / action / result 闭环可信，再做公司级 Command Center。
- 每个 Wave 完成后更新 handoff、当前系统状态和团队开发日志。

## 9. 本地运行和验证

本地运行：

```bash
npm run dev
```

或：

```bash
python -m http.server 4173
```

浏览器打开：

```text
http://127.0.0.1:4173
```

核心验证：

```bash
node scripts/smoke-test.mjs
```

如果本地页面打不开，优先检查：

- 本地服务是否还在运行。
- 端口是不是 `4173`。
- 浏览器地址是不是 `http://127.0.0.1:4173`。
- VPN 通常不影响 `127.0.0.1`，除非代理软件劫持 localhost。

## 10. AI 协作者守则

AI 协作者进入本项目后必须遵守：

- 先读 `PRD.md`、本文件、`DATA_MODEL.md` 和当前 issue spec。
- 不要把产品改成聊天界面。
- 不要优先接 Gmail、Slack、Notion、GitHub 等集成。
- 不要把业务推理放进 UI。
- 不要把 Agent 判断放进 store。
- 不要新增不可追溯的 AI 输出。
- 不要自动执行高风险外部动作。
- 每个代码改动都要对应 issue 编号。
- 数据模型变化必须同步更新 `DATA_MODEL.md`。
- 行为变化必须同步更新 PRD 或 issue spec。
- 完成后运行 smoke test。
