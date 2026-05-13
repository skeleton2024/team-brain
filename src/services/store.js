import { DEMO_PROJECT } from "../data/demo.js";
import { MEMORY_STATUS, MEMORY_TYPES } from "../domain/types.js";

const STORAGE_KEY = "teammind.mvp.state.v1";

export function createInitialState() {
  const project = cloneProject(DEMO_PROJECT);

  return {
    activeProjectId: project.id,
    selectedActionId: project.actions[0]?.id ?? null,
    projects: [project]
  };
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

    return parsed;
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
  const status = normalizeMemoryStatus(input.status, memory.status || "draft");
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

function normalizeMemoryStatus(value, fallback) {
  return MEMORY_STATUS[value] ? value : fallback;
}

function cloneProject(project) {
  return JSON.parse(JSON.stringify(project));
}
