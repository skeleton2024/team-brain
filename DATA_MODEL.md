# TeamMind 数据模型文档

版本：v0.2 目标模型  
状态：开发基准  
最后更新：2026-05-11

## 0. 文档目的

本文档定义 TeamMind v0.2 的核心数据对象。它是给队友和 AI 协作者看的“字段合同”。

阶段关系说明：

- 当前内容仍是 v0.2 / memory foundation 的基准合同。
- Phase 3 Alpha 会在 `ARCH-00-core-domain-contract` 中扩展 Source、Signal、Entity、ProjectNode、Commitment、Risk、Opportunity 等对象。
- 新字段或新对象正式进入代码前，必须先或同时更新本文档。

开发规则：

- 新增或修改字段时，必须同步更新本文档。
- 不要在不同文件里临时发明同义字段。
- AI 输出写入 state 前必须符合这里的结构。
- v0.2 可以继续用 localStorage，但数据结构要能迁移到数据库。

## 1. 核心关系

```text
Project
  has many ContextItem
  has many MemoryItem
  has many ActionItem
  has many Brief
  has many ActionResult

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

- `ContextItem` 是原始证据。
- `MemoryItem` 是公司认知。
- `ActionItem` 是下一步建议。
- `Brief` 是行动执行说明。
- `ActionResult` 是执行后的反馈。
- `AgentRun` 是系统如何得出结论的审计记录。

## 2. AppState

```text
AppState
  schemaVersion: number
  activeProjectId: string
  projects: Project[]
  agentRuns: AgentRun[]
```

字段说明：

- `schemaVersion`：当前本地数据结构版本。v0.2 起建议从 `2` 开始。
- `activeProjectId`：当前选中的项目。
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
  contexts: ContextItem[]
  memories: MemoryItem[]
  actions: ActionItem[]
  briefs: Brief[]
  results: ActionResult[]
  settings?: ProjectSettings
```

字段说明：

- `id`：稳定 ID，不使用数组下标。
- `name`：项目或团队名称。
- `description`：项目简介。
- `createdAt` / `updatedAt`：ISO 时间字符串。
- `contexts`：原始上下文。
- `memories`：结构化公司记忆。
- `actions`：下一步行动。
- `briefs`：行动 Brief。
- `results`：结果回流。
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
  quote: string
  note?: string
  confidence?: number
```

字段说明：

- `contextId`：来源上下文 ID。
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

## 13. 当前与目标模型的差异

当前 v0.1 到 v0.2 过渡代码已经有：

- Project。
- Context。
- Memory。
- Memory status 基础字段和默认值。
- 上下文输入、结果回流与 demo memory 的基础 `sourceReferences`。
- Action。
- Brief。
- Result。

但还缺少：

- `schemaVersion`。
- sourceReferences 的详情查看、跳转和跨对象来源建模。
- memory status 的人工确认、编辑和状态流转。
- action `whyNow` 和 `evidenceMemoryIds`。
- scenario-specific Brief sections。
- result `whatChanged` / `newEvidence` / `relatedMemoryUpdates`。
- AgentRun。
- repository abstraction。

后续 issue 应逐步补齐，而不是一次性大重写。

