# TeamMind 数据模型文档

版本：v0.2 目标模型  
状态：开发基准  
最后更新：2026-05-11

## 0. 文档目的

本文档定义 TeamMind v0.2 的核心数据对象。它是给队友和 AI 协作者看的“字段合同”。

阶段关系说明：

- v0.2 / memory foundation 的对象仍是当前运行代码的基准合同。
- Phase 3 Alpha 在本文档中新增 Source、Signal、Entity、ProjectNode、Commitment、Risk、Opportunity 等扩展合同。
- Wave 1 到 Wave 4 应按这些合同逐步落地，不要在代码里临时发明同义字段。
- 新字段或新对象正式进入代码前，必须先或同时更新本文档。

开发规则：

- 新增或修改字段时，必须同步更新本文档。
- 不要在不同文件里临时发明同义字段。
- AI 输出写入 state 前必须符合这里的结构。
- v0.2 可以继续用 localStorage，但数据结构要能迁移到数据库。

## 1. 核心关系

```text
Project
  has many Source
  has many Signal
  has many ContextItem
  has many MemoryItem
  has many Entity
  has many EntityRelation
  has many ProjectNode
  has many ActionItem
  has many Brief
  has many ActionResult
  has many Commitment
  has many Risk
  has many Opportunity

Source
  extracts many Signal
  may reference ContextItem for legacy compatibility

Signal
  may propose MemoryItem
  may propose ActionItem
  may link Entity and Project

ContextItem
  referenced by MemoryItem.sourceReferences

MemoryItem
  referenced by ActionItem.evidenceMemoryIds
  referenced by Brief.evidenceMemoryIds
  updated by ActionResult.relatedMemoryUpdates

ActionItem
  has many Brief
  has many ActionResult

AgentRun
  records pipeline execution
```

核心原则：

- `Source` 是 Phase 3 Alpha 的统一原始信息入口。
- `Signal` 是从 Source 中抽取出的有意义业务信号。
- `ContextItem` 是原始证据。
- `MemoryItem` 是公司认知。
- `Entity` 是客户、投资人、伙伴、成员、产品或市场等长期对象。
- `ProjectNode` 是项目推进中的阶段、节点或工作包。
- `ActionItem` 是下一步建议。
- `Brief` 是行动执行说明。
- `ActionResult` 是执行后的反馈。
- `Commitment`、`Risk`、`Opportunity` 是 Command Center 的关键输入。
- `AgentRun` 是系统如何得出结论的审计记录。

## 2. AppState

```text
AppState
  schemaVersion: number
  activeProjectId: string
  activeView?: string
  projects: Project[]
  agentRuns: AgentRun[]
```

字段说明：

- `schemaVersion`：当前本地数据结构版本。v0.2 起建议从 `2` 开始。
- `activeProjectId`：当前选中的项目。
- `activeView`：Phase 3 Alpha 可用于记录当前页面，例如 `workspace`、`inbox`、`entities`、`command_center`。
- `projects`：项目列表。
- `agentRuns`：pipeline 运行记录。也可以先放在 project 内，但长期建议顶层保存，方便跨项目审计。

迁移要求：

- 如果旧数据没有 `schemaVersion`，按 v0.1 处理。
- migration 不允许导致白屏。
- 老字段能保留就保留，不能保留时要有 fallback。

## 3. Project

```text
Project
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  sources?: Source[]
  signals?: Signal[]
  contexts: ContextItem[]
  memories: MemoryItem[]
  entities?: Entity[]
  entityRelations?: EntityRelation[]
  nodes?: ProjectNode[]
  actions: ActionItem[]
  briefs: Brief[]
  results: ActionResult[]
  commitments?: Commitment[]
  risks?: Risk[]
  opportunities?: Opportunity[]
  settings?: ProjectSettings
```

字段说明：

- `id`：稳定 ID，不使用数组下标。
- `name`：项目或团队名称。
- `description`：项目简介。
- `createdAt` / `updatedAt`：ISO 时间字符串。
- `sources`：Phase 3 Alpha 的统一原始信息入口。Wave 1 落地前可由 `contexts` 兼容承载。
- `signals`：从 source 中抽取出的业务信号。
- `contexts`：原始上下文。
- `memories`：结构化公司记忆。
- `entities`：长期业务对象画像。
- `entityRelations`：对象之间的关系。
- `nodes`：项目节点或阶段。
- `actions`：下一步行动。
- `briefs`：行动 Brief。
- `results`：结果回流。
- `commitments`：承诺、等待项和依赖项。
- `risks`：风险雷达输入。
- `opportunities`：机会雷达输入。
- `settings`：未来放团队偏好、AI provider、集成开关。

## 4. ContextItem

```text
ContextItem
  id: string
  kind: ContextKind
  title: string
  body: string
  occurredAt: string
  participants: string[]
  tags: string[]
  importance: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
```

`ContextKind` 建议值：

```text
meeting_note
customer_feedback
investor_question
engineering_update
founder_note
sales_note
support_note
other
```

字段说明：

- `kind`：上下文类型。
- `title`：短标题，便于列表扫描。
- `body`：原始文本，不要被 AI 改写覆盖。
- `occurredAt`：事情发生时间，可以和录入时间不同。
- `participants`：相关人，例如客户、投资人、队友。
- `tags`：可人工输入，用于筛选。
- `importance`：用户主观重要程度。

开发要求：

- `body` 必须保留原文。
- 记忆的来源引用应该指向 `ContextItem.id`。
- 删除 Context 前必须考虑关联 Memory。

## 5. SourceReference

```text
SourceReference
  contextId: string
  sourceId?: string
  signalId?: string
  quote: string
  note?: string
  confidence?: number
```

字段说明：

- `contextId`：来源上下文 ID。
- `sourceId`：Phase 3 Alpha Source ID。用于从 Inbox Signal 转成 Memory 时追溯原始 Source。
- `signalId`：Phase 3 Alpha Signal ID。用于记录该 Memory 是由哪条 Signal 转化而来。
- `quote`：原文片段，帮助用户验证 AI 判断。
- `note`：AI 或人工补充说明。
- `confidence`：这条引用支持该判断的强度，范围 `0-1`。

开发要求：

- v0.2 每条 AI 生成的 Memory 至少有一个 `sourceReferences`。
- `quote` 不需要很长，优先使用能证明判断的短片段。
- UI 应允许用户从引用跳回原始 Context。

## 6. MemoryItem

```text
MemoryItem
  id: string
  type: MemoryType
  title: string
  content: string
  confidence: number
  status: MemoryStatus
  sourceReferences: SourceReference[]
  createdBy: "ai" | "human"
  createdAt: string
  updatedAt: string
  lastVerifiedAt?: string
```

`MemoryType` 建议值：

```text
customer_concern
investor_question
product_decision
engineering_blocker
team_constraint
risk
opportunity
fact
result_learning
```

`MemoryStatus`：

```text
draft
confirmed
outdated
disputed
archived
```

状态含义：

- `draft`：AI 新生成，尚未人工确认。
- `confirmed`：人工确认可信，可优先参与行动规划。
- `outdated`：曾经正确，但已被新信息取代。
- `disputed`：存在冲突，暂不应作为强依据。
- `archived`：不再参与行动规划，但保留历史。

状态流转建议：

```text
draft -> confirmed
draft -> disputed
draft -> archived
confirmed -> outdated
confirmed -> disputed
confirmed -> archived
disputed -> confirmed
disputed -> archived
outdated -> archived
```

开发要求：

- 新 AI memory 默认 `draft`。
- 人工创建 memory 可以默认 `confirmed`。
- `confirmed` 记忆在 `planActions` 中权重更高。
- `outdated` 和 `archived` 默认不参与新行动规划。
- `disputed` 可以展示，但不作为强行动证据。

## 7. ReconciliationResult

```text
ReconciliationResult
  id: string
  candidateMemoryId: string
  existingMemoryId?: string
  operation: "new" | "duplicate" | "update" | "conflict" | "outdate"
  reason: string
  suggestedMemory?: MemoryItem
  requiresHumanReview: boolean
  createdAt: string
```

字段说明：

- `candidateMemoryId`：本次提取出的候选记忆。
- `existingMemoryId`：被比较的旧记忆。
- `operation`：系统建议如何处理。
- `reason`：为什么这么判断。
- `suggestedMemory`：如果是 update，可提供建议版本。
- `requiresHumanReview`：冲突和高影响更新必须为 true。

开发要求：

- `duplicate` 不应重复写入新 memory。
- `conflict` 不应自动覆盖旧 memory。
- `outdate` 可以建议旧 memory 变为 `outdated`，但最好让用户确认。

## 8. ActionItem

```text
ActionItem
  id: string
  type: ActionType
  title: string
  whyNow: string
  evidenceMemoryIds: string[]
  priority: "low" | "medium" | "high"
  riskLevel: "low" | "medium" | "high"
  expectedArtifact: string
  ownerSuggestion?: string
  deadlineSuggestion?: string
  blockedBy: string[]
  humanConfirmationChecklist: string[]
  status: ActionStatus
  createdAt: string
  updatedAt: string
```

`ActionType` 建议值：

```text
customer_followup
investor_reply
coding_brief
product_decision
research_task
sales_prep
team_alignment
```

`ActionStatus`：

```text
pending
briefed
in_progress
done
archived
```

状态含义：

- `pending`：刚生成，尚未处理。
- `briefed`：已生成 Brief。
- `in_progress`：团队正在执行。
- `done`：已回流结果。
- `archived`：不再处理。

开发要求：

- v0.2 行动规划每次最多输出 Top 3。
- 每个行动必须有 `whyNow`。
- 每个行动必须有至少一个 `evidenceMemoryIds`，除非是人工创建。
- 高风险 action 必须有 `humanConfirmationChecklist`。

## 9. Brief

```text
Brief
  id: string
  actionId: string
  type: ActionType
  title: string
  sections: BriefSections
  evidenceMemoryIds: string[]
  sourceContextIds: string[]
  createdBy: "ai" | "human"
  createdAt: string
  updatedAt: string
  editedAt?: string
```

`BriefSections` 根据 action type 不同而不同。

### customer_followup

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

### investor_reply

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

### coding_brief

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

通用要求：

- Brief 是草稿，不是自动执行。
- Brief 必须能被人工编辑。
- Brief 必须能追溯证据记忆。
- 高风险内容必须有不要承诺或人工确认项。

## 10. ActionResult

```text
ActionResult
  id: string
  actionId: string
  outcome: "positive" | "neutral" | "negative" | "blocked"
  summary: string
  whatChanged: string
  newEvidence: string
  followUpNeeded: boolean
  relatedMemoryUpdates: RelatedMemoryUpdate[]
  createdAt: string
```

```text
RelatedMemoryUpdate
  memoryId: string
  operation: "confirm" | "update" | "dispute" | "outdate" | "archive"
  reason: string
  suggestedContent?: string
```

开发要求：

- 结果回流必须能改变行动状态。
- 结果回流应触发 `processResult`。
- 如果结果改变旧判断，应产生 memory update 建议。
- 当前本地实现会把结果摘要同步为一个 `ContextItem`，供结果生成的 memory 通过 `sourceReferences` 回溯原文。
- 不要只把结果作为一段文本保存后结束。

## 11. AgentRun

```text
AgentRun
  id: string
  projectId: string
  runType: "extract" | "reconcile" | "plan" | "compose" | "process_result"
  inputSummary: string
  outputSummary: string
  provider: "local_rules" | "mock" | "openai"
  model?: string
  status: "success" | "failed"
  error?: string
  createdAt: string
```

开发要求：

- 每次 pipeline 运行都应记录 AgentRun。
- 本地规则引擎 provider 用 `local_rules`。
- 未来 AI 失败时应记录 failed run，并 fallback。

## 12. 数据写入安全规则

任何 pipeline 输出写入 state 前必须满足：

- 有稳定 ID。
- 有创建时间。
- 符合对应 schema。
- AI 生成内容有来源或运行记录。
- 高风险 action/brief 有人工确认清单。
- 不覆盖原始 Context。
- 不自动删除旧 Memory。

## 13. Phase 3 Alpha 扩展对象合同

本节定义 Phase 3 Alpha 的核心扩展对象。Wave 1 到 Wave 4 应优先消费这里的字段合同；如果实现时需要新增字段，必须同步更新本节，而不是在代码里临时发明同义字段。

### 13.1 EvidenceLink

```text
EvidenceLink
  sourceId?: string
  contextId?: string
  signalId?: string
  memoryId?: string
  quote?: string
  note?: string
  confidence?: number
```

字段说明：

- `sourceId`：指向 Phase 3 Alpha 的统一 Source。
- `contextId`：兼容当前 `ContextItem` 的来源引用。
- `signalId`：指向抽取出的业务信号。
- `memoryId`：指向已沉淀的公司记忆。
- `quote`：能支撑判断的短原文片段。
- `note`：AI 或人工补充说明。
- `confidence`：证据支持强度，范围 `0-1`。

开发要求：

- 新对象需要证据时优先使用 `EvidenceLink[]`。
- 兼容现有 `SourceReference`，不要强行一次性迁移旧数据。
- `quote` 保持短而可验证，不要复制整篇原文。

### 13.2 Source

```text
Source
  id: string
  kind: SourceKind
  title: string
  body: string
  origin: "manual" | "imported" | "integration" | "result"
  externalRef?: string
  occurredAt: string
  receivedAt: string
  participants: string[]
  relatedEntityIds: string[]
  relatedProjectIds: string[]
  tags: string[]
  importance: "low" | "medium" | "high"
  status: "new" | "processed" | "ignored" | "archived"
  createdAt: string
  updatedAt: string
```

`SourceKind` 建议值：

```text
email
slack_message
meeting_note
customer_feedback
investor_question
engineering_update
founder_note
sales_note
support_note
document
web_note
manual_note
result_feedback
other
```

字段说明：

- `kind`：原始信息类型。
- `body`：原文，不要被 AI 改写覆盖。
- `origin`：信息如何进入系统。Alpha 先支持 `manual` 和 `result`。
- `externalRef`：未来外部系统链接或 ID；早期可以为空。
- `status`：Inbox review 的处理状态。

开发要求：

- Wave 1 前，现有 `ContextItem` 可继续作为 Source 的兼容实现。
- 任何自动外部导入都必须只读，且不自动执行外部动作。
- 删除 Source 前必须处理其 Signal、Memory、Action、Brief、Result 引用。

### 13.3 Signal

```text
Signal
  id: string
  sourceId: string
  type: SignalType
  title: string
  summary: string
  quote?: string
  confidence: number
  suggestedEntityIds: string[]
  suggestedProjectIds: string[]
  suggestedMemory?: Partial<MemoryItem>
  suggestedAction?: Partial<ActionItem>
  status: "new" | "confirmed" | "ignored" | "converted"
  createdBy: "ai" | "human"
  createdAt: string
  updatedAt: string
```

`SignalType` 建议值：

```text
customer_need
investor_question
product_feedback
engineering_blocker
team_constraint
risk
opportunity
commitment
decision
fact
```

开发要求：

- Signal 是 Source 到 Memory / Action / Entity / Project 的中间层。
- Signal 不一定都变成 Memory，低价值信息可以忽略或归档。
- `suggestedMemory` 和 `suggestedAction` 是草稿建议，必须由后续流程确认后再写入正式对象。

### 13.4 Entity

```text
Entity
  id: string
  type: EntityType
  name: string
  role?: string
  organization?: string
  description?: string
  status: "active" | "inactive" | "watching" | "archived"
  relationshipStage?: string
  ownerSuggestion?: string
  tags: string[]
  sourceIds: string[]
  signalIds: string[]
  memoryIds: string[]
  projectIds: string[]
  lastInteractionAt?: string
  nextSuggestedActionId?: string
  createdAt: string
  updatedAt: string
```

`EntityType` 建议值：

```text
person
company
customer
investor
partner
vendor
team_member
product
market
competitor
```

开发要求：

- Entity Profile 用于长期业务对象画像，不是简单标签。
- 轻量 detail 可以先挂在 Entity 上，重要信息再提升为 Memory。
- Entity 与 Project / Memory / Action 的关联必须可追溯。
- Wave 2 起代码优先消费 `sourceIds`、`signalIds`、`memoryIds`、`projectIds`；为兼容 Wave 1 本地数据，store 会同步保留 `relatedSourceIds`、`relatedSignalIds`、`relatedMemoryIds`、`relatedProjectIds`。

### 13.5 EntityRelation

```text
EntityRelation
  id: string
  fromEntityId: string
  toEntityId: string
  type: "works_at" | "decision_maker_for" | "influences" | "introduced_by" | "competitor_of" | "partner_of" | "related_to"
  strength: "low" | "medium" | "high"
  evidenceLinks: EvidenceLink[]
  createdAt: string
  updatedAt: string
```

开发要求：

- 关系图第一阶段可以不做复杂可视化，但数据结构要稳定。
- 关系必须能追溯到 Source、Signal 或 Memory。

### 13.6 ProjectNode

```text
ProjectNode
  id: string
  projectId: string
  title: string
  goal: string
  status: "planned" | "active" | "blocked" | "done" | "archived"
  ownerSuggestion?: string
  dueAt?: string
  successCriteria: string[]
  inputContextIds: string[]
  sourceIds: string[]
  signalIds: string[]
  memoryIds: string[]
  actionIds: string[]
  waitingIds: string[]
  riskIds: string[]
  resultIds: string[]
  createdAt: string
  updatedAt: string
```

开发要求：

- 小项目可以只有一个默认 node。
- AI 可以建议拆分 node，但必须保留人工确认入口。
- Node 不替代 Project；它是 Project 下的推进单元。

### 13.7 Commitment

```text
Commitment
  id: string
  projectId?: string
  nodeId?: string
  type: "commitment" | "waiting" | "dependency" | "follow_up"
  title: string
  who: string
  toWhom?: string
  dueAt?: string
  status: "open" | "waiting" | "blocked" | "done" | "overdue" | "archived"
  evidenceLinks: EvidenceLink[]
  createdAt: string
  updatedAt: string
```

开发要求：

- Commitment 是 Command Center 的关键输入。
- 逾期判断可以先本地规则实现。
- 不自动代表用户发送催办或承诺内容。

### 13.8 Risk

```text
Risk
  id: string
  projectId?: string
  nodeId?: string
  entityIds: string[]
  title: string
  description: string
  severity: "low" | "medium" | "high"
  likelihood: "low" | "medium" | "high"
  status: "open" | "monitoring" | "mitigated" | "archived"
  evidenceLinks: EvidenceLink[]
  suggestedActionIds: string[]
  createdAt: string
  updatedAt: string
```

开发要求：

- Risk 必须能追溯证据。
- Risk 可以生成 action 建议，但高风险 action 仍然只是草稿和人工确认项。

### 13.9 Opportunity

```text
Opportunity
  id: string
  projectId?: string
  nodeId?: string
  entityIds: string[]
  title: string
  description: string
  potentialImpact: "low" | "medium" | "high"
  confidence: number
  status: "new" | "evaluating" | "pursuing" | "won" | "lost" | "archived"
  evidenceLinks: EvidenceLink[]
  suggestedActionIds: string[]
  createdAt: string
  updatedAt: string
```

开发要求：

- Opportunity 不是销售承诺，只是机会判断。
- 多个 Source / Signal 指向同一需求时，应优先合并为一个可追溯机会。

## 14. 当前与目标模型的差异

当前 v0.1 到 v0.2 过渡代码已经有：

- Project。
- ProjectNode，包括默认单节点、节点状态和关联 Source / Signal / Memory / Action / Result ID。
- Context。
- Memory。
- Memory status 基础字段和默认值。
- 上下文输入、结果回流与 demo memory 的基础 `sourceReferences`。
- Action，包括新生成 action 和 demo action 的 `whyNow`、`evidenceMemoryIds`、`expectedArtifact` 兼容字段。
- Brief，包括新生成 brief 的 `type`、`evidenceMemoryIds`、`sourceContextIds`、`createdBy`、`updatedAt`。
- Result，包括 `whatChanged`、`newEvidence`、`followUpNeeded`、`relatedMemoryUpdates`。

但还缺少：

- `schemaVersion`。
- sourceReferences 的详情查看、跳转和跨对象来源建模。
- memory status 的人工确认、编辑和状态流转。
- scenario-specific Brief sections。
- AgentRun。
- repository abstraction。

Phase 3 Alpha 合同已经定义但尚未完整落地：

- Source / Signal 统一 Inbox 数据层。
- Entity / EntityRelation 长期对象画像。
- Commitment / Risk / Opportunity 的 Command Center 输入。
- EvidenceLink 对 Source、Signal、Memory、Context 的统一证据引用。

后续 issue 应逐步补齐，而不是一次性大重写。

