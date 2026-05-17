import { DEMO_PROJECT } from "../data/demo.js";
import { MEMORY_STATUS, MEMORY_TYPES } from "../domain/types.js";

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

  return {
    id: makeId("project"),
    name,
    stage: "探索中",
    createdAt: now,
    updatedAt: now,
    contexts: [],
    memories: [],
    actions: [],
    briefs: [],
    results: [],
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

function cloneProject(project) {
  return JSON.parse(JSON.stringify(project));
}

function normalizeState(state) {
  const projects = Array.isArray(state.projects) ? state.projects.map(normalizeProject) : [];

  return {
    ...state,
    activeProjectId: state.activeProjectId || projects[0]?.id || null,
    selectedActionId: state.selectedActionId ?? projects[0]?.actions?.[0]?.id ?? null,
    projects
  };
}

function normalizeProject(project) {
  const now = new Date().toISOString();

  return {
    ...project,
    createdAt: project.createdAt || now,
    updatedAt: project.updatedAt || project.createdAt || now,
    contexts: Array.isArray(project.contexts) ? project.contexts.map(normalizeContext) : [],
    memories: Array.isArray(project.memories) ? project.memories.map(normalizeMemory) : [],
    actions: Array.isArray(project.actions) ? project.actions : [],
    briefs: Array.isArray(project.briefs) ? project.briefs : [],
    results: Array.isArray(project.results) ? project.results.map(normalizeActionResult) : [],
    reconciliationResults: Array.isArray(project.reconciliationResults)
      ? project.reconciliationResults.map(normalizeReconciliationResult)
      : [],
    pendingMemoryUpdates: Array.isArray(project.pendingMemoryUpdates)
      ? project.pendingMemoryUpdates.map(normalizeRelatedMemoryUpdate)
      : []
  };
}

function normalizeContext(context) {
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

function normalizeReconciliationResult(result) {
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
  return {
    ...update,
    memoryId: update.memoryId || "",
    operation: normalizeMemoryUpdateOperation(update.operation),
    reason: update.reason || ""
  };
}

function normalizeMemory(memory) {
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
      quote: String(reference?.quote || "").trim(),
      note: reference?.note ? String(reference.note).trim() : undefined,
      confidence:
        typeof reference?.confidence === "number"
          ? Math.max(0, Math.min(1, reference.confidence))
          : undefined
    }))
    .filter((reference) => reference.contextId || reference.quote)
    .map((reference) => ({
      ...reference,
      contextId: reference.contextId || "ctx-unknown-source"
    }));
}

function normalizeMemoryStatus(value) {
  return ["draft", "confirmed", "outdated", "disputed", "archived"].includes(value)
    ? value
    : "draft";
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

function normalizeImportance(value) {
  return ["low", "medium", "high"].includes(value) ? value : "medium";
}
