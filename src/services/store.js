import { DEMO_PROJECT } from "../data/demo.js";

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
    results: []
  };
}

export function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
    memories: Array.isArray(project.memories) ? project.memories : [],
    actions: Array.isArray(project.actions) ? project.actions : [],
    briefs: Array.isArray(project.briefs) ? project.briefs : [],
    results: Array.isArray(project.results) ? project.results : []
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
    actionIds: Array.isArray(context.actionIds) ? context.actionIds : []
  };
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
