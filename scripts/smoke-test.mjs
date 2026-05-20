import { DEMO_PROJECT } from "../src/data/demo.js";
import {
  addManualSource,
  absorbContext,
  generateBrief,
  processSource,
  recordActionResult,
  reviewSignal,
  suggestSignalLinks,
  updateEntityStatus,
  updateMemoryStatus,
  updateProjectNodeStatus
} from "../src/domain/agentEngine.js";
import { extractMemories } from "../src/domain/pipelines/extractMemories.js";
import { extractSignals } from "../src/domain/pipelines/extractSignals.js";
import { reconcileMemories } from "../src/domain/pipelines/reconcileMemories.js";
import { makeProject, updateMemory } from "../src/services/store.js";
import { renderApp } from "../src/ui/render.js";

let project = structuredClone(DEMO_PROJECT);

const demoMemoriesMissingSources = project.memories.filter(
  (memory) => !hasUsableSourceReference(memory)
);
if (demoMemoriesMissingSources.length) {
  throw new Error(
    `Expected demo memories to include source references: ${demoMemoriesMissingSources
      .map((memory) => memory.id)
      .join(", ")}`
  );
}

const freshProject = makeProject("Smoke Project");
if (
  !Array.isArray(freshProject.nodes) ||
  freshProject.nodes.length !== 1 ||
  freshProject.nodes[0].status !== "active" ||
  freshProject.nodes[0].projectId !== freshProject.id
) {
  throw new Error(`Expected new projects to include one default active node: ${JSON.stringify(freshProject)}`);
}

project = absorbContext(project, {
  kind: "customer",
  title: "测试客户访谈",
  occurredAt: "2026-05-12",
  participants: ["客户 A", "销售负责人"],
  tags: ["试点", "权限"],
  importance: "high",
  body:
    "客户愿意试点，但担心数据权限和删除机制。投资人问 ARR 和市场壁垒。工程上 GitHub 集成还没做，本周人手紧张。"
});

const newestContext = project.contexts[0];
const memoryCountBeforePipelineProbe = project.memories.length;
const pipelineProbe = extractMemories({
  project,
  context: newestContext,
  now: "2026-05-13T00:00:00.000Z"
});

if (
  !Array.isArray(pipelineProbe.memories) ||
  pipelineProbe.memories.length < 1 ||
  typeof pipelineProbe.runSummary !== "string" ||
  !pipelineProbe.runSummary.includes("候选记忆") ||
  pipelineProbe.memories.some(
    (memory) =>
      memory.createdAt !== "2026-05-13T00:00:00.000Z" ||
      memory.status !== "draft" ||
      !Array.isArray(memory.sourceReferences) ||
      memory.sourceReferences[0]?.contextId !== newestContext.id
  ) ||
  project.memories.length !== memoryCountBeforePipelineProbe
) {
  throw new Error(`extractMemories pipeline contract failed: ${JSON.stringify(pipelineProbe)}`);
}

const sourceProbe = {
  id: "src-smoke-1",
  kind: "customer_feedback",
  title: "客户预算和权限反馈",
  body: "客户愿意下周试点，但担心预算审批和敏感数据权限。工程上 Slack 导入还没做，本周只能手动粘贴。",
  origin: "manual",
  occurredAt: "2026-05-13",
  receivedAt: "2026-05-13T00:00:00.000Z",
  participants: ["客户 A", "销售负责人"],
  relatedEntityIds: [],
  relatedProjectIds: [project.id],
  tags: ["试点", "预算"],
  importance: "high",
  status: "new",
  createdAt: "2026-05-13T00:00:00.000Z",
  updatedAt: "2026-05-13T00:00:00.000Z"
};
const signalProbe = extractSignals({
  project,
  source: sourceProbe,
  now: "2026-05-13T00:00:00.000Z"
});

if (
  !Array.isArray(signalProbe.signals) ||
  signalProbe.signals.length < 1 ||
  typeof signalProbe.runSummary !== "string" ||
  !signalProbe.runSummary.includes("Signal") ||
  signalProbe.signals.some(
    (signal) =>
      signal.sourceId !== sourceProbe.id ||
      signal.status !== "new" ||
      signal.createdBy !== "ai" ||
      signal.createdAt !== "2026-05-13T00:00:00.000Z" ||
      !signal.summary ||
      !signal.quote ||
      typeof signal.confidence !== "number" ||
      !Array.isArray(signal.suggestedProjectIds) ||
      !signal.suggestedMemory
  )
) {
  throw new Error(`extractSignals pipeline contract failed: ${JSON.stringify(signalProbe)}`);
}

let linkProbeProject = {
  ...structuredClone(DEMO_PROJECT),
  sources: [sourceProbe],
  signals: signalProbe.signals,
  entities: [],
  entityRelations: []
};
linkProbeProject = suggestSignalLinks(linkProbeProject, signalProbe.signals[0].id);
const linkedSignal = linkProbeProject.signals.find((signal) => signal.id === signalProbe.signals[0].id);
const linkedSource = linkProbeProject.sources.find((source) => source.id === sourceProbe.id);

if (
  linkProbeProject.entities.length < 1 ||
  !linkedSignal?.suggestedEntityIds?.length ||
  !linkedSignal?.suggestedProjectIds?.includes(linkProbeProject.id) ||
  !linkedSource?.relatedEntityIds?.length ||
  linkProbeProject.entities.some(
    (entity) =>
      entity.status !== "watching" ||
      !entity.relatedSourceIds.includes(sourceProbe.id) ||
      !entity.sourceIds.includes(sourceProbe.id) ||
      !entity.relatedSignalIds.includes(linkedSignal.id) ||
      !entity.signalIds.includes(linkedSignal.id) ||
      !entity.relatedProjectIds.includes(linkProbeProject.id) ||
      !entity.projectIds.includes(linkProbeProject.id)
  )
) {
  throw new Error(`Signal link suggestion failed: ${JSON.stringify(linkProbeProject)}`);
}

let existingEntityLinkProject = {
  ...structuredClone(DEMO_PROJECT),
  sources: [sourceProbe],
  signals: signalProbe.signals,
  entities: [
    {
      id: "ent-existing-customer-a",
      type: "customer",
      name: "客户 A",
      status: "watching",
      tags: [],
      sourceIds: [],
      signalIds: [],
      memoryIds: [],
      projectIds: [],
      relatedSourceIds: [],
      relatedSignalIds: [],
      relatedMemoryIds: [],
      relatedProjectIds: [],
      createdAt: "2026-05-13T00:00:00.000Z",
      updatedAt: "2026-05-13T00:00:00.000Z"
    }
  ],
  entityRelations: []
};
existingEntityLinkProject = suggestSignalLinks(existingEntityLinkProject, signalProbe.signals[0].id);
const existingLinkedEntity = existingEntityLinkProject.entities.find(
  (entity) => entity.id === "ent-existing-customer-a"
);
if (
  !existingLinkedEntity?.sourceIds.includes(sourceProbe.id) ||
  !existingLinkedEntity?.signalIds.includes(signalProbe.signals[0].id) ||
  !existingLinkedEntity?.projectIds.includes(existingEntityLinkProject.id)
) {
  throw new Error(`Expected existing Entity to receive Source / Signal / Project links: ${JSON.stringify(existingEntityLinkProject)}`);
}

const reviewSignalId = linkedSignal.id;
let confirmedSignalProject = reviewSignal(linkProbeProject, reviewSignalId, "confirm");
if (confirmedSignalProject.signals.find((signal) => signal.id === reviewSignalId)?.status !== "confirmed") {
  throw new Error("Expected Signal review confirm to mark signal confirmed.");
}

let convertedMemoryProject = reviewSignal(linkProbeProject, reviewSignalId, "memory");
const convertedMemory = convertedMemoryProject.memories[0];
const convertedMemoryEntity = convertedMemoryProject.entities.find((entity) =>
  entity.memoryIds?.includes(convertedMemory.id)
);
if (
  convertedMemoryProject.signals.find((signal) => signal.id === reviewSignalId)?.status !== "converted" ||
  convertedMemory.status !== "draft" ||
  convertedMemory.createdBy !== "ai" ||
  convertedMemory.sourceReferences[0]?.sourceId !== sourceProbe.id ||
  convertedMemory.sourceReferences[0]?.signalId !== reviewSignalId ||
  !convertedMemoryEntity
) {
  throw new Error(`Expected Signal to convert into traceable draft memory: ${JSON.stringify(convertedMemoryProject)}`);
}

let convertedActionProject = reviewSignal(linkProbeProject, reviewSignalId, "action");
const convertedAction = convertedActionProject.actions[0];
const convertedActionEntity = convertedActionProject.entities.find(
  (entity) => entity.nextSuggestedActionId === convertedAction.id
);
if (
  convertedActionProject.signals.find((signal) => signal.id === reviewSignalId)?.status !== "converted" ||
  !convertedAction ||
  convertedAction.status !== "pending" ||
  !convertedAction.requiresHumanConfirmation ||
  !Array.isArray(convertedAction.evidenceMemoryIds) ||
  convertedAction.evidenceMemoryIds[0] !== convertedActionProject.memories[0].id ||
  !convertedActionEntity?.memoryIds.includes(convertedActionProject.memories[0].id)
) {
  throw new Error(`Expected Signal to convert into evidence-backed action: ${JSON.stringify(convertedActionProject)}`);
}

let inboxFlowProject = {
  ...structuredClone(DEMO_PROJECT),
  sources: [],
  signals: [],
  entities: [],
  entityRelations: [],
  contexts: [],
  memories: [],
  actions: [],
  briefs: [],
  results: [],
  reconciliationResults: [],
  pendingMemoryUpdates: []
};
inboxFlowProject = addManualSource(inboxFlowProject, {
  kind: "meeting_note",
  title: "Wave 1 Inbox smoke",
  body:
    "客户 A 愿意下周试点，但担心预算审批和敏感数据权限。投资人 B 追问市场壁垒和 ARR 证据。工程确认 Slack API 暂不接入，本周只做手动录入闭环。",
  occurredAt: "2026-05-14",
  externalRef: "手动会议纪要",
  participants: ["客户 A", "投资人 B", "工程负责人"],
  tags: ["inbox", "smoke"],
  importance: "high"
});
const inboxSource = inboxFlowProject.sources[0];
if (
  !inboxSource ||
  inboxSource.status !== "new" ||
  inboxSource.origin !== "manual" ||
  inboxSource.body.includes("自动发送")
) {
  throw new Error(`Manual Source inbox flow failed at source creation: ${JSON.stringify(inboxFlowProject)}`);
}

inboxFlowProject = processSource(inboxFlowProject, inboxSource.id);
if (
  inboxFlowProject.sources[0].status !== "processed" ||
  inboxFlowProject.signals.length < 2 ||
  inboxFlowProject.signals.some((signal) => signal.sourceId !== inboxSource.id)
) {
  throw new Error(`Manual Source inbox flow failed at signal extraction: ${JSON.stringify(inboxFlowProject)}`);
}

const inboxSignalForMemory = inboxFlowProject.signals[0];
inboxFlowProject = suggestSignalLinks(inboxFlowProject, inboxSignalForMemory.id);
if (
  inboxFlowProject.entities.length < 1 ||
  !inboxFlowProject.signals.find((signal) => signal.id === inboxSignalForMemory.id)?.suggestedEntityIds.length
) {
  throw new Error(`Manual Source inbox flow failed at link suggestion: ${JSON.stringify(inboxFlowProject)}`);
}

inboxFlowProject = reviewSignal(inboxFlowProject, inboxSignalForMemory.id, "memory");
const inboxMemory = inboxFlowProject.memories[0];
if (
  !inboxMemory ||
  inboxMemory.status !== "draft" ||
  inboxMemory.sourceReferences[0]?.sourceId !== inboxSource.id ||
  inboxFlowProject.signals.find((signal) => signal.id === inboxSignalForMemory.id)?.status !== "converted"
) {
  throw new Error(`Manual Source inbox flow failed at memory conversion: ${JSON.stringify(inboxFlowProject)}`);
}

const inboxSignalForAction = inboxFlowProject.signals.find((signal) => signal.status === "new");
inboxFlowProject = reviewSignal(inboxFlowProject, inboxSignalForAction.id, "action");
const inboxAction = inboxFlowProject.actions[0];
if (
  !inboxAction ||
  inboxAction.status !== "pending" ||
  !inboxAction.evidenceMemoryIds.includes(inboxFlowProject.memories[0].id) ||
  !inboxAction.requiresHumanConfirmation
) {
  throw new Error(`Manual Source inbox flow failed at action conversion: ${JSON.stringify(inboxFlowProject)}`);
}

const inboxFlowHtml = renderApp({
  activeProjectId: inboxFlowProject.id,
  selectedActionId: inboxAction.id,
  projects: [inboxFlowProject]
});
if (
  !inboxFlowHtml.includes('data-form="manual-source"') ||
  !inboxFlowHtml.includes('data-action="process-source"') ||
  !inboxFlowHtml.includes('data-action="suggest-signal-links"') ||
  !inboxFlowHtml.includes('data-signal-review="memory"') ||
  !inboxFlowHtml.includes("Company Inbox")
) {
  throw new Error("Expected Inbox review flow controls to render in smoke HTML.");
}

const entityProfileHtml = renderApp({
  activeProjectId: DEMO_PROJECT.id,
  selectedEntityId: "ent-demo-customer-team",
  selectedActionId: null,
  projects: [DEMO_PROJECT]
});
if (
  !entityProfileHtml.includes("Entity Profile") ||
  !entityProfileHtml.includes("业务对象画像") ||
  !entityProfileHtml.includes("客户访谈小组") ||
  !entityProfileHtml.includes("关联证据") ||
  !entityProfileHtml.includes('data-entity-open-id="ent-demo-customer-team"') ||
  !entityProfileHtml.includes('data-action="update-entity-status"') ||
  !entityProfileHtml.includes("准备付费意向客户 follow-up 草稿")
) {
  throw new Error("Expected Entity Profile list and detail to render in smoke HTML.");
}

let entityStatusProject = structuredClone(DEMO_PROJECT);
entityStatusProject = updateEntityStatus(entityStatusProject, "ent-demo-customer-team", "active");
if (
  entityStatusProject.entities.find((entity) => entity.id === "ent-demo-customer-team")?.status !== "active" ||
  !entityStatusProject.entities.find((entity) => entity.id === "ent-demo-customer-team")?.updatedAt
) {
  throw new Error("Expected Entity status governance action to update the profile locally.");
}

const projectNodeHtml = renderApp({
  activeProjectId: DEMO_PROJECT.id,
  selectedNodeId: "node-demo-customer-discovery",
  selectedActionId: null,
  projects: [DEMO_PROJECT]
});
if (
  !projectNodeHtml.includes("Project Nodes") ||
  !projectNodeHtml.includes("Node Detail") ||
  !projectNodeHtml.includes("项目推进节点") ||
  !projectNodeHtml.includes("客户试点与权限边界确认") ||
  !projectNodeHtml.includes("节点目标") ||
  !projectNodeHtml.includes("输入上下文") ||
  !projectNodeHtml.includes('data-action="update-project-node-status"') ||
  !projectNodeHtml.includes('data-action="open-node-detail"') ||
  !projectNodeHtml.includes('data-action-id="act-demo-customer"') ||
  !projectNodeHtml.includes("Memory 2")
) {
  throw new Error("Expected Project Nodes list, detail panel, and status controls to render in smoke HTML.");
}

let nodeStatusProject = structuredClone(DEMO_PROJECT);
nodeStatusProject = updateProjectNodeStatus(
  nodeStatusProject,
  "node-demo-customer-discovery",
  "blocked"
);
if (
  nodeStatusProject.nodes.find((node) => node.id === "node-demo-customer-discovery")?.status !==
  "blocked"
) {
  throw new Error("Expected Project Node status governance action to update locally.");
}

let qaFlowProject = makeProject("QA Entity Project Flow");
qaFlowProject = addManualSource(qaFlowProject, {
  kind: "customer_feedback",
  title: "QA 客户试点反馈",
  body:
    "客户 QA 愿意下周试点，但担心权限边界和预算审批。工程负责人确认本周只做手动录入和节点闭环，不接 Slack API。",
  occurredAt: "2026-05-15",
  participants: ["客户 QA", "工程负责人"],
  tags: ["qa", "entity", "node"],
  importance: "high"
});
const qaSource = qaFlowProject.sources[0];
const qaDefaultNodeId = qaFlowProject.nodes[0].id;
if (!qaFlowProject.nodes[0].sourceIds.includes(qaSource.id)) {
  throw new Error("Expected manual Source to attach to the default Project Node.");
}

qaFlowProject = processSource(qaFlowProject, qaSource.id);
const qaSignals = qaFlowProject.signals;
if (
  qaSignals.length < 2 ||
  !qaFlowProject.nodes.find((node) => node.id === qaDefaultNodeId)?.signalIds.includes(qaSignals[0].id)
) {
  throw new Error("Expected extracted Signals to attach to the default Project Node.");
}

qaFlowProject = suggestSignalLinks(qaFlowProject, qaSignals[0].id);
qaFlowProject = suggestSignalLinks(qaFlowProject, qaSignals[1].id);
const qaEntity = qaFlowProject.entities.find((entity) => entity.name === "客户 QA");
if (!qaEntity?.sourceIds.includes(qaSource.id) || !qaEntity.signalIds.includes(qaSignals[0].id)) {
  throw new Error("Expected QA Entity to receive Source and Signal links.");
}

qaFlowProject = reviewSignal(qaFlowProject, qaSignals[0].id, "memory");
const qaMemory = qaFlowProject.memories[0];
const qaEntityAfterMemory = qaFlowProject.entities.find((entity) => entity.id === qaEntity.id);
const qaNodeAfterMemory = qaFlowProject.nodes.find((node) => node.id === qaDefaultNodeId);
if (
  !qaEntityAfterMemory.memoryIds.includes(qaMemory.id) ||
  !qaNodeAfterMemory.memoryIds.includes(qaMemory.id)
) {
  throw new Error("Expected Signal -> Memory conversion to update Entity and Project Node links.");
}

qaFlowProject = reviewSignal(qaFlowProject, qaSignals[1].id, "action");
const qaAction = qaFlowProject.actions[0];
const qaEntityAfterAction = qaFlowProject.entities.find((entity) => entity.id === qaEntity.id);
const qaNodeAfterAction = qaFlowProject.nodes.find((node) => node.id === qaDefaultNodeId);
if (
  !qaAction ||
  qaEntityAfterAction.nextSuggestedActionId !== qaAction.id ||
  !qaNodeAfterAction.actionIds.includes(qaAction.id)
) {
  throw new Error("Expected Signal -> Action conversion to update Entity next action and Project Node action links.");
}

qaFlowProject = recordActionResult(qaFlowProject, qaAction.id, {
  outcome: "positive",
  summary: "客户 QA 同意继续试点，但要求权限边界先确认。"
});
const qaResult = qaFlowProject.results[0];
const qaNodeAfterResult = qaFlowProject.nodes.find((node) => node.id === qaDefaultNodeId);
if (!qaNodeAfterResult.resultIds.includes(qaResult.id)) {
  throw new Error("Expected Action Result to attach back to the Project Node.");
}

const qaFlowHtml = renderApp({
  activeProjectId: qaFlowProject.id,
  selectedEntityId: qaEntity.id,
  selectedNodeId: qaDefaultNodeId,
  selectedActionId: qaAction.id,
  projects: [qaFlowProject]
});
if (
  !qaFlowHtml.includes("QA Entity Project Flow") ||
  !qaFlowHtml.includes("客户 QA") ||
  !qaFlowHtml.includes("Node Detail") ||
  !qaFlowHtml.includes("Entity Profile") ||
  !qaFlowHtml.includes("客户 QA 同意继续试点")
) {
  throw new Error("Expected QA entity/project flow to render linked Entity and Node details.");
}

const priceConcernMemory = {
  id: "mem-price-concern",
  type: "customer_concern",
  title: "客户担心价格",
  detail: "客户担心价格太高，需要先确认 ROI。",
  source: "测试来源",
  confidence: "high",
  status: "confirmed",
  sourceReferences: [
    {
      contextId: "ctx-price-old",
      quote: "客户担心价格太高。",
      confidence: 0.9
    }
  ],
  createdBy: "human",
  createdAt: "2026-05-10T00:00:00.000Z",
  updatedAt: "2026-05-10T00:00:00.000Z"
};

const reconciliationProbe = reconcileMemories({
  existingMemories: [priceConcernMemory],
  candidateMemories: [
    {
      ...structuredClone(priceConcernMemory),
      id: "mem-price-duplicate",
      createdBy: "ai",
      sourceReferences: [
        {
          contextId: "ctx-price-duplicate",
          quote: "客户担心价格太高，需要先确认 ROI。",
          confidence: 0.86
        }
      ]
    },
    {
      ...structuredClone(priceConcernMemory),
      id: "mem-price-resolved",
      title: "客户已经不担心价格",
      detail: "客户已经明确表示价格不是问题，当前更关注上线时间。",
      sourceReferences: [
        {
          contextId: "ctx-price-new",
          quote: "客户已经明确表示价格不是问题。",
          confidence: 0.88
        }
      ]
    },
    {
      id: "mem-new-investor",
      type: "investor_question",
      title: "投资人追问留存指标",
      detail: "投资人追问次月留存和团队如何验证持续使用。",
      source: "投资人会议",
      confidence: "medium",
      status: "draft",
      sourceReferences: [
        {
          contextId: "ctx-investor-new",
          quote: "投资人追问次月留存。",
          confidence: 0.7
        }
      ],
      createdBy: "ai",
      createdAt: "2026-05-13T00:00:00.000Z",
      updatedAt: "2026-05-13T00:00:00.000Z"
    }
  ],
  now: "2026-05-13T00:00:00.000Z"
});

const reconciliationOperations = reconciliationProbe.reconciliationResults.map((item) => item.operation);
if (
  !reconciliationOperations.includes("duplicate") ||
  !reconciliationOperations.includes("outdate") ||
  !reconciliationOperations.includes("new") ||
  reconciliationProbe.acceptedMemories.length !== 1 ||
  reconciliationProbe.acceptedMemories[0].id !== "mem-new-investor" ||
  !reconciliationProbe.memoryUpdates.some((update) => update.operation === "outdate")
) {
  throw new Error(`reconcileMemories pipeline contract failed: ${JSON.stringify(reconciliationProbe)}`);
}

let duplicateIntakeProject = {
  ...structuredClone(DEMO_PROJECT),
  contexts: [],
  memories: [],
  actions: [],
  briefs: [],
  results: [],
  reconciliationResults: [],
  pendingMemoryUpdates: []
};

duplicateIntakeProject = absorbContext(duplicateIntakeProject, {
  kind: "customer",
  title: "价格顾虑",
  occurredAt: "2026-05-13",
  body: "客户担心价格太高，需要先确认 ROI。",
  participants: ["客户 B"],
  tags: ["价格"],
  importance: "high"
});
const duplicateFirstMemoryCount = duplicateIntakeProject.memories.length;
duplicateIntakeProject = absorbContext(duplicateIntakeProject, {
  kind: "customer",
  title: "价格顾虑复述",
  occurredAt: "2026-05-14",
  body: "客户担心价格太高，需要先确认 ROI。",
  participants: ["客户 B"],
  tags: ["价格"],
  importance: "high"
});

const duplicateSummaryHtml = renderApp({
  activeProjectId: duplicateIntakeProject.id,
  selectedActionId: null,
  projects: [duplicateIntakeProject]
});

if (
  duplicateIntakeProject.memories.length !== duplicateFirstMemoryCount ||
  duplicateIntakeProject.contexts[0].memoryIds.length !== 0 ||
  duplicateIntakeProject.reconciliationResults[0]?.operation !== "duplicate" ||
  !duplicateSummaryHtml.includes('data-reconciliation-summary') ||
  !duplicateSummaryHtml.includes("跳过重复")
) {
  throw new Error("Expected duplicate context intake to skip repeated memories and render reconciliation summary.");
}

let outdateProject = {
  ...structuredClone(DEMO_PROJECT),
  contexts: [],
  memories: [structuredClone(priceConcernMemory)],
  actions: [
    {
      id: "act-price",
      type: "customer_followup",
      title: "跟进价格顾虑",
      rationale: "客户仍担心价格，需要确认。",
      priority: "high",
      riskLevel: "medium",
      expectedOutput: "价格沟通草稿",
      sourceMemoryIds: ["mem-price-concern"],
      status: "pending",
      requiresHumanConfirmation: true,
      createdAt: "2026-05-13T00:00:00.000Z"
    }
  ],
  briefs: [],
  results: [],
  reconciliationResults: [],
  pendingMemoryUpdates: []
};

outdateProject = recordActionResult(outdateProject, "act-price", {
  outcome: "positive",
  summary: "客户已经明确表示价格不是问题，当前更关注上线时间。"
});

if (
  !outdateProject.results[0].relatedMemoryUpdates.some((update) => update.operation === "outdate") ||
  !outdateProject.pendingMemoryUpdates.some((update) => update.memoryId === "mem-price-concern") ||
  outdateProject.memories.find((memory) => memory.id === "mem-price-concern")?.status !== "confirmed"
) {
  throw new Error("Expected result reconciliation to suggest outdating old memory without auto-overwriting it.");
}

if (
  newestContext.occurredAt !== "2026-05-12" ||
  newestContext.importance !== "high" ||
  newestContext.participants.length !== 2 ||
  newestContext.tags.length !== 2
) {
  throw new Error(`Context metadata was not persisted: ${JSON.stringify(newestContext)}`);
}

const demoContextsWithMetadata = project.contexts.filter(
  (context) =>
    context.occurredAt &&
    Array.isArray(context.participants) &&
    Array.isArray(context.tags) &&
    context.importance
);

if (demoContextsWithMetadata.length < 3) {
  throw new Error("Expected at least three demo contexts with metadata.");
}

const newestMemory = project.memories.find((memory) => newestContext.memoryIds.includes(memory.id));
if (
  !newestMemory ||
  newestMemory.status !== "draft" ||
  newestMemory.createdBy !== "ai" ||
  !newestMemory.updatedAt ||
  !Array.isArray(newestMemory.sourceReferences) ||
  newestMemory.sourceReferences.length < 1 ||
  newestMemory.sourceReferences[0].contextId !== newestContext.id
) {
  throw new Error(`New memory did not include MEM-01 defaults: ${JSON.stringify(newestMemory)}`);
}

const generatedActions = project.actions.filter((item) => newestContext.actionIds.includes(item.id));
if (
  generatedActions.length < 1 ||
  generatedActions.some(
    (item) =>
      !item.whyNow ||
      !item.expectedArtifact ||
      !Array.isArray(item.sourceMemoryIds) ||
      item.sourceMemoryIds.length < 1 ||
      JSON.stringify(item.evidenceMemoryIds) !== JSON.stringify(item.sourceMemoryIds) ||
      !Array.isArray(item.humanConfirmationChecklist) ||
      !item.humanConfirmationChecklist.some((entry) => entry.includes("待确认"))
  )
) {
  throw new Error(`Generated actions should include Phase 3 evidence fields: ${JSON.stringify(generatedActions)}`);
}

if (generatedActions.some((item) => item.priority === "high")) {
  throw new Error("Draft-only memories should lower generated action priority until memory governance confirms evidence.");
}

project = updateMemoryStatus(project, newestMemory.id, "confirmed");
const confirmedMemory = project.memories.find((memory) => memory.id === newestMemory.id);
if (
  confirmedMemory.status !== "confirmed" ||
  !confirmedMemory.updatedAt ||
  !confirmedMemory.lastVerifiedAt
) {
  throw new Error(`Confirmed memory did not record MEM-03 timestamps: ${JSON.stringify(confirmedMemory)}`);
}

const memoryActionsHtml = renderApp({
  activeProjectId: project.id,
  selectedActionId: null,
  projects: [project]
});

if (
  !memoryActionsHtml.includes('data-action="update-memory-status"') ||
  !memoryActionsHtml.includes('data-memory-status="archived"') ||
  !memoryActionsHtml.includes('data-memory-governance-summary') ||
  !memoryActionsHtml.includes('data-action-memory-governance')
) {
  throw new Error("Expected memory cards to render quick status actions and governance summary.");
}

const memoryDetailHtml = renderApp({
  activeProjectId: project.id,
  editingMemoryId: null,
  selectedMemoryId: "mem-demo-customer",
  selectedActionId: "act-demo-engineering",
  projects: [project]
});

if (
  !memoryDetailHtml.includes("Memory Detail") ||
  !memoryDetailHtml.includes("完整内容") ||
  !memoryDetailHtml.includes('href="#context-ctx-demo-1"') ||
  !memoryDetailHtml.includes('data-action-id="act-demo-customer"') ||
  !memoryDetailHtml.includes('data-action="edit-memory"') ||
  !memoryDetailHtml.includes("action-card selected")
) {
  throw new Error("Expected selected memory detail to render sources, linked actions, edit entry, and preserve selected action.");
}

const demoStatuses = new Set(DEMO_PROJECT.memories.map((memory) => memory.status));
if (!demoStatuses.has("confirmed") || !demoStatuses.has("draft") || !demoStatuses.has("outdated")) {
  throw new Error(`Expected demo memories to show multiple statuses: ${JSON.stringify([...demoStatuses])}`);
}

const demoMemoriesWithSources = DEMO_PROJECT.memories.filter(
  (memory) => Array.isArray(memory.sourceReferences) && memory.sourceReferences.length > 0
);

if (demoMemoriesWithSources.length !== DEMO_PROJECT.memories.length) {
  throw new Error("Expected every demo memory to include source references.");
}

let archivedProject = {
  ...structuredClone(DEMO_PROJECT),
  contexts: [],
  actions: [],
  briefs: [],
  results: [],
  memories: [structuredClone(DEMO_PROJECT.memories[0])]
};

archivedProject = updateMemoryStatus(archivedProject, "mem-demo-customer", "archived");
archivedProject = absorbContext(archivedProject, {
  kind: "customer",
  title: "归档后重新输入客户顾虑",
  occurredAt: "2026-05-13",
  participants: ["客户 A"],
  tags: ["权限"],
  importance: "high",
  body: DEMO_PROJECT.memories[0].detail
});

const archivedContext = archivedProject.contexts[0];
const archivedEvidenceActions = archivedProject.actions.filter((item) =>
  archivedContext.actionIds.includes(item.id)
);

if (
  archivedContext.memoryIds.length < 1 ||
  archivedEvidenceActions.some((item) => item.sourceMemoryIds.includes("mem-demo-customer"))
) {
  throw new Error("Archived memories should not block fresh memories or become new action evidence.");
}

const editableMemoryId = project.memories.find((item) => item.type === "engineering_blocker")?.id;
if (!editableMemoryId) {
  throw new Error("Expected an engineering memory to edit.");
}

const sourceReferences = structuredClone(
  project.memories.find((item) => item.id === editableMemoryId).sourceReferences
);
const referencingActionIds = project.actions
  .filter((item) => item.sourceMemoryIds?.includes(editableMemoryId))
  .map((item) => item.id);
if (!referencingActionIds.length) {
  throw new Error("Expected at least one action linked to the editable memory.");
}

project = updateMemory(project, editableMemoryId, {
  title: "GitHub 集成阻塞需要确认",
  type: "engineering_blocker",
  content: "GitHub 集成仍未完成，需要确认权限、分工和交付时间。",
  status: "confirmed"
});

const editedMemory = project.memories.find((item) => item.id === editableMemoryId);
if (
  editedMemory.title !== "GitHub 集成阻塞需要确认" ||
  editedMemory.detail !== "GitHub 集成仍未完成，需要确认权限、分工和交付时间。" ||
  editedMemory.content !== "GitHub 集成仍未完成，需要确认权限、分工和交付时间。" ||
  editedMemory.status !== "confirmed" ||
  !editedMemory.updatedAt ||
  !editedMemory.lastVerifiedAt
) {
  throw new Error(`Memory edit failed: ${JSON.stringify(editedMemory)}`);
}

if (JSON.stringify(editedMemory.sourceReferences) !== JSON.stringify(sourceReferences)) {
  throw new Error("Memory edit should preserve sourceReferences.");
}

const stillLinked = referencingActionIds.every((actionId) =>
  project.actions.find((item) => item.id === actionId)?.sourceMemoryIds?.includes(editableMemoryId)
);
if (!stillLinked) {
  throw new Error("Memory edit should not break action sourceMemoryIds.");
}

const memoryEditHtml = renderApp({
  activeProjectId: project.id,
  editingMemoryId: editableMemoryId,
  selectedActionId: null,
  projects: [project]
});

if (
  !memoryEditHtml.includes('data-form="edit-memory"') ||
  !memoryEditHtml.includes('name="content"') ||
  !memoryEditHtml.includes("GitHub 集成仍未完成")
) {
  throw new Error("Expected memory edit form to render the selected memory.");
}

const action = project.actions.find((item) => item.status !== "done");
if (!action) {
  throw new Error("Expected at least one open action.");
}

const resultSummary = "客户同意下周试点，但要求权限设置、删除机制和数据范围先确认。";

project = generateBrief(project, action.id);
const generatedBrief = project.briefs.find((brief) => brief.actionId === action.id);
if (
  !generatedBrief ||
  generatedBrief.type !== action.type ||
  generatedBrief.createdBy !== "ai" ||
  !generatedBrief.updatedAt ||
  !Array.isArray(generatedBrief.evidenceMemoryIds) ||
  generatedBrief.evidenceMemoryIds.length < 1 ||
  !Array.isArray(generatedBrief.sourceContextIds) ||
  generatedBrief.sourceContextIds.length < 1 ||
  !Array.isArray(generatedBrief.sections.memoryGovernance) ||
  !generatedBrief.sections.memoryGovernance.some((entry) => entry.includes("可参与推理"))
) {
  throw new Error(`Generated brief should include evidence and source context links: ${JSON.stringify(generatedBrief)}`);
}

const briefEvidenceStatuses = generatedBrief.evidenceMemoryIds.map(
  (memoryId) => project.memories.find((memory) => memory.id === memoryId)?.status || "draft"
);
if (briefEvidenceStatuses.some((status) => ["outdated", "archived"].includes(status))) {
  throw new Error("Brief evidence should exclude outdated and archived memories by default.");
}

let customerBriefProject = generateBrief(structuredClone(DEMO_PROJECT), "act-demo-customer");
const customerBrief = customerBriefProject.briefs.find((brief) => brief.actionId === "act-demo-customer");
if (
  !customerBrief ||
  !Array.isArray(customerBrief.sections.customerConcern) ||
  !customerBrief.sections.draftMessage ||
  !Array.isArray(customerBrief.sections.doNotPromise) ||
  !Array.isArray(customerBrief.sections.entityContext) ||
  !Array.isArray(customerBrief.sections.projectNodeContext)
) {
  throw new Error(`Expected customer follow-up brief to include scenario sections: ${JSON.stringify(customerBrief)}`);
}

const customerBriefHtml = renderApp({
  activeProjectId: customerBriefProject.id,
  selectedActionId: "act-demo-customer",
  projects: [customerBriefProject]
});
if (
  !customerBriefHtml.includes("客户顾虑") ||
  !customerBriefHtml.includes("相关 Entity") ||
  !customerBriefHtml.includes("相关节点") ||
  !customerBriefHtml.includes("不要承诺")
) {
  throw new Error("Expected customer brief UI to render scenario-specific sections.");
}

let codingBriefProject = generateBrief(structuredClone(DEMO_PROJECT), "act-demo-engineering");
const codingBrief = codingBriefProject.briefs.find((brief) => brief.actionId === "act-demo-engineering");
if (
  !codingBrief ||
  !Array.isArray(codingBrief.sections.scope) ||
  !Array.isArray(codingBrief.sections.nonGoals) ||
  !Array.isArray(codingBrief.sections.testPlan) ||
  !Array.isArray(codingBrief.sections.reviewChecklist)
) {
  throw new Error(`Expected coding brief to include implementation sections: ${JSON.stringify(codingBrief)}`);
}

project = recordActionResult(project, action.id, {
  outcome: "positive",
  summary: resultSummary
});

const latestResult = project.results[0];
if (
  latestResult.whatChanged !== resultSummary ||
  latestResult.newEvidence !== resultSummary ||
  latestResult.followUpNeeded !== true ||
  !Array.isArray(latestResult.relatedMemoryUpdates)
) {
  throw new Error(`Action result should include Phase 3 result fields: ${JSON.stringify(latestResult)}`);
}

const resultContext = project.contexts.find(
  (context) => context.title === `行动结果：${action.title}` && context.body.includes("客户同意下周试点")
);
if (
  !resultContext ||
  !Array.isArray(resultContext.memoryIds) ||
  resultContext.memoryIds.length < 1 ||
  !Array.isArray(resultContext.actionIds)
) {
  throw new Error(`Expected action result to create a traceable context: ${JSON.stringify(resultContext)}`);
}

const resultMemories = project.memories.filter((memory) => latestResult.memoryIds.includes(memory.id));
if (
  resultMemories.length < 1 ||
  resultMemories.some(
    (memory) =>
      memory.status !== "draft" ||
      !Array.isArray(memory.sourceReferences) ||
      memory.sourceReferences.length < 1 ||
      memory.sourceReferences.some((reference) => reference.contextId !== resultContext.id)
  )
) {
  throw new Error(`Result memories did not include draft status and sources: ${JSON.stringify(resultMemories)}`);
}

const resultMemoryDetailHtml = renderApp({
  activeProjectId: project.id,
  editingMemoryId: null,
  selectedMemoryId: resultMemories[0].id,
  selectedActionId: action.id,
  projects: [project]
});

if (
  !resultMemoryDetailHtml.includes("关联 results / memory updates") ||
  !resultMemoryDetailHtml.includes(resultSummary) ||
  !resultMemoryDetailHtml.includes(`href="#context-${resultContext.id}"`)
) {
  throw new Error("Expected memory detail to show result-created memories and source context links.");
}

const allMemoriesMissingSources = project.memories.filter(
  (memory) => !hasUsableSourceReference(memory)
);
if (allMemoriesMissingSources.length) {
  throw new Error(
    `Expected every memory to include a source reference: ${allMemoriesMissingSources
      .map((memory) => memory.id)
      .join(", ")}`
  );
}

const legacyHtml = renderApp({
  activeProjectId: "legacy-project",
  selectedActionId: null,
  projects: [
    {
      id: "legacy-project",
      name: "Legacy Project",
      stage: "旧数据兼容",
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-01T00:00:00.000Z",
      contexts: [],
      memories: [
        {
          id: "legacy-memory",
          type: "fact",
          title: "旧记忆没有 status",
          detail: "旧 localStorage 数据只保存了基础 memory 字段。",
          source: "旧版本",
          confidence: "medium",
          createdAt: "2026-05-01T00:00:00.000Z"
        }
      ],
      actions: [],
      briefs: [],
      results: []
    }
  ]
});

if (!legacyHtml.includes("待确认") || !legacyHtml.includes("旧来源") || legacyHtml.includes("来源待补")) {
  throw new Error("Expected legacy memory HTML to render default status and legacy source label.");
}

const summary = {
  contexts: project.contexts.length,
  sources: inboxFlowProject.sources.length,
  signals: inboxFlowProject.signals.length,
  entities: inboxFlowProject.entities.length,
  nodes: project.nodes.length,
  memories: project.memories.length,
  actions: project.actions.length,
  briefs: project.briefs.length,
  results: project.results.length,
  openActions: project.actions.filter((item) => item.status !== "done").length,
  sourceReferencedMemories: project.memories.filter((memory) => hasUsableSourceReference(memory)).length,
  resultSourceContextId: resultContext.id
};

if (!summary.contexts || !summary.memories || !summary.actions || !summary.briefs || !summary.results) {
  throw new Error(`Smoke test failed: ${JSON.stringify(summary)}`);
}

console.log(JSON.stringify(summary, null, 2));

function hasUsableSourceReference(memory, contextId) {
  if (!Array.isArray(memory.sourceReferences)) {
    return false;
  }

  return memory.sourceReferences.some(
    (reference) =>
      reference?.quote &&
      reference?.contextId &&
      (!contextId || reference.contextId === contextId)
  );
}
