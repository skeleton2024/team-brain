import { DEMO_PROJECT_WITH_SOURCE_EVIDENCE as DEMO_PROJECT } from "../data/demoWithSourceEvidence.js";

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

export function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneProject(project) {
  return JSON.parse(JSON.stringify(project));
}
