import {
  ACTION_STATUS,
  ACTION_TYPES,
  CONTEXT_TYPES,
  MEMORY_TYPES,
  PRIORITY_LABELS,
  RESULT_OUTCOMES,
  RISK_LABELS
} from "../domain/types.js";

export function renderApp(state) {
  const project = getActiveProject(state);
  const selectedAction = project?.actions.find((action) => action.id === state.selectedActionId);
  const selectedBrief = selectedAction
    ? project.briefs.find((brief) => brief.actionId === selectedAction.id)
    : null;

  return `
    <div class="shell">
      ${renderSidebar(state, project)}
      <main class="workspace">
        ${renderTopbar(project)}
        ${renderPipeline(project)}
        <div class="work-grid">
          <section class="panel intake-panel">
            ${renderContextIntake()}
          </section>
          <section class="panel memory-panel">
            ${renderMemories(project)}
          </section>
          <section class="panel action-panel">
            ${renderActions(project, state.selectedActionId)}
          </section>
          <section class="panel brief-panel">
            ${renderBrief(project, selectedAction, selectedBrief)}
          </section>
        </div>
      </main>
    </div>
  `;
}

function renderSidebar(state, activeProject) {
  return `
    <aside class="sidebar">
      <div class="brand-block">
        <div class="brand-mark">TM</div>
        <div>
          <h1>TeamMind</h1>
          <p>Company Context Agent</p>
        </div>
      </div>

      <form class="create-project" data-form="create-project">
        <label for="project-name">新项目</label>
        <div class="inline-form">
          <input id="project-name" name="name" type="text" placeholder="团队或创业项目名" required />
          <button class="icon-button" type="submit" aria-label="创建项目" title="创建项目">+</button>
        </div>
      </form>

      <div class="project-list" aria-label="项目列表">
        ${state.projects
          .map(
            (project) => `
              <button class="project-item ${project.id === activeProject?.id ? "active" : ""}" data-project-id="${project.id}" type="button">
                <span>${escapeHtml(project.name)}</span>
                <small>${escapeHtml(project.stage)}</small>
              </button>
            `
          )
          .join("")}
      </div>

      <div class="sidebar-actions">
        <button class="ghost-button" data-action="reset-demo" type="button">重置 Demo</button>
        <button class="ghost-button" data-action="export-json" type="button">导出 JSON</button>
      </div>
    </aside>
  `;
}

function renderTopbar(project) {
  if (!project) {
    return "";
  }

  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">项目空间</p>
        <h2>${escapeHtml(project.name)}</h2>
      </div>
      <div class="project-meta">
        <span>${escapeHtml(project.stage)}</span>
        <span>更新 ${formatDate(project.updatedAt)}</span>
      </div>
    </header>
  `;
}

function renderPipeline(project) {
  const steps = [
    ["上下文", project.contexts.length],
    ["公司记忆", project.memories.length],
    ["下一步行动", project.actions.filter((action) => action.status !== "done").length],
    ["行动 Brief", project.briefs.length],
    ["结果回流", project.results.length]
  ];

  return `
    <section class="pipeline" aria-label="产品闭环">
      ${steps
        .map(
          ([label, value], index) => `
            <div class="pipeline-step">
              <strong>${value}</strong>
              <span>${label}</span>
            </div>
            ${index < steps.length - 1 ? '<div class="pipeline-arrow">→</div>' : ""}
          `
        )
        .join("")}
    </section>
  `;
}

function renderContextIntake() {
  return `
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Input</p>
        <h3>上下文输入</h3>
      </div>
    </div>

    <form class="stack-form" data-form="absorb-context">
      <div class="field-row">
        <label>
          类型
          <select name="kind">
            ${CONTEXT_TYPES.map(
              (type) => `<option value="${type.id}">${escapeHtml(type.label)}</option>`
            ).join("")}
          </select>
        </label>
        <label>
          标题
          <input name="title" type="text" placeholder="例如：周三客户访谈" />
        </label>
      </div>
      <label>
        原始文本
        <textarea name="body" rows="11" placeholder="粘贴会议纪要、客户反馈、投资人问题、工程进展或创始人笔记" required></textarea>
      </label>
      <button class="primary-button" type="submit">
        <span>吸收上下文</span>
        <span>→</span>
      </button>
    </form>
  `;
}

function renderMemories(project) {
  if (!project.memories.length) {
    return emptyState("暂无公司记忆");
  }

  const grouped = Object.entries(MEMORY_TYPES)
    .map(([type, meta]) => ({
      type,
      meta,
      memories: project.memories.filter((memory) => memory.type === type)
    }))
    .filter((group) => group.memories.length > 0);

  return `
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Memory</p>
        <h3>公司记忆</h3>
      </div>
      <span class="count-pill">${project.memories.length}</span>
    </div>

    <div class="memory-groups">
      ${grouped
        .map(
          (group) => `
            <article class="memory-group">
              <div class="memory-group-title">
                <span class="type-dot ${group.meta.tone}"></span>
                <strong>${escapeHtml(group.meta.label)}</strong>
                <span>${group.memories.length}</span>
              </div>
              <div class="memory-list">
                ${group.memories
                  .slice(0, 4)
                  .map(
                    (memory) => `
                      <div class="memory-item">
                        <h4>${escapeHtml(memory.title)}</h4>
                        <p>${escapeHtml(memory.detail)}</p>
                        ${renderMemorySources(project, memory)}
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMemorySources(project, memory) {
  const sourceReferences = Array.isArray(memory.sourceReferences)
    ? memory.sourceReferences.filter((reference) => reference?.contextId && reference?.quote)
    : [];

  if (!sourceReferences.length) {
    return `<small>${escapeHtml(memory.source)} · ${confidenceLabel(memory.confidence)}</small>`;
  }

  const firstSourceTitle = contextTitle(project, sourceReferences[0].contextId);

  return `
    <div class="memory-sources">
      <small>来源 ${sourceReferences.length} · ${escapeHtml(firstSourceTitle)} · ${confidenceLabel(memory.confidence)}</small>
      <details>
        <summary>查看引用片段</summary>
        ${sourceReferences
          .map(
            (reference) => `
              <blockquote>
                <strong>${escapeHtml(contextTitle(project, reference.contextId))}</strong>
                <p>${escapeHtml(reference.quote)}</p>
              </blockquote>
            `
          )
          .join("")}
      </details>
    </div>
  `;
}

function contextTitle(project, contextId) {
  return project.contexts.find((context) => context.id === contextId)?.title || "未知上下文";
}

function renderActions(project, selectedActionId) {
  const openActions = project.actions.filter((action) => action.status !== "done");
  const doneActions = project.actions.filter((action) => action.status === "done");

  return `
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Action</p>
        <h3>下一步行动</h3>
      </div>
      <span class="count-pill">${openActions.length}</span>
    </div>

    ${
      openActions.length
        ? `<div class="action-list">
            ${openActions.map((action) => renderActionCard(action, selectedActionId)).join("")}
          </div>`
        : emptyState("暂无待处理行动")
    }

    ${
      doneActions.length
        ? `<details class="done-actions">
            <summary>已回流行动 ${doneActions.length}</summary>
            ${doneActions.map((action) => renderActionCard(action, selectedActionId)).join("")}
          </details>`
        : ""
    }
  `;
}

function renderActionCard(action, selectedActionId) {
  return `
    <button class="action-card ${action.id === selectedActionId ? "selected" : ""}" data-action-id="${action.id}" type="button">
      <div class="action-card-top">
        <span class="action-type">${escapeHtml(ACTION_TYPES[action.type] || action.type)}</span>
        <span class="status ${action.status}">${escapeHtml(ACTION_STATUS[action.status])}</span>
      </div>
      <h4>${escapeHtml(action.title)}</h4>
      <p>${escapeHtml(action.rationale)}</p>
      <div class="action-tags">
        <span>优先级 ${escapeHtml(PRIORITY_LABELS[action.priority])}</span>
        <span>${escapeHtml(RISK_LABELS[action.riskLevel])}</span>
      </div>
    </button>
  `;
}

function renderBrief(project, action, brief) {
  if (!action) {
    return emptyState("选择一个行动");
  }

  return `
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Brief</p>
        <h3>行动 Brief</h3>
      </div>
      ${
        brief
          ? '<span class="status briefed">已生成</span>'
          : `<button class="secondary-button" data-action="generate-brief" data-action-id="${action.id}" type="button">生成 Brief</button>`
      }
    </div>

    <article class="brief-card">
      <div class="brief-title">
        <span>${escapeHtml(ACTION_TYPES[action.type] || action.type)}</span>
        <h4>${escapeHtml(action.title)}</h4>
      </div>
      ${
        brief
          ? renderBriefSections(brief)
          : `<p class="muted">${escapeHtml(action.expectedOutput)}</p>`
      }
    </article>

    <form class="result-form" data-form="record-result" data-action-id="${action.id}">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">Loop</p>
          <h3>结果回流</h3>
        </div>
      </div>
      <label>
        执行结果
        <textarea name="summary" rows="5" placeholder="记录客户回复、工程结果、投资人反馈或新的阻塞" required></textarea>
      </label>
      <div class="field-row">
        <label>
          结果
          <select name="outcome">
            ${RESULT_OUTCOMES.map(
              (outcome) => `<option value="${outcome.id}">${escapeHtml(outcome.label)}</option>`
            ).join("")}
          </select>
        </label>
        <button class="primary-button" type="submit">
          <span>回流并更新记忆</span>
          <span>✓</span>
        </button>
      </div>
    </form>
  `;
}

function renderBriefSections(brief) {
  const sections = [
    ["目标", brief.sections.goal],
    ["已知背景", brief.sections.background],
    ["建议策略", brief.sections.strategy],
    ["草稿内容", brief.sections.draft],
    ["风险提醒", brief.sections.risks],
    ["成功标准", brief.sections.successCriteria],
    ["人工确认清单", brief.sections.checklist]
  ];

  return `
    <div class="brief-sections">
      ${sections
        .map(
          ([title, content]) => `
            <section class="brief-section">
              <h5>${escapeHtml(title)}</h5>
              ${renderSectionContent(content)}
            </section>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSectionContent(content) {
  if (Array.isArray(content)) {
    return `
      <ul>
        ${content.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `;
  }

  return `<pre>${escapeHtml(content)}</pre>`;
}

function emptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

export function getActiveProject(state) {
  return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0];
}

function confidenceLabel(confidence) {
  const labels = {
    high: "高置信",
    medium: "中置信",
    low: "低置信"
  };

  return labels[confidence] || "待确认";
}

function formatDate(value) {
  if (!value) {
    return "刚刚";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
