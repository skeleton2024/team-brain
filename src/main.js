import {
  absorbContext,
  generateBrief,
  recordActionResult,
  updateMemoryStatus
} from "./domain/agentEngine.js";
import {
  createInitialState,
  loadState,
  makeProject,
  resetState,
  saveState
} from "./services/store.js";
import { getActiveProject, renderApp } from "./ui/render.js";

const app = document.querySelector("#app");

let state = loadState() || createInitialState();

render();

function render() {
  app.innerHTML = renderApp(state);
  bindEvents();
}

function bindEvents() {
  app.querySelector('[data-form="create-project"]')?.addEventListener("submit", handleCreateProject);
  app.querySelector('[data-form="absorb-context"]')?.addEventListener("submit", handleAbsorbContext);
  app.querySelector('[data-form="record-result"]')?.addEventListener("submit", handleRecordResult);

  app.querySelectorAll('[data-action="update-memory-status"]').forEach((button) => {
    button.addEventListener("click", () => {
      updateActiveProject((project) =>
        updateMemoryStatus(project, button.dataset.memoryId, button.dataset.memoryStatus)
      );
    });
  });

  app.querySelectorAll("[data-project-id]").forEach((button) => {
    button.addEventListener("click", () => {
      setState({
        ...state,
        activeProjectId: button.dataset.projectId,
        selectedActionId:
          state.projects.find((project) => project.id === button.dataset.projectId)?.actions[0]?.id ??
          null
      });
    });
  });

  app.querySelectorAll("[data-action-id]").forEach((button) => {
    if (button.dataset.action === "generate-brief") {
      return;
    }

    button.addEventListener("click", () => {
      setState({
        ...state,
        selectedActionId: button.dataset.actionId
      });
    });
  });

  app.querySelector('[data-action="generate-brief"]')?.addEventListener("click", (event) => {
    const actionId = event.currentTarget.dataset.actionId;
    updateActiveProject((project) => generateBrief(project, actionId), actionId);
  });

  app.querySelector('[data-action="reset-demo"]')?.addEventListener("click", () => {
    const shouldReset = window.confirm("重置会清空当前本地演示数据，确定继续？");
    if (shouldReset) {
      state = resetState();
      render();
    }
  });

  app.querySelector('[data-action="export-json"]')?.addEventListener("click", exportState);
}

function handleCreateProject(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name") || "").trim();
  if (!name) {
    return;
  }

  const project = makeProject(name);
  setState({
    ...state,
    activeProjectId: project.id,
    selectedActionId: null,
    projects: [project, ...state.projects]
  });
}

function handleAbsorbContext(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const input = {
    kind: String(form.get("kind") || "other"),
    title: String(form.get("title") || "").trim(),
    body: String(form.get("body") || "").trim(),
    occurredAt: String(form.get("occurredAt") || "").trim(),
    participants: parseList(form.get("participants")),
    tags: parseList(form.get("tags")),
    importance: String(form.get("importance") || "medium")
  };

  if (!input.body) {
    return;
  }

  updateActiveProject((project) => {
    const next = absorbContext(project, input);
    const newActionId = next.actions.find((action) => action.status !== "done")?.id ?? null;
    state = {
      ...state,
      selectedActionId: newActionId
    };
    return next;
  });
}

function handleRecordResult(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const actionId = event.currentTarget.dataset.actionId;
  const summary = String(form.get("summary") || "").trim();
  const outcome = String(form.get("outcome") || "neutral");

  if (!summary) {
    return;
  }

  updateActiveProject((project) => {
    const next = recordActionResult(project, actionId, { summary, outcome });
    const nextAction =
      next.actions.find((action) => action.status !== "done" && action.id !== actionId) ||
      next.actions.find((action) => action.status !== "done");

    state = {
      ...state,
      selectedActionId: nextAction?.id ?? actionId
    };

    return next;
  });
}

function updateActiveProject(updater, selectedActionId) {
  const activeProject = getActiveProject(state);
  const nextProject = updater(activeProject);
  const nextState = {
    ...state,
    selectedActionId: selectedActionId ?? state.selectedActionId,
    projects: state.projects.map((project) =>
      project.id === activeProject.id ? nextProject : project
    )
  };

  setState(nextState);
}

function setState(nextState) {
  state = nextState;
  saveState(state);
  render();
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "teammind-export.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
