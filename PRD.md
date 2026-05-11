# TeamMind PRD

版本：v0.2 可使用/可测试版本  
状态：下一阶段开发基准  
仓库：`skeleton2024/team-brain`  
最后更新：2026-05-11

## 0. 这份 PRD 的目的

这份 PRD 不再把 TeamMind 定义为一个“可演示 Demo”。v0.1 已经证明了基础闭环，但它产生的内容还不够有价值。v0.2 的目标是让 TeamMind 开始被真实团队使用和测试。

后续开发以 issue 为导向。每个 issue 必须对应一个功能领域，并回答：

```text
这个改动是否让 TeamMind 更懂公司？
是否让公司记忆更可信？
是否让下一步行动更有判断力？
是否让 Brief 更可执行？
是否让结果回流真的更新团队认知？
```

## 1. 产品定位

TeamMind 是面向早期创业团队的公司专属上下文 Agent。它不是聊天机器人，不是 prompt 生成器，也不是普通知识库问答工具。

TeamMind 的核心任务是：

```text
把团队分散的上下文
转成可追溯的公司记忆
再转成少量高价值行动
再生成可执行 Brief
最后通过执行结果回流更新公司认知
```

核心闭环：

```text
Context Intake
-> Memory Extraction
-> Memory Reconciliation
-> Top 3 Action Planning
-> Scenario Brief
-> Result Feedback
-> Memory Update
```

## 2. 当前 v0.1 评估

### 2.1 v0.1 已经做对的地方

现有代码已经形成了正确的基础分层：

```text
src/main.js
应用状态和交互编排

src/domain/agentEngine.js
上下文 -> 记忆 -> 行动 -> Brief -> 结果回流

src/services/store.js
本地存储

src/ui/render.js
页面渲染

src/domain/types.js
类型和标签
```

其中最值得保留的是三个核心函数：

```text
absorbContext(project, input)
generateBrief(project, actionId)
recordActionResult(project, actionId, resultInput)
```

这三个函数代表 TeamMind 的产品闭环，不应改成聊天式架构。

### 2.2 v0.1 不足

v0.1 目前只能作为产品形状验证，不能作为可使用产品：

- 记忆是规则切分的摘要，不够可信。
- 行动建议是模板，不像真实判断。
- Brief 是通用模板，不像具体工作产物。
- 结果回流没有真正更新旧记忆，只是追加新文本。
- 没有来源引用，用户无法验证 AI 为什么这么判断。
- 没有记忆状态，用户无法确认、废弃或纠正 AI 生成内容。
- 没有 Agent 运行记录，未来接 AI 后难以调试。
- localStorage 可继续用于 v0.2 原型，但不能承载多人和云端使用。

## 3. v0.2 产品目标

v0.2 的目标不是接更多 API，而是把核心能力做实。

必须做到：

- 用户输入真实团队上下文后，系统能生成可追溯的公司记忆。
- 用户能编辑、确认、废弃和查看记忆来源。
- 新上下文进入后，系统能判断是新增、重复、更新、冲突还是让旧记忆过期。
- 系统只给出少量高价值行动，优先 Top 3。
- 每个行动都能说明为什么现在做、依据是什么、产出是什么。
- Brief 必须按场景生成，不同类型行动有不同结构。
- 结果回流必须影响记忆和后续行动，而不是只存一段结果文本。
- 开发者和 AI 能通过 issue 明确知道每次改动属于哪个功能领域。

可以暂缓：

- Gmail、Slack、Notion、GitHub、Linear/Jira 等外部集成。
- 多团队权限。
- 复杂文件上传。
- 向量数据库。
- 自动发送邮件。
- 自动承诺谈判结果。
- 自动修改、提交或 merge 代码。

## 4. v0.2 核心架构

v0.2 继续基于现有代码演进，但要把 `agentEngine.js` 拆成明确 pipeline。

目标架构：

```text
UI Layer
  src/ui/render.js

App Controller
  src/main.js

Domain Pipelines
  src/domain/pipelines/extractMemories.js
  src/domain/pipelines/reconcileMemories.js
  src/domain/pipelines/planActions.js
  src/domain/pipelines/composeBrief.js
  src/domain/pipelines/processResult.js

Domain Types
  src/domain/types.js
  src/domain/schemas.js

Services
  src/services/repositories/localProjectRepository.js
  src/services/agentProvider.js
  src/services/store.js

Data
  src/data/demo.js
```

### 4.1 架构原则

- 产品主线仍然是闭环，不引入聊天作为核心模型。
- UI 层不放业务推理。
- store 层不放 Agent 逻辑。
- Agent pipeline 输出必须是结构化对象。
- 每个 AI 结果必须能追溯输入、来源和运行记录。
- 所有外部动作默认只生成草稿，不自动执行。
- v0.2 可以继续 localStorage，但必须先抽象 repository，为 Supabase/Postgres 做准备。

## 5. 功能领域和 Issue Backlog

后续开发按功能领域拆 issue。每个 issue 都应包含目标、涉及模块、不做范围和验收标准。

### 5.1 Context Intake 上下文输入

目标：让每段上下文成为可追溯的原始证据，而不是一次性文本。

现状：

- 用户只能输入类型、标题、正文。
- 记忆来源只有简单 source 字段。

目标数据结构：

```text
ContextItem
  id
  kind
  title
  body
  occurredAt
  participants
  tags
  importance
  createdAt
  sourceReferences
```

#### CTX-01 增加上下文元数据

涉及模块：

- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`

功能：

- 上下文输入支持发生日期、参与人、标签、重要程度。
- Demo 数据同步升级。

验收标准：

- 用户可以录入上述字段。
- 刷新页面后字段仍存在。
- smoke test 通过。

#### CTX-02 增加上下文详情视图

涉及模块：

- `src/ui/render.js`
- `src/main.js`

功能：

- 用户能查看一条上下文原文。
- 能看到这条上下文提取出了哪些记忆和行动。

验收标准：

- 点击上下文可以进入详情。
- 详情里能看到原文、元数据、关联记忆。

#### CTX-03 建立上下文和记忆的来源引用

涉及模块：

- `src/domain/types.js`
- `src/domain/pipelines/extractMemories.js`

功能：

- 每条 Memory 必须带 `sourceReferences`。
- source reference 至少包含 `contextId` 和原文片段。

验收标准：

- 查看记忆时能看到它来自哪条上下文。
- 用户能回到原始上下文验证。

### 5.2 Company Memory 公司记忆

目标：让记忆成为 TeamMind 的核心资产。

现状：

- 记忆不可编辑。
- 不能确认、废弃、标记冲突。
- 没有版本和来源片段。

目标数据结构：

```text
MemoryItem
  id
  type
  title
  content
  confidence
  status: draft | confirmed | outdated | disputed | archived
  sourceReferences
  createdBy: ai | human
  createdAt
  updatedAt
  lastVerifiedAt
```

#### MEM-01 增加 memory status 和 sourceReferences

涉及模块：

- `src/domain/types.js`
- `src/domain/pipelines/extractMemories.js`
- `src/ui/render.js`

功能：

- Memory 增加状态和来源引用。
- 默认 AI 生成的记忆为 `draft`。

验收标准：

- 新提取的记忆显示为待确认。
- 记忆卡片展示来源数量。

#### MEM-02 支持编辑公司记忆

涉及模块：

- `src/ui/render.js`
- `src/main.js`
- `src/services/store.js`

功能：

- 用户可以编辑标题、类型、内容、状态。

验收标准：

- 保存后状态更新。
- 刷新后仍保留。
- 编辑不会破坏关联 action。

#### MEM-03 支持确认、过期、有争议、归档

涉及模块：

- `src/domain/types.js`
- `src/ui/render.js`
- `src/main.js`

功能：

- 记忆支持状态切换。
- confirmed 记忆在行动生成中权重更高。
- outdated 和 archived 默认不参与新行动生成。

验收标准：

- 用户可以从 UI 切换状态。
- 行动生成优先引用 confirmed 记忆。

#### MEM-04 增加记忆详情面板

涉及模块：

- `src/ui/render.js`
- `src/main.js`

功能：

- 展示记忆详情。
- 展示来源上下文。
- 展示相关行动和结果。

验收标准：

- 用户能从记忆跳到来源上下文。
- 用户能看到这条记忆影响过哪些行动。

### 5.3 Memory Reconciliation 记忆更新

目标：让系统处理“公司认知变化”，而不是一直追加摘要。

现状：

- 新上下文只会新增记忆。
- 只有简单去重。

目标能力：

```text
new
duplicate
update
conflict
outdate
```

#### REC-01 拆出 extractMemories pipeline

涉及模块：

- `src/domain/agentEngine.js`
- `src/domain/pipelines/extractMemories.js`

功能：

- 从 `agentEngine.js` 拆出提取逻辑。
- 保持 `absorbContext()` 对外行为不变。

验收标准：

- smoke test 通过。
- `agentEngine.js` 更像 orchestrator。

#### REC-02 新增 reconcileMemories pipeline

涉及模块：

- `src/domain/pipelines/reconcileMemories.js`
- `src/domain/agentEngine.js`

功能：

- 新记忆进入前，与 existing memories 比较。
- 输出新增、更新、冲突、重复、过期建议。

验收标准：

- 输入“客户已经不担心价格”时，如果旧记忆是“客户担心价格”，系统能提示旧记忆可能过期。

#### REC-03 增加冲突记忆人工处理

涉及模块：

- `src/ui/render.js`
- `src/main.js`

功能：

- 冲突记忆不自动覆盖。
- 用户选择保留旧版、新版，或都保留为 disputed。

验收标准：

- 冲突出现时有明确 UI。
- 用户选择后状态写入 store。

### 5.4 Action Planning 行动规划

目标：从“模板行动列表”升级为“Top 3 next moves”。

现状：

- 行动按记忆类型模板生成。
- 行动缺少为什么现在做、依据、阻塞和预期产物。

目标数据结构：

```text
ActionItem
  id
  type
  title
  whyNow
  evidenceMemoryIds
  priority
  riskLevel
  expectedArtifact
  ownerSuggestion
  deadlineSuggestion
  blockedBy
  humanConfirmationChecklist
  status: pending | briefed | in_progress | done | archived
  createdAt
  updatedAt
```

#### ACT-01 升级 Action 数据模型

涉及模块：

- `src/domain/types.js`
- `src/domain/pipelines/planActions.js`
- `src/ui/render.js`
- `src/data/demo.js`

功能：

- Action 增加 whyNow、evidence、owner、deadline、blockedBy、expectedArtifact。

验收标准：

- 行动卡片展示为什么现在做。
- 行动详情展示依据记忆。

#### ACT-02 行动生成改为 Top 3

涉及模块：

- `src/domain/pipelines/planActions.js`

功能：

- 每次规划最多输出 3 个最重要行动。
- 优先使用 confirmed 记忆。
- 高风险行动必须带人工确认清单。

验收标准：

- 不再生成一堆同质行动。
- 每个行动必须有 evidenceMemoryIds。

#### ACT-03 增加行动详情视图

涉及模块：

- `src/ui/render.js`
- `src/main.js`

功能：

- 查看行动详情、来源记忆、风险、预期产物、阻塞项。

验收标准：

- 用户能理解为什么系统建议做这件事。

#### ACT-04 增加行动状态流转

涉及模块：

- `src/domain/types.js`
- `src/main.js`
- `src/ui/render.js`

功能：

- 支持 pending、briefed、in_progress、done、archived。

验收标准：

- 用户可以把行动标记为执行中。
- 回流结果后行动进入 done。

### 5.5 Brief Composer 行动 Brief

目标：Brief 必须成为真实可交付物，而不是通用说明。

现状：

- 所有行动共用一个模板。

目标：

- 不同 action type 使用不同 schema。
- Brief 可以人工编辑。
- Brief 保留版本和生成来源。

#### BRF-01 拆出 composeBrief pipeline

涉及模块：

- `src/domain/agentEngine.js`
- `src/domain/pipelines/composeBrief.js`

功能：

- 从 `agentEngine.js` 拆出 Brief 生成。

验收标准：

- 行为不变。
- smoke test 通过。

#### BRF-02 增加 customer_followup Brief schema

结构：

```text
background
customerConcern
replyStrategy
draftMessage
doNotPromise
nextQuestions
successCriteria
humanConfirmationChecklist
```

验收标准：

- 客户行动生成的 Brief 像一封可审核 follow-up 草稿。
- 明确不自动发送。

#### BRF-03 增加 investor_reply Brief schema

结构：

```text
investorQuestion
shortAnswer
evidenceWeHave
evidenceMissing
suggestedWording
doNotSay
followUpMaterials
founderConfirmationChecklist
```

验收标准：

- 投资人回复能区分已验证事实和待补证据。

#### BRF-04 增加 coding_brief Brief schema

结构：

```text
goal
background
scope
nonGoals
acceptanceCriteria
testPlan
risks
reviewChecklist
```

验收标准：

- Coding Brief 可以直接交给开发者作为任务说明。
- 明确不自动修改、提交或 merge 代码。

#### BRF-05 Brief 支持人工编辑和保存

涉及模块：

- `src/ui/render.js`
- `src/main.js`
- `src/services/store.js`

功能：

- 用户可以编辑 Brief。
- 保存后保留 editedAt。

验收标准：

- 刷新后编辑内容仍存在。

### 5.6 Result Feedback 结果回流

目标：执行结果必须改变公司记忆和下一步行动。

现状：

- 结果回流只追加结果学习。
- 没有对应行动假设和成功标准。

目标数据结构：

```text
ActionResult
  id
  actionId
  outcome
  summary
  whatChanged
  newEvidence
  followUpNeeded
  relatedMemoryUpdates
  createdAt
```

#### RES-01 升级结果数据模型

涉及模块：

- `src/domain/types.js`
- `src/ui/render.js`
- `src/main.js`

功能：

- 结果表单增加 whatChanged、newEvidence、followUpNeeded。

验收标准：

- 用户能记录这次行动改变了什么判断。

#### RES-02 回流时更新相关记忆状态

涉及模块：

- `src/domain/pipelines/processResult.js`
- `src/domain/pipelines/reconcileMemories.js`

功能：

- 结果可以确认、更新或废弃旧记忆。

验收标准：

- 客户反馈改变旧判断时，系统能提示相关记忆应更新。

#### RES-03 行动详情展示执行历史

涉及模块：

- `src/ui/render.js`

功能：

- 行动详情中展示 result history。

验收标准：

- 用户能看到行动从建议到回流的完整链路。

### 5.7 Agent Runs 运行记录

目标：未来接真实 AI 后可调试、可审计。

目标数据结构：

```text
AgentRun
  id
  projectId
  runType: extract | reconcile | plan | compose | process_result
  inputSummary
  outputSummary
  provider
  model
  status: success | failed
  error
  createdAt
```

#### RUN-01 增加 agentRuns 数据结构

涉及模块：

- `src/domain/types.js`
- `src/services/store.js`

验收标准：

- state 中存在 agentRuns。

#### RUN-02 每次 pipeline 运行写入 AgentRun

涉及模块：

- `src/domain/agentEngine.js`
- `src/domain/pipelines/*`

验收标准：

- 吸收上下文、生成行动、生成 Brief、结果回流都会产生 run 记录。

### 5.8 Store / Repository 存储层

目标：继续支持本地原型，同时为真实数据库准备接口。

现状：

- `store.js` 直接读写 localStorage。

目标：

```text
ProjectRepository
  getState()
  saveState(state)
  createProject(input)
  updateProject(project)
  addContext(projectId, context)
  updateMemory(projectId, memory)
  addAction(projectId, action)
  addBrief(projectId, brief)
  addResult(projectId, result)
```

#### STR-01 抽象 ProjectRepository

涉及模块：

- `src/services/store.js`
- `src/services/repositories/localProjectRepository.js`

验收标准：

- UI 和 domain 不直接知道 localStorage。
- smoke test 通过。

#### STR-02 增加 state migration version

功能：

- state 增加 `schemaVersion`。
- 老数据可迁移到新结构。

验收标准：

- 旧 localStorage 数据不会导致白屏。

### 5.9 AI Provider

目标：接真实 AI，但不做聊天，不让 AI 控制产品流程。

原则：

- AI 只服务 pipeline。
- AI 输出必须是结构化 JSON。
- 写入状态前必须 schema 校验。
- AI 失败时 fallback 到本地规则。

目标接口：

```text
agentProvider.extractMemories(input)
agentProvider.reconcileMemories(input)
agentProvider.planActions(input)
agentProvider.composeBrief(input)
agentProvider.processResult(input)
```

#### AI-01 增加 mock agentProvider

涉及模块：

- `src/services/agentProvider.js`
- `src/domain/pipelines/*`

验收标准：

- pipeline 可以通过 provider 调用。
- 默认仍使用本地 mock。

#### AI-02 增加 schema 校验

涉及模块：

- `src/domain/schemas.js`

验收标准：

- 非法 AI 输出不会写入 state。
- UI 显示可恢复错误。

#### AI-03 接入真实 LLM 的 extractMemories

前提：

- 已有 provider。
- 已有 schema 校验。

验收标准：

- 输入真实客户访谈，能生成更准确的结构化记忆。
- 每条记忆有 sourceReferences。

#### AI-04 接入真实 LLM 的 planActions

验收标准：

- 输出最多 Top 3。
- 每个行动有 whyNow 和 evidenceMemoryIds。

#### AI-05 接入真实 LLM 的 composeBrief

验收标准：

- 不同类型行动生成不同 schema Brief。
- 高风险事项保留人工确认。

## 6. 开发里程碑

### Milestone 1：让记忆可信

目的：用户开始信任 TeamMind 保存的公司记忆。

Issues：

```text
CTX-01
CTX-03
MEM-01
MEM-02
MEM-03
MEM-04
REC-01
REC-02
```

通过标准：

- 用户能编辑和确认记忆。
- 每条记忆能追溯来源。
- 新上下文能触发新增、重复、冲突或更新判断。

### Milestone 2：让行动有判断

目的：从模板行动升级为 Top 3 next moves。

Issues：

```text
ACT-01
ACT-02
ACT-03
ACT-04
```

通过标准：

- 每个行动都能解释 whyNow。
- 每个行动都有 evidence。
- 行动数量受控，不超过 Top 3。

### Milestone 3：让 Brief 真能交付

目的：Brief 成为真实工作产物。

Issues：

```text
BRF-01
BRF-02
BRF-03
BRF-04
BRF-05
```

通过标准：

- 客户、投资人、工程行动生成不同 Brief。
- Brief 可编辑。
- Brief 能直接交给队友执行或审核。

### Milestone 4：让结果回流改变公司认知

目的：执行结果能更新记忆和后续行动。

Issues：

```text
RES-01
RES-02
RES-03
RUN-01
RUN-02
```

通过标准：

- 结果能确认、更新或废弃记忆。
- 行动详情能看到执行历史。
- Agent 运行可追溯。

### Milestone 5：接入真实 AI

目的：从规则原型升级为真实语义判断。

Issues：

```text
AI-01
AI-02
AI-03
AI-04
AI-05
```

通过标准：

- AI 输出结构化 JSON。
- 输出通过 schema 校验。
- 失败有 fallback。
- 不引入聊天作为核心主线。

### Milestone 6：准备真实上线

目的：为云端、多人和真实测试准备。

Issues：

```text
STR-01
STR-02
后续新增 Supabase/Auth/Deployment issues
```

通过标准：

- 存储层已抽象。
- 可以替换为 Supabase/Postgres。
- 不需要重写 domain pipeline。

## 7. Issue 模板

后续每个 issue 应按这个结构写：

```text
标题：
[MEM-02] 支持编辑公司记忆

目标：
让用户能修正 AI 提取错误，提高记忆可信度。

涉及领域：
Company Memory

涉及模块：
src/domain/types.js
src/services/store.js
src/ui/render.js
src/main.js

功能说明：
用户可以编辑 memory title/type/content/status。

不做范围：
不做多人权限。
不做云端同步。
不接真实 AI。

验收标准：
1. 点击记忆可以进入编辑态。
2. 保存后状态更新。
3. 刷新页面后修改仍存在。
4. smoke test 通过。
```

## 8. Definition of Done

每个 issue 合并前必须满足：

- 不破坏现有闭环。
- `node scripts/smoke-test.mjs` 通过。
- 新数据结构有 demo 数据或 migration。
- UI 中能看见该功能的使用入口。
- 高风险外部动作仍然只生成草稿或人工确认项。
- 文档如有行为变化必须更新。

## 9. 暂不做的事情

v0.2 明确不做：

- Gmail 发送。
- Slack 自动发消息。
- GitHub 自动改代码或 merge。
- Notion 自动写入。
- Linear/Jira 自动创建任务。
- 复杂组织权限。
- 完整 billing。
- 聊天机器人主界面。
- Prompt 模板市场。

原因：

这些都是外部执行或渠道问题，不是 TeamMind 的核心价值。v0.2 的核心是让系统真正理解和更新公司上下文。

## 10. 成功标准

v0.2 成功不是“功能多”，而是一个真实早期团队愿意每周用它整理上下文。

定性标准：

- 用户愿意粘贴真实会议纪要和客户反馈。
- 用户愿意编辑和确认系统生成的记忆。
- 用户觉得 Top 3 action 比自己手动整理更清晰。
- Brief 能被队友直接拿去执行或改写。
- 结果回流后，用户能看到公司记忆真的变化。

量化标准：

- 每个项目至少录入 5 条真实上下文。
- 至少 50% AI 记忆被用户确认或编辑。
- 每个项目至少生成 3 个 Brief。
- 至少 30% 行动有结果回流。
- 用户愿意在下一周继续使用。

## 11. 对 AI 协作者的要求

AI 协作者修改本项目时必须遵守：

- 不要把 TeamMind 改成聊天产品。
- 不要优先做外部集成。
- 不要绕过人工确认。
- 不要让 UI 层承载业务推理。
- 不要让 store 层承载 Agent 判断。
- 不要新增不可追溯的 AI 输出。
- 每个改动必须对应一个 issue 编号。
- 每个 issue 都必须说明所属功能领域。
- 修改后必须运行 smoke test。

## 12. 当前最优先的下一步

建议立刻从 Milestone 1 开始：

```text
MEM-01 增加 memory status 和 sourceReferences
MEM-02 支持编辑公司记忆
CTX-03 建立上下文和记忆的来源引用
REC-01 拆出 extractMemories pipeline
REC-02 新增 reconcileMemories pipeline
```

原因：

TeamMind 的价值不是“生成更多内容”，而是“建立可信的公司记忆”。如果记忆不可信，行动和 Brief 都不会可信。
