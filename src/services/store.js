import { DEMO_PROJECT } from "../data/demo.js";
import {
  ACTION_STATUS,
  MEMORY_STATUS,
  MEMORY_TYPES,
  ENTITY_TYPES,
  COMMITMENT_STATUS,
  COMMITMENT_TYPES,
  OPPORTUNITY_STATUS,
  PROJECT_NODE_STATUS,
  RISK_STATUS,
  SIGNAL_TYPES,
  SOURCE_TYPE_LABELS
} from "../domain/types.js";

const STORAGE_KEY = "teammind.mvp.state.v1";

export function createInitialState() {
  const project = cloneProject(DEMO_PROJECT);

  return normalizeState({
    activeProjectId: project.id,
    selectedActionId: project.actions[0]?.id ?? null,
    projects: [project]
  });
}

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.projects)) {
      return null;
    }

    return normalizeState(parsed);
  } catch (error) {
    console.warn("Unable to load TeamMind state", error);
    return null;
  }
}

export function saveState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const next = createInitialState();
  saveState(next);
  return next;
}

export function makeProject(name) {
  const now = new Date().toISOString();
  const projectId = makeId("project");
  const project = {
    id: projectId,
    name,
    stage: "探索中",
    createdAt: now,
    updatedAt: now
  };

  return {
    ...project,
    sources: [],
    signals: [],
    entities: [],
    entityRelations: [],
    nodes: [makeDefaultProjectNode(project)],
    contexts: [],
    memories: [],
    actions: [],
    briefs: [],
    results: [],
    commitments: [],
    risks: [],
    opportunities: [],
    reconciliationResults: [],
    pendingMemoryUpdates: []
  };
}

export function updateMemory(project, memoryId, input) {
  const memory = project.memories.find((item) => item.id === memoryId);
  if (!memory) {
    return project;
  }

  const title = cleanText(input.title) || memory.title;
  const content = cleanText(input.content ?? input.detail ?? memory.content ?? memory.detail);
  if (!title || !content) {
    return project;
  }

  const now = new Date().toISOString();
  const status = normalizeEditedMemoryStatus(input.status, memory.status || "draft");
  const nextMemory = {
    ...memory,
    title,
    type: normalizeMemoryType(input.type, memory.type),
    detail: content,
    content,
    status,
    updatedAt: now
  };

  if (status === "confirmed") {
    nextMemory.lastVerifiedAt = now;
  }

  return {
    ...project,
    updatedAt: now,
    memories: project.memories.map((item) => (item.id === memoryId ? nextMemory : item))
  };
}

export function updateAction(project, actionId, input) {
  const action = project.actions.find((item) => item.id === actionId);
  if (!action) {
    return project;
  }

  const now = new Date().toISOString();
  const nextAction = {
    ...action,
    priority: normalizePriority(input.priority, action.priority || "medium"),
    status: normalizeActionStatus(input.status, action.status || "pending"),
    updatedAt: now
  };

  return {
    ...project,
    updatedAt: now,
    actions: project.actions.map((item) => (item.id === actionId ? nextAction : item))
  };
}

export function updateCommitment(project, commitmentId, input) {
  const commitment = (project.commitments || []).find((item) => item.id === commitmentId);
  if (!commitment) {
    return project;
  }

  const now = new Date().toISOString();
  const nextCommitment = {
    ...commitment,
    status: normalizeCommitmentStatus(input.status || commitment.status),
    dueAt: cleanText(input.dueAt),
    updatedAt: now
  };

  return {
    ...project,
    updatedAt: now,
    commitments: (project.commitments || []).map((item) =>
      item.id === commitmentId ? nextCommitment : item
    )
  };
}

export function updateRisk(project, riskId, input) {
  const risk = (project.risks || []).find((item) => item.id === riskId);
  if (!risk) {
    return project;
  }

  const now = new Date().toISOString();
  const nextRisk = {
    ...risk,
    status: normalizeRiskStatus(input.status || risk.status),
    updatedAt: now
  };

  return {
    ...project,
    updatedAt: now,
    risks: (project.risks || []).map((item) => (item.id === riskId ? nextRisk : item))
  };
}

export function updateOpportunity(project, opportunityId, input) {
  const opportunity = (project.opportunities || []).find((item) => item.id === opportunityId);
  if (!opportunity) {
    return project;
  }

  const now = new Date().toISOString();
  const nextOpportunity = {
    ...opportunity,
    status: normalizeOpportunityStatus(input.status || opportunity.status),
    updatedAt: now
  };

  return {
    ...project,
    updatedAt: now,
    opportunities: (project.opportunities || []).map((item) =>
      item.id === opportunityId ? nextOpportunity : item
    )
  };
}

export function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function normalizeMemoryType(value, fallback) {
  return MEMORY_TYPES[value] ? value : fallback;
}

function normalizeEditedMemoryStatus(value, fallback) {
  return MEMORY_STATUS[value] ? value : fallback;
}

function normalizeActionStatus(value, fallback) {
  return ACTION_STATUS[value] ? value : fallback;
}

function normalizePriority(value, fallback) {
  return ["low", "medium", "high"].includes(value) ? value : fallback;
}

function cloneProject(project) {
  return JSON.parse(JSON.stringify(project));
}

export function normalizeStoredState(state) {
  return normalizeState(state);
}

function normalizeState(state) {
  const safeState = state && typeof state === "object" ? state : {};
  const projects = Array.isArray(safeState.projects) ? safeState.projects.map(normalizeProject) : [];

  return {
    ...safeState,
    schemaVersion: Number(safeState.schemaVersion) || 2,
    activeProjectId: safeState.activeProjectId || projects[0]?.id || null,
    selectedActionId: safeState.selectedActionId ?? projects[0]?.actions?.[0]?.id ?? null,
    projects
  };
}

function normalizeProject(project) {
  project = project && typeof project === "object" ? project : {};
  const now = new Date().toISOString();
  const projectId = project.id || makeId("project");

  return {
    ...project,
    id: projectId,
    name: project.name || "未命名项目",
    stage: project.stage || "待整理",
    description: project.description || "",
    createdAt: project.createdAt || now,
    updatedAt: project.updatedAt || project.createdAt || now,
    sources: Array.isArray(project.sources) ? project.sources.map(normalizeSource) : [],
    signals: Array.isArray(project.signals) ? project.signals.map(normalizeSignal) : [],
    entities: Array.isArray(project.entities) ? project.entities.map(normalizeEntity) : [],
    entityRelations: Array.isArray(project.entityRelations) ? project.entityRelations : [],
    nodes: normalizeProjectNodes(project),
    contexts: Array.isArray(project.contexts) ? project.contexts.map(normalizeContext) : [],
    memories: Array.isArray(project.memories) ? project.memories.map(normalizeMemory) : [],
    actions: Array.isArray(project.actions) ? project.actions.map(normalizeAction) : [],
    briefs: Array.isArray(project.briefs) ? project.briefs.map(normalizeBrief) : [],
    results: Array.isArray(project.results) ? project.results.map(normalizeActionResult) : [],
    commitments: Array.isArray(project.commitments)
      ? project.commitments.map((commitment) => normalizeCommitment(commitment, project))
      : [],
    risks: Array.isArray(project.risks) ? project.risks.map((risk) => normalizeRisk(risk, project)) : [],
    opportunities: Array.isArray(project.opportunities)
      ? project.opportunities.map((opportunity) => normalizeOpportunity(opportunity, project))
      : [],
    reconciliationResults: Array.isArray(project.reconciliationResults)
      ? project.reconciliationResults.map(normalizeReconciliationResult)
      : [],
    pendingMemoryUpdates: Array.isArray(project.pendingMemoryUpdates)
      ? project.pendingMemoryUpdates.map(normalizeRelatedMemoryUpdate)
      : []
  };
}

function normalizeProjectNodes(project) {
  const nodes = Array.isArray(project.nodes) ? project.nodes.map((node) => normalizeProjectNode(node, project)) : [];
  return nodes.length ? nodes : [makeDefaultProjectNode(project)];
}

function normalizeProjectNode(node, project) {
  node = node && typeof node === "object" ? node : {};
  const createdAt = node.createdAt || project.createdAt || new Date().toISOString();

  return {
    ...node,
    id: node.id || makeId("node"),
    projectId: node.projectId || project.id,
    title: node.title || `${project.name || "项目"} 默认节点`,
    goal: node.goal || project.description || project.stage || "推进当前项目的下一步闭环。",
    status: normalizeProjectNodeStatus(node.status),
    ownerSuggestion: node.ownerSuggestion || "",
    dueAt: node.dueAt || "",
    successCriteria: normalizeList(node.successCriteria),
    inputContextIds: normalizeIds(node.inputContextIds),
    sourceIds: normalizeIds(node.sourceIds),
    signalIds: normalizeIds(node.signalIds),
    memoryIds: normalizeIds(node.memoryIds),
    actionIds: normalizeIds(node.actionIds),
    waitingIds: normalizeIds(node.waitingIds),
    riskIds: normalizeIds(node.riskIds),
    resultIds: normalizeIds(node.resultIds),
    createdAt,
    updatedAt: node.updatedAt || createdAt
  };
}

function makeDefaultProjectNode(project) {
  const createdAt = project.createdAt || new Date().toISOString();
  const projectId = project.id || makeId("project");

  return {
    id: `node-${projectId}-default`,
    projectId,
    title: `${project.name || "项目"} 默认推进节点`,
    goal: project.description || project.stage || "把当前项目推进到下一步可验证结果。",
    status: "active",
    ownerSuggestion: "",
    dueAt: "",
    successCriteria: ["下一步行动明确", "关键记忆和结果可追溯"],
    inputContextIds: [],
    sourceIds: [],
    signalIds: [],
    memoryIds: [],
    actionIds: [],
    waitingIds: [],
    riskIds: [],
    resultIds: [],
    createdAt,
    updatedAt: project.updatedAt || createdAt
  };
}

function normalizeSource(source) {
  source = source && typeof source === "object" ? source : {};
  const createdAt = source.createdAt || new Date().toISOString();
  const receivedAt = source.receivedAt || createdAt;

  return {
    ...source,
    id: source.id || makeId("src"),
    kind: normalizeSourceKind(source.kind),
    title: source.title || "未命名来源",
    body: source.body || "",
    origin: normalizeSourceOrigin(source.origin),
    externalRef: source.externalRef ? String(source.externalRef).trim() : undefined,
    occurredAt: source.occurredAt || receivedAt,
    receivedAt,
    participants: normalizeList(source.participants),
    relatedEntityIds: Array.isArray(source.relatedEntityIds) ? source.relatedEntityIds : [],
    relatedProjectIds: Array.isArray(source.relatedProjectIds) ? source.relatedProjectIds : [],
    tags: normalizeList(source.tags),
    importance: normalizeImportance(source.importance),
    status: normalizeSourceStatus(source.status),
    createdAt,
    updatedAt: source.updatedAt || createdAt
  };
}

function normalizeSignal(signal) {
  signal = signal && typeof signal === "object" ? signal : {};
  const createdAt = signal.createdAt || new Date().toISOString();

  return {
    ...signal,
    id: signal.id || makeId("sig"),
    sourceId: signal.sourceId || "",
    type: normalizeSignalType(signal.type),
    title: signal.title || "未命名 Signal",
    summary: signal.summary || signal.quote || "",
    quote: signal.quote ? String(signal.quote).trim() : undefined,
    confidence: normalizeSignalConfidence(signal.confidence),
    suggestedEntityIds: Array.isArray(signal.suggestedEntityIds) ? signal.suggestedEntityIds : [],
    suggestedProjectIds: Array.isArray(signal.suggestedProjectIds) ? signal.suggestedProjectIds : [],
    suggestedMemory: signal.suggestedMemory || undefined,
    suggestedAction: signal.suggestedAction || undefined,
    status: normalizeSignalStatus(signal.status),
    createdBy: signal.createdBy === "human" ? "human" : "ai",
    createdAt,
    updatedAt: signal.updatedAt || createdAt
  };
}

function normalizeEntity(entity) {
  entity = entity && typeof entity === "object" ? entity : {};
  const createdAt = entity.createdAt || new Date().toISOString();
  const sourceIds = normalizeIds(entity.sourceIds, entity.relatedSourceIds);
  const signalIds = normalizeIds(entity.signalIds, entity.relatedSignalIds);
  const memoryIds = normalizeIds(entity.memoryIds, entity.relatedMemoryIds);
  const projectIds = normalizeIds(entity.projectIds, entity.relatedProjectIds);

  return {
    ...entity,
    id: entity.id || makeId("ent"),
    type: normalizeEntityType(entity.type),
    name: entity.name || "未命名对象",
    role: entity.role || "",
    organization: entity.organization || "",
    description: entity.description || "",
    status: normalizeEntityStatus(entity.status),
    relationshipStage: entity.relationshipStage || "",
    ownerSuggestion: entity.ownerSuggestion || "",
    tags: normalizeList(entity.tags),
    sourceIds,
    signalIds,
    memoryIds,
    projectIds,
    relatedSourceIds: sourceIds,
    relatedSignalIds: signalIds,
    relatedMemoryIds: memoryIds,
    relatedProjectIds: projectIds,
    lastInteractionAt: entity.lastInteractionAt || "",
    nextSuggestedActionId: entity.nextSuggestedActionId || "",
    createdAt,
    updatedAt: entity.updatedAt || createdAt
  };
}

function normalizeContext(context) {
  context = context && typeof context === "object" ? context : {};
  const createdAt = context.createdAt || new Date().toISOString();

  return {
    ...context,
    kind: context.kind || "other",
    title: context.title || "未命名上下文",
    body: context.body || "",
    occurredAt: context.occurredAt || createdAt,
    participants: normalizeList(context.participants),
    tags: normalizeList(context.tags),
    importance: normalizeImportance(context.importance),
    createdAt,
    updatedAt: context.updatedAt || createdAt,
    memoryIds: Array.isArray(context.memoryIds) ? context.memoryIds : [],
    actionIds: Array.isArray(context.actionIds) ? context.actionIds : [],
    reconciliationResultIds: Array.isArray(context.reconciliationResultIds)
      ? context.reconciliationResultIds
      : []
  };
}

function normalizeActionResult(result) {
  result = result && typeof result === "object" ? result : {};
  const createdAt = result.createdAt || new Date().toISOString();

  return {
    ...result,
    createdAt,
    memoryIds: Array.isArray(result.memoryIds) ? result.memoryIds : [],
    actionIds: Array.isArray(result.actionIds) ? result.actionIds : [],
    relatedMemoryUpdates: Array.isArray(result.relatedMemoryUpdates)
      ? result.relatedMemoryUpdates.map(normalizeRelatedMemoryUpdate)
      : [],
    reconciliationResultIds: Array.isArray(result.reconciliationResultIds)
      ? result.reconciliationResultIds
      : []
  };
}

function normalizeAction(action) {
  action = action && typeof action === "object" ? action : {};
  const createdAt = action.createdAt || new Date().toISOString();

  return {
    ...action,
    id: action.id || makeId("action"),
    type: action.type || "research_task",
    title: action.title || "未命名行动",
    rationale: action.rationale || action.whyNow || "",
    whyNow: action.whyNow || action.rationale || "等待补充处理原因。",
    priority: normalizePriority(action.priority, "medium"),
    riskLevel: normalizeLevel(action.riskLevel),
    expectedOutput: action.expectedOutput || action.expectedArtifact || "待补输出物",
    expectedArtifact: action.expectedArtifact || action.expectedOutput || "待补输出物",
    sourceMemoryIds: normalizeIds(action.sourceMemoryIds),
    evidenceMemoryIds: normalizeIds(action.evidenceMemoryIds, action.sourceMemoryIds),
    blockedBy: normalizeList(action.blockedBy),
    humanConfirmationChecklist: normalizeList(action.humanConfirmationChecklist),
    status: normalizeActionStatus(action.status, "pending"),
    createdAt,
    updatedAt: action.updatedAt || createdAt
  };
}

function normalizeBrief(brief) {
  brief = brief && typeof brief === "object" ? brief : {};
  const createdAt = brief.createdAt || new Date().toISOString();

  return {
    ...brief,
    id: brief.id || makeId("brief"),
    actionId: brief.actionId || "",
    type: brief.type || "research_task",
    title: brief.title || "未命名 Brief",
    sections: brief.sections && typeof brief.sections === "object" ? brief.sections : {},
    evidenceMemoryIds: normalizeIds(brief.evidenceMemoryIds),
    sourceContextIds: normalizeIds(brief.sourceContextIds),
    createdBy: brief.createdBy === "human" ? "human" : "ai",
    createdAt,
    updatedAt: brief.updatedAt || createdAt
  };
}

function normalizeCommitment(commitment, project) {
  commitment = commitment && typeof commitment === "object" ? commitment : {};
  const createdAt = commitment.createdAt || new Date().toISOString();

  return {
    ...commitment,
    id: commitment.id || makeId("commitment"),
    projectId: commitment.projectId || project.id,
    nodeId: commitment.nodeId || "",
    type: normalizeCommitmentType(commitment.type),
    title: commitment.title || "未命名承诺",
    who: commitment.who || "待确认",
    toWhom: commitment.toWhom || "",
    dueAt: commitment.dueAt || "",
    status: normalizeCommitmentStatus(commitment.status),
    evidenceLinks: normalizeEvidenceLinks(commitment.evidenceLinks),
    createdAt,
    updatedAt: commitment.updatedAt || createdAt
  };
}

function normalizeRisk(risk, project) {
  risk = risk && typeof risk === "object" ? risk : {};
  const createdAt = risk.createdAt || new Date().toISOString();

  return {
    ...risk,
    id: risk.id || makeId("risk"),
    projectId: risk.projectId || project.id,
    nodeId: risk.nodeId || "",
    entityIds: normalizeIds(risk.entityIds),
    title: risk.title || "未命名风险",
    description: risk.description || "",
    severity: normalizeLevel(risk.severity),
    likelihood: normalizeLevel(risk.likelihood),
    status: normalizeRiskStatus(risk.status),
    evidenceLinks: normalizeEvidenceLinks(risk.evidenceLinks),
    suggestedActionIds: normalizeIds(risk.suggestedActionIds),
    createdAt,
    updatedAt: risk.updatedAt || createdAt
  };
}

function normalizeOpportunity(opportunity, project) {
  opportunity = opportunity && typeof opportunity === "object" ? opportunity : {};
  const createdAt = opportunity.createdAt || new Date().toISOString();

  return {
    ...opportunity,
    id: opportunity.id || makeId("opportunity"),
    projectId: opportunity.projectId || project.id,
    nodeId: opportunity.nodeId || "",
    entityIds: normalizeIds(opportunity.entityIds),
    title: opportunity.title || "未命名机会",
    description: opportunity.description || "",
    potentialImpact: normalizeLevel(opportunity.potentialImpact),
    confidence: normalizeOpportunityConfidence(opportunity.confidence),
    status: normalizeOpportunityStatus(opportunity.status),
    evidenceLinks: normalizeEvidenceLinks(opportunity.evidenceLinks),
    suggestedActionIds: normalizeIds(opportunity.suggestedActionIds),
    createdAt,
    updatedAt: opportunity.updatedAt || createdAt
  };
}

function normalizeReconciliationResult(result) {
  result = result && typeof result === "object" ? result : {};
  const createdAt = result.createdAt || new Date().toISOString();

  return {
    ...result,
    id: result.id || makeId("rec"),
    candidateMemoryId: result.candidateMemoryId || "",
    operation: normalizeReconciliationOperation(result.operation),
    reason: result.reason || "",
    requiresHumanReview: Boolean(result.requiresHumanReview),
    createdAt
  };
}

function normalizeRelatedMemoryUpdate(update) {
  update = update && typeof update === "object" ? update : {};
  return {
    ...update,
    memoryId: update.memoryId || "",
    operation: normalizeMemoryUpdateOperation(update.operation),
    reason: update.reason || ""
  };
}

function normalizeMemory(memory) {
  memory = memory && typeof memory === "object" ? memory : {};
  const createdAt = memory.createdAt || new Date().toISOString();
  const sourceReferences = normalizeSourceReferences(memory.sourceReferences);
  const normalized = {
    ...memory,
    title: memory.title || "未命名记忆",
    detail: memory.detail || memory.content || "",
    source: memory.source || sourceReferences[0]?.note || "来源待补",
    confidence: normalizeConfidence(memory.confidence),
    status: normalizeMemoryStatus(memory.status),
    sourceReferences,
    createdBy: memory.createdBy === "human" ? "human" : "ai",
    createdAt,
    updatedAt: memory.updatedAt || createdAt
  };

  if (memory.lastVerifiedAt) {
    normalized.lastVerifiedAt = memory.lastVerifiedAt;
  }

  return normalized;
}

function normalizeSourceReferences(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((reference) => ({
      contextId: String(reference?.contextId || "").trim(),
      sourceId: String(reference?.sourceId || "").trim(),
      signalId: String(reference?.signalId || "").trim(),
      quote: String(reference?.quote || "").trim(),
      note: reference?.note ? String(reference.note).trim() : undefined,
      confidence:
        typeof reference?.confidence === "number"
          ? Math.max(0, Math.min(1, reference.confidence))
          : undefined
    }))
    .filter((reference) => reference.contextId || reference.sourceId || reference.quote)
    .map((reference) => ({
      ...reference,
      contextId: reference.contextId || (reference.sourceId ? "" : "ctx-unknown-source")
    }));
}

function normalizeEvidenceLinks(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((link) => ({
      sourceId: String(link?.sourceId || "").trim(),
      contextId: String(link?.contextId || "").trim(),
      signalId: String(link?.signalId || "").trim(),
      memoryId: String(link?.memoryId || "").trim(),
      quote: String(link?.quote || "").trim(),
      note: link?.note ? String(link.note).trim() : undefined,
      confidence:
        typeof link?.confidence === "number"
          ? Math.max(0, Math.min(1, link.confidence))
          : undefined
    }))
    .filter((link) => link.sourceId || link.contextId || link.signalId || link.memoryId || link.quote);
}

function normalizeMemoryStatus(value) {
  return ["draft", "confirmed", "outdated", "disputed", "archived"].includes(value)
    ? value
    : "draft";
}

function normalizeSourceKind(value) {
  return SOURCE_TYPE_LABELS[value] ? value : "other";
}

function normalizeSourceOrigin(value) {
  return ["manual", "imported", "integration", "result"].includes(value) ? value : "manual";
}

function normalizeSourceStatus(value) {
  return ["new", "processed", "ignored", "archived"].includes(value) ? value : "new";
}

function normalizeSignalType(value) {
  return SIGNAL_TYPES[value] ? value : "fact";
}

function normalizeSignalStatus(value) {
  return ["new", "confirmed", "ignored", "converted"].includes(value) ? value : "new";
}

function normalizeSignalConfidence(value) {
  if (typeof value === "number") {
    return Math.max(0, Math.min(1, value));
  }

  return 0.5;
}

function normalizeEntityType(value) {
  return ENTITY_TYPES[value] ? value : "other";
}

function normalizeEntityStatus(value) {
  return ["active", "inactive", "watching", "archived"].includes(value) ? value : "watching";
}

function normalizeProjectNodeStatus(value) {
  return PROJECT_NODE_STATUS[value] ? value : "planned";
}

function normalizeCommitmentType(value) {
  return COMMITMENT_TYPES[value] ? value : "commitment";
}

function normalizeCommitmentStatus(value) {
  return COMMITMENT_STATUS[value] ? value : "open";
}

function normalizeRiskStatus(value) {
  return RISK_STATUS[value] ? value : "open";
}

function normalizeOpportunityStatus(value) {
  return OPPORTUNITY_STATUS[value] ? value : "new";
}

function normalizeLevel(value) {
  return ["low", "medium", "high"].includes(value) ? value : "medium";
}

function normalizeOpportunityConfidence(value) {
  if (typeof value === "number") {
    return Math.max(0, Math.min(1, value));
  }

  return 0.5;
}

function normalizeReconciliationOperation(value) {
  return ["new", "duplicate", "update", "conflict", "outdate"].includes(value)
    ? value
    : "new";
}

function normalizeMemoryUpdateOperation(value) {
  return ["confirm", "update", "dispute", "outdate", "archive"].includes(value)
    ? value
    : "update";
}

function normalizeConfidence(value) {
  return ["low", "medium", "high"].includes(value) ? value : "low";
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeIds(primary, fallback) {
  return unique([
    ...(Array.isArray(primary) ? primary : []),
    ...(Array.isArray(fallback) ? fallback : [])
  ].map((item) => String(item).trim()).filter(Boolean));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeImportance(value) {
  return ["low", "medium", "high"].includes(value) ? value : "medium";
}
