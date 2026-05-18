import {
  ACTION_STATUS,
  ACTION_TYPES,
  CONTEXT_IMPORTANCE,
  CONTEXT_IMPORTANCE_LABELS,
  CONTEXT_TYPES,
  ENTITY_STATUS,
  ENTITY_TYPES,
  MEMORY_STATUS,
  MEMORY_TYPES,
  PRIORITY_LABELS,
  RESULT_OUTCOMES,
  RISK_LABELS,
  SIGNAL_STATUS,
  SIGNAL_TYPES,
  SOURCE_STATUS,
  SOURCE_TYPES,
  SOURCE_TYPE_LABELS
} from "../domain/types.js";

const MEMORY_STATUS_ACTIONS = [
  { status: "confirmed", label: "确认" },
  { status: "outdated", label: "过期" },
  { status: "disputed", label: "争议" },
  { status: "archived", label: "归档" }
];

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
        ${renderInbox(project)}
        <div class="work-grid">
          <section class="panel intake-panel">
            ${renderContextIntake(project)}
          </section>
          <section class="panel memory-panel">
            ${renderMemories(project, state.editingMemoryId, state.selectedMemoryId)}
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
    ["Source", project.sources?.length || 0],
    ["Signal", project.signals?.length || 0],
    ["公司记忆", project.memories.length],
    ["下一步行动", project.actions.filter((action) => action.status !== "done").length],
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

function renderInbox(project) {
  const sources = project.sources || [];

  return `
    <section class="panel inbox-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Company Inbox</p>
          <h3>手动 Source 录入</h3>
        </div>
        <span class="count-pill">${sources.length}</span>
      </div>

      <div class="inbox-layout">
        <form class="stack-form" data-form="manual-source">
          <div class="field-row">
            <label>
              信息类型
              <select name="kind">
                ${SOURCE_TYPES.map(
                  (type) => `<option value="${type.id}">${escapeHtml(type.label)}</option>`
                ).join("")}
              </select>
            </label>
            <label>
              标题
              <input name="title" type="text" placeholder="例如：客户 A 预算反馈" />
            </label>
          </div>
          <div class="field-row">
            <label>
              发生时间
              <input name="occurredAt" type="date" value="${escapeHtml(todayForInput())}" />
            </label>
            <label>
              重要程度
              <select name="importance">
                ${CONTEXT_IMPORTANCE.map(
                  (item) => `<option value="${item.id}" ${item.id === "medium" ? "selected" : ""}>${escapeHtml(item.label)}</option>`
                ).join("")}
              </select>
            </label>
          </div>
          <div class="field-row">
            <label>
              参与对象
              <input name="participants" type="text" placeholder="例如：客户 A, CFO, 李雷" />
            </label>
            <label>
              原始来源
              <input name="externalRef" type="text" placeholder="例如：邮件主题、文档链接或会议名" />
            </label>
          </div>
          <label>
            标签
            <input name="tags" type="text" placeholder="例如：预算, 试点, 风险" />
          </label>
          <label>
            原文
            <textarea name="body" rows="7" placeholder="粘贴邮件、Slack、会议纪要、网页摘录或临时业务碎片" required></textarea>
          </label>
          <button class="primary-button" type="submit">
            <span>保存为 Source</span>
            <span>→</span>
          </button>
        </form>

        <div class="inbox-review-column">
          ${renderSources(sources)}
          ${renderSignals(project)}
        </div>
      </div>
    </section>
  `;
}

function renderSources(sources) {
  if (!sources.length) {
    return emptyState("暂无 Source，先粘贴一段真实业务信息。");
  }

  return `
    <div class="source-list">
      <div class="context-history-heading">
        <strong>最近 Source</strong>
        <span class="count-pill">${sources.length}</span>
      </div>
      ${sources.slice(0, 6).map(renderSourceItem).join("")}
    </div>
  `;
}

function renderSourceItem(source) {
  const tags = Array.isArray(source.tags) ? source.tags : [];
  const participants = Array.isArray(source.participants) ? source.participants : [];

  return `
    <article class="source-item" id="source-${escapeHtml(source.id)}">
      <div class="context-item-top">
        <span class="context-type">${escapeHtml(sourceTypeLabel(source.kind))}</span>
        <span class="status ${escapeHtml(source.status || "new")}">${escapeHtml(sourceStatusLabel(source.status))}</span>
        <span class="importance ${escapeHtml(source.importance || "medium")}">
          ${escapeHtml(CONTEXT_IMPORTANCE_LABELS[source.importance] || CONTEXT_IMPORTANCE_LABELS.medium)}
        </span>
      </div>
      <h4>${escapeHtml(source.title)}</h4>
      <p>${escapeHtml(source.body)}</p>
      <div class="context-meta">
        <span>${escapeHtml(formatDateOnly(source.occurredAt || source.receivedAt))}</span>
        ${participants.length ? `<span>${escapeHtml(participants.join("、"))}</span>` : ""}
        ${source.externalRef ? `<span>${escapeHtml(source.externalRef)}</span>` : ""}
      </div>
      ${
        tags.length
          ? `<div class="context-tags">
              ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>`
          : ""
      }
      <div class="source-actions">
        <button class="secondary-button compact-button" data-action="process-source" data-source-id="${escapeHtml(source.id)}" type="button">
          提取 Signal
        </button>
      </div>
    </article>
  `;
}

function renderSignals(project) {
  const signals = project.signals || [];
  if (!signals.length) {
    return "";
  }

  return `
    <div class="signal-list">
      <div class="context-history-heading">
        <strong>最新 Signal</strong>
        <span class="count-pill">${signals.length}</span>
      </div>
      ${signals.slice(0, 6).map((signal) => renderSignalItem(project, signal)).join("")}
    </div>
  `;
}

function renderSignalItem(project, signal) {
  const source = (project.sources || []).find((item) => item.id === signal.sourceId);
  const entities = (signal.suggestedEntityIds || [])
    .map((entityId) => (project.entities || []).find((entity) => entity.id === entityId))
    .filter(Boolean);
  const projects = (signal.suggestedProjectIds || [])
    .map((projectId) => (projectId === project.id ? project : null))
    .filter(Boolean);

  return `
    <article class="signal-item" id="signal-${escapeHtml(signal.id)}">
      <div class="context-item-top">
        <span class="context-type">${escapeHtml(signalTypeLabel(signal.type))}</span>
        <span class="status ${escapeHtml(signal.status || "new")}">${escapeHtml(signalStatusLabel(signal.status))}</span>
        <span>${escapeHtml(confidenceScoreLabel(signal.confidence))}</span>
      </div>
      <h4>${escapeHtml(signal.title)}</h4>
      <p>${escapeHtml(signal.summary)}</p>
      <blockquote>${escapeHtml(signal.quote || signal.summary)}</blockquote>
      <div class="context-meta">
        <span>${escapeHtml(source?.title || "未知 Source")}</span>
        <span>${escapeHtml(formatDateOnly(signal.createdAt))}</span>
      </div>
      ${renderSignalSuggestions(entities, projects)}
      <div class="source-actions">
        <button class="secondary-button compact-button" data-action="suggest-signal-links" data-signal-id="${escapeHtml(signal.id)}" type="button">
          建议关联
        </button>
      </div>
    </article>
  `;
}

function renderSignalSuggestions(entities, projects) {
  if (!entities.length && !projects.length) {
    return `<p class="muted compact-copy">尚未建议 Entity / Project。</p>`;
  }

  return `
    <div class="signal-suggestions">
      ${
        entities.length
          ? `<div>
              <strong>Entity</strong>
              <div class="context-tags">
                ${entities
                  .map(
                    (entity) =>
                      `<span>${escapeHtml(entity.name)} · ${escapeHtml(entityTypeLabel(entity.type))} · ${escapeHtml(entityStatusLabel(entity.status))}</span>`
                  )
                  .join("")}
              </div>
            </div>`
          : ""
      }
      ${
        projects.length
          ? `<div>
              <strong>Project</strong>
              <div class="context-tags">
                ${projects.map((item) => `<span>${escapeHtml(item.name)}</span>`).join("")}
              </div>
            </div>`
          : ""
      }
    </div>
  `;
}

function renderContextIntake(project) {
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
      <div class="field-row">
        <label>
          发生日期
          <input name="occurredAt" type="date" value="${escapeHtml(todayForInput())}" />
        </label>
        <label>
          重要程度
          <select name="importance">
            ${CONTEXT_IMPORTANCE.map(
              (item) => `<option value="${item.id}" ${item.id === "medium" ? "selected" : ""}>${escapeHtml(item.label)}</option>`
            ).join("")}
          </select>
        </label>
      </div>
      <div class="field-row">
        <label>
          参与人
          <input name="participants" type="text" placeholder="例如：客户 A, 李雷" />
        </label>
        <label>
          标签
          <input name="tags" type="text" placeholder="例如：试点, 权限" />
        </label>
      </div>
      <label>
        原始文本
        <textarea name="body" rows="8" placeholder="粘贴会议纪要、客户反馈、投资人问题、工程进展或创始人笔记" required></textarea>
      </label>
      <button class="primary-button" type="submit">
        <span>吸收上下文</span>
        <span>→</span>
      </button>
    </form>

    ${renderReconciliationSummary(project)}
    ${renderContexts(project)}
  `;
}

function renderReconciliationSummary(project) {
  const results = latestReconciliationResults(project);
  if (!results.length) {
    return "";
  }

  const counts = countReconciliationOperations(results);
  const reviewCount = counts.conflict + counts.outdate;

  return `
    <div class="reconciliation-summary" data-reconciliation-summary>
      <div>
        <p class="eyebrow">Reconcile</p>
        <strong>记忆校准</strong>
      </div>
      <div class="reconciliation-pills">
        <span>新增 ${counts.new}</span>
        <span>跳过重复 ${counts.duplicate}</span>
        <span>更新建议 ${counts.update}</span>
        <span>冲突/过期 ${reviewCount}</span>
      </div>
    </div>
  `;
}

function renderContexts(project) {
  const contexts = project?.contexts || [];
  if (!contexts.length) {
    return emptyState("暂无上下文");
  }

  return `
    <div class="context-history">
      <div class="context-history-heading">
        <strong>最近上下文</strong>
        <span class="count-pill">${contexts.length}</span>
      </div>
      <div class="context-list">
        ${contexts.slice(0, 6).map(renderContextItem).join("")}
      </div>
    </div>
  `;
}

function renderContextItem(context) {
  const tags = Array.isArray(context.tags) ? context.tags : [];
  const participants = Array.isArray(context.participants) ? context.participants : [];

  return `
    <article class="context-item" id="context-${escapeHtml(context.id)}">
      <div class="context-item-top">
        <span class="context-type">${escapeHtml(contextTypeLabel(context.kind))}</span>
        <span class="importance ${escapeHtml(context.importance || "medium")}">
          ${escapeHtml(CONTEXT_IMPORTANCE_LABELS[context.importance] || CONTEXT_IMPORTANCE_LABELS.medium)}
        </span>
      </div>
      <h4>${escapeHtml(context.title)}</h4>
      <div class="context-meta">
        <span>${escapeHtml(formatDateOnly(context.occurredAt || context.createdAt))}</span>
        ${
          participants.length
            ? `<span>${escapeHtml(participants.join("、"))}</span>`
            : ""
        }
      </div>
      ${
        tags.length
          ? `<div class="context-tags">
              ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>`
          : ""
      }
    </article>
  `;
}

function renderMemories(project, editingMemoryId, selectedMemoryId) {
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
                  .map((memory) =>
                    memory.id === editingMemoryId
                      ? renderMemoryEditForm(memory)
                      : renderMemoryItem(project, memory, memory.id === selectedMemoryId)
                  )
                  .join("")}
              </div>
            </article>
          `
        )
        .join("")}
    </div>

    ${renderMemoryDetailPanel(project, selectedMemoryId)}
  `;
}

function renderMemoryItem(project, memory, isSelected = false) {
  const status = memoryStatusMeta(memory.status);
  const sourceCount = Array.isArray(memory.sourceReferences) ? memory.sourceReferences.length : 0;
  const sourceLabel = memorySourceLabel(memory);

  return `
    <div class="memory-item ${isSelected ? "selected" : ""}" data-memory-open-id="${escapeHtml(memory.id)}">
      <div class="memory-item-top">
        <span class="memory-status ${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>
        <span>${escapeHtml(sourceCountLabel(sourceCount, sourceLabel))}</span>
        <span>${escapeHtml(confidenceLabel(memory.confidence))}</span>
      </div>
      <h4>${escapeHtml(memory.title)}</h4>
      <p>${escapeHtml(memoryContent(memory))}</p>
      ${renderMemoryStatusActions(memory)}
      ${renderMemorySources(project, memory, sourceLabel)}
      <div class="memory-card-actions">
        <button class="secondary-button compact-button" data-action="open-memory-detail" data-memory-id="${escapeHtml(memory.id)}" type="button" aria-label="查看详情 ${escapeHtml(memory.title)}" title="查看记忆详情">详情</button>
        <button class="secondary-button compact-button" data-action="edit-memory" data-memory-id="${escapeHtml(memory.id)}" type="button" aria-label="编辑 ${escapeHtml(memory.title)}" title="编辑记忆">编辑</button>
      </div>
    </div>
  `;
}

function renderMemoryDetailPanel(project, memoryId) {
  const memory = project.memories.find((item) => item.id === memoryId);
  if (!memory) {
    return "";
  }

  const status = memoryStatusMeta(memory.status);
  const typeMeta = MEMORY_TYPES[memory.type] || MEMORY_TYPES.fact;
  const relatedActions = actionsForMemory(project, memory.id);
  const relatedResults = resultsForMemory(project, memory.id, relatedActions);

  return `
    <article class="memory-detail-panel" aria-label="记忆详情">
      <div class="memory-detail-heading">
        <div>
          <p class="eyebrow">Memory Detail</p>
          <h4>${escapeHtml(memory.title)}</h4>
        </div>
        <button class="ghost-button compact-button" data-action="close-memory-detail" type="button">关闭</button>
      </div>

      <div class="memory-detail-meta">
        <span class="memory-status ${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>
        <span>${escapeHtml(typeMeta.label || memory.type)}</span>
        <span>${escapeHtml(confidenceLabel(memory.confidence))}</span>
      </div>

      <section class="memory-detail-section">
        <h5>完整内容</h5>
        <p>${escapeHtml(memoryContent(memory))}</p>
      </section>

      <section class="memory-detail-section">
        <h5>来源与引用</h5>
        ${renderMemoryDetailSources(project, memory)}
      </section>

      <section class="memory-detail-section">
        <h5>关联 actions</h5>
        ${renderRelatedActions(relatedActions)}
      </section>

      <section class="memory-detail-section">
        <h5>关联 results / memory updates</h5>
        ${renderRelatedResults(relatedResults, memory.id)}
      </section>

      <div class="memory-detail-actions">
        <button class="primary-button compact-button" data-action="edit-memory" data-memory-id="${escapeHtml(memory.id)}" type="button">进入编辑</button>
      </div>
    </article>
  `;
}

function renderMemoryDetailSources(project, memory) {
  const sourceReferences = Array.isArray(memory.sourceReferences)
    ? memory.sourceReferences.filter((reference) => reference?.contextId || reference?.quote)
    : [];

  if (!sourceReferences.length) {
    return `<p class="muted">${escapeHtml(memory.source || "来源待补")}</p>`;
  }

  return `
    <div class="memory-detail-list">
      ${sourceReferences
        .map((reference) => {
          const context = project.contexts.find((item) => item.id === reference.contextId);
          return `
            <article class="memory-detail-source">
              <div>
                <strong>${escapeHtml(context?.title || reference.note || "未知上下文")}</strong>
                <span>${escapeHtml(formatDateOnly(context?.occurredAt || context?.createdAt))}</span>
              </div>
              <blockquote>${escapeHtml(reference.quote || memoryContent(memory))}</blockquote>
              ${
                context?.body
                  ? `<details class="source-context">
                      <summary>Context 原文</summary>
                      <p>${escapeHtml(context.body)}</p>
                    </details>
                    <a class="secondary-link compact-button" href="#context-${escapeHtml(context.id)}">跳到原文</a>`
                  : ""
              }
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderRelatedActions(actions) {
  if (!actions.length) {
    return `<p class="muted">暂无关联 action</p>`;
  }

  return `
    <div class="memory-detail-list">
      ${actions
        .map(
          (action) => `
            <button class="memory-related-action" data-action-id="${escapeHtml(action.id)}" type="button">
              <span>${escapeHtml(ACTION_TYPES[action.type] || action.type)}</span>
              <strong>${escapeHtml(action.title)}</strong>
              <small>${escapeHtml(ACTION_STATUS[action.status] || action.status)}</small>
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderRelatedResults(results, memoryId) {
  if (!results.length) {
    return `<p class="muted">暂无关联 result</p>`;
  }

  return `
    <div class="memory-detail-list">
      ${results
        .map(
          (result) => `
            <article class="memory-detail-result">
              <strong>${escapeHtml(result.summary || result.outcome || "执行结果")}</strong>
              <span>${escapeHtml(formatDateOnly(result.createdAt))}</span>
              ${renderRelatedMemoryUpdates(result, memoryId)}
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderRelatedMemoryUpdates(result, memoryId) {
  const updates = Array.isArray(result.relatedMemoryUpdates)
    ? result.relatedMemoryUpdates.filter((update) => updateReferencesMemory(update, memoryId))
    : [];

  if (!updates.length) {
    return "";
  }

  return `
    <ul class="memory-update-list">
      ${updates
        .map(
          (update) => `
            <li>
              <span>${escapeHtml(update.kind || update.type || "update")}</span>
              ${escapeHtml(update.summary || update.note || update.reason || "")}
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

function renderMemorySources(project, memory) {
  const sourceReferences = Array.isArray(memory.sourceReferences)
    ? memory.sourceReferences.filter((reference) => reference?.contextId && reference?.quote)
    : [];

  if (!sourceReferences.length) {
    return `<small>${escapeHtml(memory.source || "来源待补")} · ${confidenceLabel(memory.confidence)}</small>`;
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
                ${renderSourceContext(project, reference.contextId)}
              </blockquote>
            `
          )
          .join("")}
      </details>
    </div>
  `;
}

function renderMemoryStatusActions(memory) {
  const currentStatus = memory.status || "draft";
  return `
    <div class="memory-status-actions" aria-label="记忆状态操作">
      ${MEMORY_STATUS_ACTIONS.filter((action) => action.status !== currentStatus)
        .map(
          (action) => `
            <button
              class="memory-status-action ${escapeHtml(action.status)}"
              data-action="update-memory-status"
              data-memory-id="${escapeHtml(memory.id)}"
              data-memory-status="${escapeHtml(action.status)}"
              type="button"
            >
              ${escapeHtml(action.label)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function contextTitle(project, contextId) {
  return project.contexts.find((context) => context.id === contextId)?.title || "未知上下文";
}

function renderSourceContext(project, contextId) {
  const context = project.contexts.find((item) => item.id === contextId);
  if (!context?.body) {
    return "";
  }

  return `
    <details class="source-context">
      <summary>查看 Context 原文</summary>
      <p>${escapeHtml(context.body)}</p>
    </details>
  `;
}

function renderMemoryEditForm(memory) {
  const status = memory.status || "draft";

  return `
    <form class="memory-item memory-edit-form" data-form="edit-memory" data-memory-id="${escapeHtml(memory.id)}">
      <label>
        标题
        <input name="title" type="text" value="${escapeHtml(memory.title)}" required />
      </label>
      <div class="field-row">
        <label>
          类型
          <select name="type">
            ${Object.entries(MEMORY_TYPES)
              .map(
                ([type, meta]) =>
                  `<option value="${escapeHtml(type)}" ${type === memory.type ? "selected" : ""}>${escapeHtml(meta.label)}</option>`
              )
              .join("")}
          </select>
        </label>
        <label>
          状态
          <select name="status">
            ${Object.entries(MEMORY_STATUS)
              .map(
                ([value, meta]) =>
                  `<option value="${escapeHtml(value)}" ${value === status ? "selected" : ""}>${escapeHtml(meta.label)}</option>`
              )
              .join("")}
          </select>
        </label>
      </div>
      <label>
        内容
        <textarea name="content" rows="5" required>${escapeHtml(memoryContent(memory))}</textarea>
      </label>
      <div class="memory-edit-actions">
        <button class="primary-button" type="submit">保存</button>
        <button class="ghost-button" data-action="cancel-edit-memory" type="button">取消</button>
      </div>
    </form>
  `;
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

function latestReconciliationResults(project) {
  const allResults = Array.isArray(project.reconciliationResults) ? project.reconciliationResults : [];
  const latestContext = project.contexts.find(
    (context) => Array.isArray(context.reconciliationResultIds) && context.reconciliationResultIds.length
  );

  if (!latestContext) {
    return allResults.slice(0, 8);
  }

  const ids = new Set(latestContext.reconciliationResultIds);
  return allResults.filter((result) => ids.has(result.id));
}

function countReconciliationOperations(results) {
  return results.reduce(
    (counts, result) => {
      if (counts[result.operation] !== undefined) {
        counts[result.operation] += 1;
      }
      return counts;
    },
    {
      new: 0,
      duplicate: 0,
      update: 0,
      conflict: 0,
      outdate: 0
    }
  );
}

function actionsForMemory(project, memoryId) {
  return project.actions.filter((action) => actionMemoryIds(action).includes(memoryId));
}

function resultsForMemory(project, memoryId, relatedActions) {
  const relatedActionIds = new Set(relatedActions.map((action) => action.id));

  return project.results.filter(
    (result) =>
      (Array.isArray(result.memoryIds) && result.memoryIds.includes(memoryId)) ||
      relatedActionIds.has(result.actionId) ||
      (Array.isArray(result.relatedMemoryUpdates) &&
        result.relatedMemoryUpdates.some((update) => updateReferencesMemory(update, memoryId)))
  );
}

function actionMemoryIds(action) {
  return [
    ...(Array.isArray(action.sourceMemoryIds) ? action.sourceMemoryIds : []),
    ...(Array.isArray(action.evidenceMemoryIds) ? action.evidenceMemoryIds : [])
  ];
}

function updateReferencesMemory(update, memoryId) {
  return [
    update?.memoryId,
    update?.sourceMemoryId,
    update?.targetMemoryId,
    update?.previousMemoryId,
    update?.nextMemoryId
  ].includes(memoryId);
}

function memoryContent(memory) {
  return memory.content || memory.detail || "";
}

function memorySource(memory) {
  const sourceCount = memory.sourceReferences?.length ?? 0;
  if (sourceCount > 0) {
    return `${sourceCount} 个来源`;
  }

  return memory.source || "来源待补";
}

function memoryStatusLabel(status) {
  return MEMORY_STATUS[status] || MEMORY_STATUS.draft;
}

function confidenceLabel(confidence) {
  const labels = {
    high: "高置信",
    medium: "中置信",
    low: "低置信"
  };

  return labels[confidence] || "待确认";
}

function memoryStatusMeta(status) {
  return MEMORY_STATUS[status] || MEMORY_STATUS.draft;
}

function sourceCountLabel(count, sourceLabel) {
  if (count > 0) {
    return `来源 ${count}`;
  }

  return sourceLabel !== "来源待补" ? "旧来源" : "来源待补";
}

function memorySourceLabel(memory) {
  return memory.source || memory.sourceReferences?.[0]?.note || "来源待补";
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

function formatDateOnly(value) {
  if (!value) {
    return "未记录";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function todayForInput() {
  return new Date().toISOString().slice(0, 10);
}

function contextTypeLabel(kind) {
  return CONTEXT_TYPES.find((type) => type.id === kind)?.label || "其他上下文";
}

function sourceTypeLabel(kind) {
  return SOURCE_TYPE_LABELS[kind] || "其他来源";
}

function sourceStatusLabel(status) {
  return SOURCE_STATUS[status] || SOURCE_STATUS.new;
}

function signalTypeLabel(type) {
  return SIGNAL_TYPES[type] || "业务信号";
}

function signalStatusLabel(status) {
  return SIGNAL_STATUS[status] || SIGNAL_STATUS.new;
}

function entityTypeLabel(type) {
  return ENTITY_TYPES[type] || ENTITY_TYPES.other;
}

function entityStatusLabel(status) {
  return ENTITY_STATUS[status] || ENTITY_STATUS.watching;
}

function confidenceScoreLabel(confidence) {
  if (typeof confidence !== "number") {
    return "待评分";
  }

  return `${Math.round(confidence * 100)}%`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
