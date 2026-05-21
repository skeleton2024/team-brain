import {
  addManualSource,
  absorbContext,
  generateBrief,
  processSource,
  recordActionResult,
  reviewSignal,
  suggestSignalLinks,
  updateCommitmentStatus,
  updateEntityStatus,
  updateMemoryStatus,
  updateOpportunityStatus,
  updateProjectNodeStatus,
  updateRiskStatus
} from "./domain/agentEngine.js";
import {
  createInitialState,
  loadState,
  makeProject,
  resetState,
  saveState,
  updateMemory
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
  app.querySelector('[data-form="manual-source"]')?.addEventListener("submit", handleManualSource);
  app.querySelector('[data-form="absorb-context"]')?.addEventListener("submit", handleAbsorbContext);
  app.querySelector('[data-form="record-result"]')?.addEventListener("submit", handleRecordResult);
  app.querySelectorAll('[data-form="edit-memory"]').forEach((form) => {
    form.addEventListener("submit", handleEditMemory);
  });

  app.querySelectorAll('[data-action="process-source"]').forEach((button) => {
    button.addEventListener("click", () => {
      updateActiveProject((project) => processSource(project, button.dataset.sourceId));
    });
  });

  app.querySelectorAll('[data-action="suggest-signal-links"]').forEach((button) => {
    button.addEventListener("click", () => {
      updateActiveProject((project) => suggestSignalLinks(project, button.dataset.signalId));
    });
  });

  app.querySelectorAll("[data-signal-review]").forEach((button) => {
    button.addEventListener("click", () => {
      updateActiveProject((project) =>
        reviewSignal(project, button.dataset.signalId, button.dataset.signalReview)
      );
    });
  });

  app.querySelectorAll('[data-action="update-memory-status"]').forEach((button) => {
    button.addEventListener("click", () => {
      updateActiveProject((project) =>
        updateMemoryStatus(project, button.dataset.memoryId, button.dataset.memoryStatus)
      );
    });
  });

  app.querySelectorAll('[data-action="update-entity-status"]').forEach((button) => {
    button.addEventListener("click", () => {
      updateActiveProject((project) =>
        updateEntityStatus(project, button.dataset.entityId, button.dataset.entityStatus)
      );
    });
  });

  app.querySelectorAll('[data-action="update-project-node-status"]').forEach((button) => {
    button.addEventListener("click", () => {
      updateActiveProject((project) =>
        updateProjectNodeStatus(project, button.dataset.nodeId, button.dataset.nodeStatus)
      );
    });
  });

  app.querySelectorAll('[data-action="update-commitment-status"]').forEach((button) => {
    button.addEventListener("click", () => {
      updateActiveProject((project) =>
        updateCommitmentStatus(project, button.dataset.commitmentId, button.dataset.commitmentStatus)
      );
    });
  });

  app.querySelectorAll('[data-action="update-risk-status"]').forEach((button) => {
    button.addEventListener("click", () => {
      updateActiveProject((project) =>
        updateRiskStatus(project, button.dataset.riskId, button.dataset.riskStatus)
      );
    });
  });

  app.querySelectorAll('[data-action="update-opportunity-status"]').forEach((button) => {
    button.addEventListener("click", () => {
      updateActiveProject((project) =>
        updateOpportunityStatus(
          project,
          button.dataset.opportunityId,
          button.dataset.opportunityStatus
        )
      );
    });
  });

  app.querySelectorAll("[data-command-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      focusCommandTarget(link.dataset.targetType, link.dataset.targetId, link.dataset.targetAnchor);
    });
  });

  app.querySelectorAll("[data-project-id]").forEach((button) => {
    button.addEventListener("click", () => {
      setState({
        ...state,
        activeProjectId: button.dataset.projectId,
        editingMemoryId: null,
        selectedEntityId: null,
        selectedMemoryId: null,
        selectedNodeId: null,
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

  app.querySelectorAll("[data-entity-open-id]").forEach((button) => {
    button.addEventListener("click", () => {
      setState({
        ...state,
        selectedEntityId: button.dataset.entityOpenId
      });
    });
  });

  app.querySelector('[data-action="close-entity-detail"]')?.addEventListener("click", () => {
    setState({
      ...state,
      selectedEntityId: null
    });
  });

  app.querySelectorAll('[data-action="open-node-detail"]').forEach((button) => {
    button.addEventListener("click", () => {
      setState({
        ...state,
        selectedNodeId: button.dataset.nodeId
      });
    });
  });

  app.querySelector('[data-action="close-node-detail"]')?.addEventListener("click", () => {
    setState({
      ...state,
      selectedNodeId: null
    });
  });

  app.querySelectorAll("[data-memory-open-id]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("button, a, input, select, textarea, summary, details")) {
        return;
      }

      setState({
        ...state,
        selectedMemoryId: card.dataset.memoryOpenId
      });
    });
  });

  app.querySelectorAll('[data-action="open-memory-detail"]').forEach((button) => {
    button.addEventListener("click", () => {
      setState({
        ...state,
        selectedMemoryId: button.dataset.memoryId
      });
    });
  });

  app.querySelector('[data-action="close-memory-detail"]')?.addEventListener("click", () => {
    setState({
      ...state,
      selectedMemoryId: null
    });
  });

  app.querySelectorAll('[data-action="edit-memory"]').forEach((button) => {
    button.addEventListener("click", () => {
      setState({
        ...state,
        selectedMemoryId: button.dataset.memoryId,
        editingMemoryId: button.dataset.memoryId
      });
    });
  });

  app.querySelectorAll('[data-action="cancel-edit-memory"]').forEach((button) => {
    button.addEventListener("click", () => {
      setState({
        ...state,
        editingMemoryId: null
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
    editingMemoryId: null,
    selectedEntityId: null,
    selectedMemoryId: null,
    selectedNodeId: null,
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
      editingMemoryId: null,
      selectedEntityId: null,
      selectedMemoryId: next.contexts[0]?.memoryIds[0] ?? state.selectedMemoryId,
      selectedNodeId: null,
      selectedActionId: newActionId
    };
    return next;
  });
}

function handleManualSource(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const input = {
    kind: String(form.get("kind") || "manual_note"),
    title: String(form.get("title") || "").trim(),
    body: String(form.get("body") || "").trim(),
    externalRef: String(form.get("externalRef") || "").trim(),
    occurredAt: String(form.get("occurredAt") || "").trim(),
    participants: parseList(form.get("participants")),
    tags: parseList(form.get("tags")),
    importance: String(form.get("importance") || "medium")
  };

  if (!input.body) {
    return;
  }

  updateActiveProject((project) => {
    const next = addManualSource(project, input);
    state = {
      ...state,
      editingMemoryId: null,
      selectedEntityId: null,
      selectedMemoryId: null,
      selectedNodeId: null
    };
    return next;
  });
}

function handleEditMemory(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const memoryId = event.currentTarget.dataset.memoryId;
  const input = {
    title: String(form.get("title") || "").trim(),
    type: String(form.get("type") || ""),
    content: String(form.get("content") || "").trim(),
    status: String(form.get("status") || "draft")
  };

  if (!memoryId || !input.title || !input.content) {
    return;
  }

  updateActiveProject((project) => {
    state = {
      ...state,
      selectedMemoryId: memoryId,
      editingMemoryId: null
    };
    return updateMemory(project, memoryId, input);
  });
}

function handleRecordResult(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const actionId = event.currentTarget.dataset.actionId;
  const summary = String(form.get("summary") || "").trim();
  const outcome = String(form.get("outcome") || "neutral");
  const whatChanged = String(form.get("whatChanged") || "").trim();
  const newEvidence = String(form.get("newEvidence") || "").trim();
  const followUpNeeded = form.get("followUpNeeded") === "true";

  if (!summary) {
    return;
  }

  updateActiveProject((project) => {
    const next = recordActionResult(project, actionId, {
      summary,
      outcome,
      whatChanged,
      newEvidence,
      followUpNeeded
    });
    const nextAction =
      next.actions.find((action) => action.status !== "done" && action.id !== actionId) ||
      next.actions.find((action) => action.status !== "done");

    state = {
      ...state,
      editingMemoryId: null,
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

function focusCommandTarget(targetType, targetId, targetAnchor) {
  const nextState = {
    ...state,
    selectedActionId: targetType === "action" ? targetId : state.selectedActionId,
    selectedMemoryId: targetType === "memory" ? targetId : state.selectedMemoryId,
    selectedNodeId: targetType === "node" ? targetId : state.selectedNodeId
  };

  setState(nextState);
  scrollToAnchor(targetAnchor);
}

function scrollToAnchor(anchor) {
  const id = String(anchor || "").replace(/^#/, "");
  if (!id) {
    return;
  }

  window.requestAnimationFrame(() => {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    target.scrollIntoView({ block: "center", behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  });
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
