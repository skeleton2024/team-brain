import {
  ACTION_STATUS,
  ACTION_TYPES,
  COMMITMENT_STATUS,
  COMMITMENT_TYPES,
  CONTEXT_IMPORTANCE,
  CONTEXT_IMPORTANCE_LABELS,
  CONTEXT_TYPES,
  ENTITY_STATUS,
  ENTITY_TYPES,
  MEMORY_STATUS,
  MEMORY_TYPES,
  IMPACT_LABELS,
  OPPORTUNITY_STATUS,
  PRIORITY_LABELS,
  PROJECT_NODE_STATUS,
  RESULT_OUTCOMES,
  RISK_LABELS,
  RISK_STATUS,
  SIGNAL_STATUS,
  SIGNAL_TYPES,
  SOURCE_STATUS,
  SOURCE_TYPES,
  SOURCE_TYPE_LABELS
} from "../domain/types.js";
import { buildCommandCenter } from "../domain/pipelines/buildCommandCenter.js";

const MEMORY_STATUS_ACTIONS = [
  { status: "confirmed", label: "确认" },
  { status: "outdated", label: "过期" },
  { status: "disputed", label: "争议" },
  { status: "archived", label: "归档" }
];

const ENTITY_STATUS_ACTIONS = [
  { status: "active", label: "活跃" },
  { status: "watching", label: "观察" },
  { status: "inactive", label: "不活跃" },
  { status: "archived", label: "归档" }
];

const PROJECT_NODE_STATUS_ACTIONS = [
  { status: "planned", label: "计划" },
  { status: "active", label: "推进" },
  { status: "blocked", label: "阻塞" },
  { status: "done", label: "完成" },
  { status: "archived", label: "归档" }
];

const BRIEF_SECTION_LABELS = {
  goal: "目标",
  background: "已知背景",
  entityContext: "相关 Entity",
  projectNodeContext: "相关节点",
  memoryGovernance: "证据治理",
  customerConcern: "客户顾虑",
  replyStrategy: "回复策略",
  draftMessage: "草稿内容",
  doNotPromise: "不要承诺",
  nextQuestions: "下一步问题",
  investorQuestion: "投资人问题",
  shortAnswer: "简短回答",
  evidenceWeHave: "已有证据",
  evidenceMissing: "证据缺口",
  suggestedWording: "建议话术",
  doNotSay: "不要这样说",
  followUpMaterials: "后续材料",
  founderConfirmationChecklist: "创始人确认清单",
  scope: "实现范围",
  nonGoals: "不做范围",
  acceptanceCriteria: "验收标准",
  testPlan: "测试计划",
  risks: "风险提醒",
  reviewChecklist: "Review 清单",
  strategy: "建议策略",
  draft: "草稿内容",
  successCriteria: "成功标准",
  checklist: "人工确认清单",
  humanConfirmationChecklist: "人工确认清单"
};

const BRIEF_SECTION_ORDER = {
  customer_followup: [
    "background",
    "entityContext",
    "projectNodeContext",
    "memoryGovernance",
    "customerConcern",
    "replyStrategy",
    "draftMessage",
    "doNotPromise",
    "nextQuestions",
    "successCriteria",
    "humanConfirmationChecklist"
  ],
  investor_reply: [
    "investorQuestion",
    "shortAnswer",
    "entityContext",
    "memoryGovernance",
    "evidenceWeHave",
    "evidenceMissing",
    "suggestedWording",
    "doNotSay",
    "followUpMaterials",
    "founderConfirmationChecklist"
  ],
  coding_brief: [
    "goal",
    "background",
    "projectNodeContext",
    "memoryGovernance",
    "scope",
    "nonGoals",
    "acceptanceCriteria",
    "testPlan",
    "risks",
    "reviewChecklist"
  ],
  default: [
    "goal",
    "background",
    "entityContext",
    "projectNodeContext",
    "memoryGovernance",
    "strategy",
    "draft",
    "risks",
    "successCriteria",
    "checklist"
  ]
};

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
        ${renderCommandCenter(project)}
        ${renderPipeline(project)}
        ${renderInbox(project)}
        ${renderEntityProfiles(project, state.selectedEntityId)}
        ${renderProjectNodes(project, state.selectedNodeId)}
        ${renderCommitments(project)}
        ${renderRiskOpportunityRadar(project)}
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

function renderCommandCenter(project) {
  const snapshot = buildCommandCenter({ project });

  return `
    <section class="command-center-panel" data-command-center>
      <div class="command-center-header">
        <div>
          <p class="eyebrow">Command Center</p>
          <h3>今天最该处理什么</h3>
        </div>
        <div class="command-health ${escapeHtml(snapshot.health.status)}" data-command-center-health>
          <strong>${escapeHtml(snapshot.health.label)}</strong>
          <span>${escapeHtml(snapshot.health.reasons[0] || "等待新信号")}</span>
        </div>
      </div>

      ${renderPriorityQueue(snapshot.priorityQueue)}

      <div class="command-metrics" aria-label="Command Center 指标">
        ${renderCommandMetric("Inbox", snapshot.metrics.inbox)}
        ${renderCommandMetric("Memory review", snapshot.metrics.memoryReview)}
        ${renderCommandMetric("Open action", snapshot.metrics.openActions)}
        ${renderCommandMetric("Risk", snapshot.metrics.risks)}
        ${renderCommandMetric("Opportunity", snapshot.metrics.opportunities)}
      </div>

      <div class="command-grid">
        <section class="command-section" data-command-center-inbox>
          <div class="command-section-heading">
            <h4>今日 Inbox</h4>
            <span>${snapshot.todayInbox.length}</span>
          </div>
          ${renderCommandList(snapshot.todayInbox, "没有待整理的 Source / Signal。", renderCommandInboxItem)}
        </section>

        <section class="command-section" data-command-center-actions>
          <div class="command-section-heading">
            <h4>行动焦点</h4>
            <span>${snapshot.actionFocus.length}</span>
          </div>
          ${renderCommandList(snapshot.actionFocus, "暂无待处理行动。", renderCommandActionItem)}
        </section>

        <section class="command-section" data-command-center-commitments>
          <div class="command-section-heading">
            <h4>承诺 / Waiting</h4>
            <span>${snapshot.commitmentFocus.length}</span>
          </div>
          ${renderCommandList(snapshot.commitmentFocus, "暂无承诺或等待项。", renderCommandCommitmentItem)}
        </section>

        <section class="command-section" data-command-center-memory-review>
          <div class="command-section-heading">
            <h4>记忆复核</h4>
            <span>${snapshot.memoryReview.length}</span>
          </div>
          ${renderCommandList(snapshot.memoryReview, "没有待复核 memory。", renderCommandMemoryItem)}
        </section>

        <section class="command-section" data-command-center-risk>
          <div class="command-section-heading">
            <h4>风险 / 机会</h4>
            <span>${snapshot.riskRadar.length + snapshot.opportunityRadar.length}</span>
          </div>
          ${renderRiskOpportunityPreview(snapshot)}
        </section>
      </div>
    </section>
  `;
}

function renderPriorityQueue(items) {
  return `
    <section class="priority-queue" data-priority-queue>
      <div class="command-section-heading">
        <h4>AI Priority Queue</h4>
        <span>${items.length}</span>
      </div>
      ${
        items.length
          ? `<div class="priority-list">
              ${items.map(renderPriorityItem).join("")}
            </div>`
          : `<div class="command-empty">暂无需要排序的事项。</div>`
      }
    </section>
  `;
}

function renderPriorityItem(item) {
  return `
    <article
      class="priority-item"
      data-priority-target-type="${escapeHtml(item.targetType || item.type)}"
      data-priority-target-id="${escapeHtml(item.targetId || "")}"
      data-priority-anchor="${escapeHtml(item.targetAnchor || "")}"
    >
      <div class="command-item-top">
        <span>${escapeHtml(priorityTypeLabel(item.type))}</span>
        <span>${escapeHtml(PRIORITY_LABELS[item.priority] || item.priority)}</span>
      </div>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.reason)}</p>
      <div class="priority-route">
        <span>下一步</span>
        <strong>${escapeHtml(item.nextStepLabel || "打开对象处理")}</strong>
      </div>
      ${renderCommandTargetLink(item)}
      ${renderCommandEvidence(item.evidenceLinks)}
    </article>
  `;
}

function renderCommandMetric(label, value) {
  return `
    <div class="command-metric">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function renderCommandList(items, emptyText, renderer) {
  if (!items.length) {
    return `<div class="command-empty">${escapeHtml(emptyText)}</div>`;
  }

  return `
    <div class="command-list">
      ${items.map((item) => renderer(item)).join("")}
    </div>
  `;
}

function renderCommandInboxItem(item) {
  return `
    <article class="command-item" ${commandTargetAttributes(item)}>
      <div class="command-item-top">
        <span>${escapeHtml(item.type === "source" ? "Source" : "Signal")}</span>
        <span>${escapeHtml(item.status)}</span>
      </div>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.summary)}</p>
      ${renderCommandTargetLink(item)}
      ${renderCommandEvidence(item.evidenceLinks)}
    </article>
  `;
}

function renderCommandActionItem(item) {
  return `
    <article class="command-item" ${commandTargetAttributes(item)}>
      <div class="command-item-top">
        <span>${escapeHtml(ACTION_TYPES[item.type] || item.type)}</span>
        <span>${escapeHtml(PRIORITY_LABELS[item.priority] || item.priority)}</span>
      </div>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.reason || "等待补充 why now。")}</p>
      ${renderCommandTargetLink(item)}
      ${renderCommandEvidence(item.evidenceLinks)}
    </article>
  `;
}

function renderCommandCommitmentItem(item) {
  return `
    <article class="command-item" ${commandTargetAttributes(item)}>
      <div class="command-item-top">
        <span>${escapeHtml(commitmentTypeLabel(item.type))}</span>
        <span>${escapeHtml(commitmentStatusLabel(item.status))}</span>
      </div>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(commitmentLine(item))}</p>
      ${renderCommandTargetLink(item)}
      ${renderCommandEvidence(item.evidenceLinks)}
    </article>
  `;
}

function renderCommandMemoryItem(item) {
  return `
    <article class="command-item" ${commandTargetAttributes(item)}>
      <div class="command-item-top">
        <span>${escapeHtml(memoryTypeLabel(item.type))}</span>
        <span>${escapeHtml(memoryStatusLabel(item.status).label)}</span>
      </div>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.summary)}</p>
      ${renderCommandTargetLink(item)}
      ${renderCommandEvidence(item.evidenceLinks)}
    </article>
  `;
}

function renderRiskOpportunityPreview(snapshot) {
  const items = [
    ...snapshot.riskRadar.map((risk) => ({
      ...risk,
      kind: "Risk",
      meta: risk.severity || "medium"
    })),
    ...snapshot.opportunityRadar.map((opportunity) => ({
      ...opportunity,
      kind: "Opportunity",
      meta: opportunity.impact || "medium"
    }))
  ].slice(0, 5);

  if (!items.length) {
    return `<div class="command-empty">暂无风险或机会信号。</div>`;
  }

  return `
    <div class="command-list">
      ${items
        .map(
          (item) => `
            <article class="command-item" id="command-${escapeHtml(item.kind.toLowerCase())}-${escapeHtml(item.id)}" ${commandTargetAttributes(item)}>
              <div class="command-item-top">
                <span>${escapeHtml(item.kind)}</span>
                <span>${escapeHtml(item.meta)}</span>
              </div>
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.description)}</p>
              ${renderCommandTargetLink(item)}
              ${renderCommandEvidence(item.evidenceLinks)}
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderCommandTargetLink(item) {
  if (!item?.targetAnchor || !item?.targetId) {
    return "";
  }

  return `
    <a
      class="secondary-link compact-button command-target-link"
      href="${escapeHtml(item.targetAnchor)}"
      data-command-target
      data-target-type="${escapeHtml(item.targetType || item.type)}"
      data-target-id="${escapeHtml(item.targetId)}"
      data-target-anchor="${escapeHtml(item.targetAnchor)}"
    >
      ${escapeHtml(item.targetLabel || "定位对象")}
    </a>
  `;
}

function commandTargetAttributes(item) {
  if (!item?.targetId) {
    return "";
  }

  return `
    data-command-target-type="${escapeHtml(item.targetType || item.type)}"
    data-command-target-id="${escapeHtml(item.targetId)}"
    data-command-target-anchor="${escapeHtml(item.targetAnchor || "")}"
  `;
}

function renderCommandEvidence(evidenceLinks = []) {
  const firstEvidence = Array.isArray(evidenceLinks) ? evidenceLinks.find(Boolean) : null;
  if (!firstEvidence) {
    return `<small class="command-evidence">证据待补</small>`;
  }

  const parts = [
    firstEvidence.sourceId ? `Source ${firstEvidence.sourceId}` : "",
    firstEvidence.signalId ? `Signal ${firstEvidence.signalId}` : "",
    firstEvidence.contextId ? `Context ${firstEvidence.contextId}` : "",
    firstEvidence.memoryId ? `Memory ${firstEvidence.memoryId}` : ""
  ].filter(Boolean);

  const label = parts.join(" · ") || firstEvidence.note || "有证据链";
  const href = commandEvidenceHref(firstEvidence);
  const quote = firstEvidence.quote ? ` · "${trimInline(firstEvidence.quote, 48)}"` : "";
  const evidence = href
    ? `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
    : `<span>${escapeHtml(label)}</span>`;

  return `<small class="command-evidence">${evidence}${escapeHtml(quote)}</small>`;
}

function commandEvidenceHref(evidence) {
  if (evidence?.signalId) {
    return `#signal-${evidence.signalId}`;
  }
  if (evidence?.sourceId) {
    return `#source-${evidence.sourceId}`;
  }
  if (evidence?.memoryId) {
    return `#memory-${evidence.memoryId}`;
  }
  if (evidence?.contextId) {
    return `#context-${evidence.contextId}`;
  }
  return "";
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
    ["Entity", project.entities?.length || 0],
    ["Node", project.nodes?.length || 0],
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
        ${renderSignalReviewActions(signal)}
      </div>
    </article>
  `;
}

function renderSignalReviewActions(signal) {
  if (signal.status === "converted" || signal.status === "ignored") {
    return "";
  }

  return `
    <button class="secondary-button compact-button" data-signal-review="confirm" data-signal-id="${escapeHtml(signal.id)}" type="button">确认</button>
    <button class="ghost-button compact-button" data-signal-review="ignore" data-signal-id="${escapeHtml(signal.id)}" type="button">忽略</button>
    <button class="secondary-button compact-button" data-signal-review="memory" data-signal-id="${escapeHtml(signal.id)}" type="button">转 Memory</button>
    <button class="secondary-button compact-button" data-signal-review="action" data-signal-id="${escapeHtml(signal.id)}" type="button">转 Action</button>
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

function renderEntityProfiles(project, selectedEntityId) {
  const entities = project?.entities || [];
  const selectedEntity = selectedEntityId
    ? entities.find((entity) => entity.id === selectedEntityId)
    : null;

  return `
    <section class="panel entity-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Entity Profile</p>
          <h3>业务对象画像</h3>
        </div>
        <span class="count-pill">${entities.length}</span>
      </div>
      ${
        entities.length
          ? `<div class="entity-layout">
              <div class="entity-list">
                ${entities
                  .map((entity) =>
                    renderEntityCard(project, entity, entity.id === selectedEntity?.id)
                  )
                  .join("")}
              </div>
              ${selectedEntity ? renderEntityDetailPanel(project, selectedEntity) : emptyState("选择一个 Entity 查看画像详情。")}
            </div>`
          : emptyState("暂无 Entity。先从 Inbox 中提取 Signal 并建议关联。")
      }
    </section>
  `;
}

function renderEntityCard(project, entity, isSelected) {
  const sourceCount = entityLinkIds(entity, "source").length;
  const signalCount = entityLinkIds(entity, "signal").length;
  const memoryCount = entityLinkIds(entity, "memory").length;
  const lastInteractionAt = entityLastInteractionAt(project, entity);

  return `
    <button class="entity-card ${isSelected ? "selected" : ""}" data-entity-open-id="${escapeHtml(entity.id)}" type="button">
      <div class="entity-card-top">
        <span class="context-type">${escapeHtml(entityTypeLabel(entity.type))}</span>
        <span class="status ${escapeHtml(entity.status || "watching")}">${escapeHtml(entityStatusLabel(entity.status))}</span>
      </div>
      <strong>${escapeHtml(entity.name)}</strong>
      <small>${escapeHtml(entity.organization || entity.role || entity.relationshipStage || "关系待补")}</small>
      <div class="entity-metrics">
        <span>Source ${sourceCount}</span>
        <span>Signal ${signalCount}</span>
        <span>Memory ${memoryCount}</span>
      </div>
      <small>最近互动 ${escapeHtml(formatDateOnly(lastInteractionAt))}</small>
    </button>
  `;
}

function renderEntityDetailPanel(project, entity) {
  if (!entity) {
    return "";
  }

  const sources = entitySources(project, entity);
  const signals = entitySignals(project, entity);
  const memories = entityMemories(project, entity);
  const relatedProjects = entityProjects(project, entity);
  const nextAction = entityNextAction(project, entity, memories);

  return `
    <article class="entity-detail-panel" aria-label="Entity 画像详情">
      <div class="memory-detail-heading">
        <div>
          <p class="eyebrow">Profile Detail</p>
          <h4>${escapeHtml(entity.name)}</h4>
        </div>
        <button class="ghost-button compact-button" data-action="close-entity-detail" type="button">关闭</button>
      </div>

      <div class="memory-detail-meta">
        <span>${escapeHtml(entityTypeLabel(entity.type))}</span>
        <span class="status ${escapeHtml(entity.status || "watching")}">${escapeHtml(entityStatusLabel(entity.status))}</span>
        ${entity.relationshipStage ? `<span>${escapeHtml(entity.relationshipStage)}</span>` : ""}
      </div>

      <section class="memory-detail-section">
        <h5>基础画像</h5>
        <p>${escapeHtml(entity.description || "还没有画像描述。")}</p>
        <div class="entity-profile-grid">
          <span><strong>角色</strong>${escapeHtml(entity.role || "待补")}</span>
          <span><strong>组织</strong>${escapeHtml(entity.organization || "待补")}</span>
          <span><strong>负责人建议</strong>${escapeHtml(entity.ownerSuggestion || "待确认")}</span>
          <span><strong>最近互动</strong>${escapeHtml(formatDateOnly(entityLastInteractionAt(project, entity)))}</span>
        </div>
        ${renderEntityTags(entity)}
      </section>

      <section class="memory-detail-section">
        <h5>关联证据</h5>
        <div class="entity-relation-grid">
          ${renderEntityRelatedList("Source", sources, (source) => source.title, (source) => `#source-${source.id}`)}
          ${renderEntityRelatedList("Signal", signals, (signal) => signal.title, (signal) => `#signal-${signal.id}`)}
          ${renderEntityRelatedList("Memory", memories, (memory) => memory.title, null)}
          ${renderEntityRelatedList("Project", relatedProjects, (item) => item.name, null)}
        </div>
      </section>

      <section class="memory-detail-section">
        <h5>下一步建议</h5>
        ${
          nextAction
            ? `<button class="memory-related-action" data-action-id="${escapeHtml(nextAction.id)}" type="button">
                <span>${escapeHtml(ACTION_TYPES[nextAction.type] || nextAction.type)}</span>
                <strong>${escapeHtml(nextAction.title)}</strong>
                <small>${escapeHtml(ACTION_STATUS[nextAction.status] || nextAction.status)}</small>
              </button>`
            : `<p class="muted">等待更多 Signal 或 Memory 后再生成下一步建议。</p>`
        }
      </section>

      <section class="memory-detail-section">
        <h5>治理状态</h5>
        ${renderEntityStatusActions(entity)}
      </section>
    </article>
  `;
}

function renderEntityTags(entity) {
  const tags = Array.isArray(entity.tags) ? entity.tags : [];
  if (!tags.length) {
    return "";
  }

  return `
    <div class="context-tags">
      ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function renderEntityRelatedList(label, items, getTitle, getHref) {
  return `
    <div class="entity-related-list">
      <strong>${escapeHtml(label)} ${items.length}</strong>
      ${
        items.length
          ? items
              .slice(0, 4)
              .map((item) => {
                const title = escapeHtml(getTitle(item));
                const href = getHref?.(item);
                return href
                  ? `<a class="secondary-link compact-button" href="${escapeHtml(href)}">${title}</a>`
                  : `<span>${title}</span>`;
              })
              .join("")
          : `<span class="muted">暂无关联</span>`
      }
    </div>
  `;
}

function renderEntityStatusActions(entity) {
  const currentStatus = entity.status || "watching";
  return `
    <div class="memory-status-actions" aria-label="Entity 状态操作">
      ${ENTITY_STATUS_ACTIONS.filter((action) => action.status !== currentStatus)
        .map(
          (action) => `
            <button
              class="memory-status-action ${escapeHtml(action.status)}"
              data-action="update-entity-status"
              data-entity-id="${escapeHtml(entity.id)}"
              data-entity-status="${escapeHtml(action.status)}"
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

function renderProjectNodes(project, selectedNodeId) {
  const nodes = project?.nodes || [];
  const selectedNode = selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) : null;

  return `
    <section class="panel node-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Project Nodes</p>
          <h3>项目推进节点</h3>
        </div>
        <span class="count-pill">${nodes.length}</span>
      </div>
      ${
        nodes.length
          ? `<div class="node-layout">
              <div class="node-list">
                ${nodes.map((node) => renderProjectNodeCard(project, node, node.id === selectedNode?.id)).join("")}
              </div>
              ${selectedNode ? renderProjectNodeDetailPanel(project, selectedNode) : emptyState("选择一个节点查看详情。")}
            </div>`
          : emptyState("暂无节点。小项目会自动补一个默认推进节点。")
      }
    </section>
  `;
}

function renderProjectNodeCard(project, node, isSelected = false) {
  const metrics = [
    ["Source", node.sourceIds?.length || 0],
    ["Signal", node.signalIds?.length || 0],
    ["Memory", node.memoryIds?.length || 0],
    ["Action", node.actionIds?.length || 0],
    ["Result", node.resultIds?.length || 0]
  ];

  return `
    <article class="node-card ${isSelected ? "selected" : ""}" id="node-${escapeHtml(node.id)}">
      <div class="node-card-main">
        <div class="context-item-top">
          <span class="status ${escapeHtml(node.status || "planned")}">${escapeHtml(projectNodeStatusLabel(node.status))}</span>
          ${node.ownerSuggestion ? `<span>${escapeHtml(node.ownerSuggestion)}</span>` : ""}
          ${node.dueAt ? `<span>${escapeHtml(formatDateOnly(node.dueAt))}</span>` : ""}
        </div>
        <h4>${escapeHtml(node.title)}</h4>
        <p>${escapeHtml(node.goal)}</p>
        ${renderProjectNodeSuccessCriteria(node)}
      </div>
      <div class="node-side">
        <div class="entity-metrics">
          ${metrics.map(([label, value]) => `<span>${escapeHtml(label)} ${value}</span>`).join("")}
        </div>
        <button class="secondary-button compact-button" data-action="open-node-detail" data-node-id="${escapeHtml(node.id)}" type="button">详情</button>
        ${renderProjectNodeStatusActions(node)}
      </div>
    </article>
  `;
}

function renderProjectNodeDetailPanel(project, node) {
  const contexts = nodeLinkedItems(project.contexts || [], node.inputContextIds);
  const sources = nodeLinkedItems(project.sources || [], node.sourceIds);
  const signals = nodeLinkedItems(project.signals || [], node.signalIds);
  const memories = nodeLinkedItems(project.memories || [], node.memoryIds);
  const actions = nodeLinkedItems(project.actions || [], node.actionIds);
  const results = nodeLinkedItems(project.results || [], node.resultIds);

  return `
    <article class="node-detail-panel" aria-label="节点详情">
      <div class="memory-detail-heading">
        <div>
          <p class="eyebrow">Node Detail</p>
          <h4>${escapeHtml(node.title)}</h4>
        </div>
        <button class="ghost-button compact-button" data-action="close-node-detail" type="button">关闭</button>
      </div>

      <div class="memory-detail-meta">
        <span class="status ${escapeHtml(node.status || "planned")}">${escapeHtml(projectNodeStatusLabel(node.status))}</span>
        ${node.ownerSuggestion ? `<span>${escapeHtml(node.ownerSuggestion)}</span>` : ""}
        ${node.dueAt ? `<span>${escapeHtml(formatDateOnly(node.dueAt))}</span>` : ""}
      </div>

      <section class="memory-detail-section">
        <h5>节点目标</h5>
        <p>${escapeHtml(node.goal || "目标待补")}</p>
        ${renderProjectNodeSuccessCriteria(node)}
      </section>

      <section class="memory-detail-section">
        <h5>输入上下文</h5>
        ${renderNodeRelatedList("Context", contexts, (context) => context.title, (context) => `#context-${context.id}`)}
      </section>

      <section class="memory-detail-section">
        <h5>证据链</h5>
        <div class="entity-relation-grid">
          ${renderNodeRelatedList("Source", sources, (source) => source.title, (source) => `#source-${source.id}`)}
          ${renderNodeRelatedList("Signal", signals, (signal) => signal.title, (signal) => `#signal-${signal.id}`)}
          ${renderNodeRelatedList("Memory", memories, (memory) => memory.title, null)}
        </div>
      </section>

      <section class="memory-detail-section">
        <h5>关联行动</h5>
        ${renderNodeActions(actions)}
      </section>

      <section class="memory-detail-section">
        <h5>结果回流</h5>
        ${renderNodeResults(results)}
      </section>
    </article>
  `;
}

function renderProjectNodeSuccessCriteria(node) {
  const items = Array.isArray(node.successCriteria) ? node.successCriteria : [];
  if (!items.length) {
    return "";
  }

  return `
    <ul class="node-criteria">
      ${items.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderProjectNodeStatusActions(node) {
  const currentStatus = node.status || "planned";
  return `
    <div class="memory-status-actions" aria-label="节点状态操作">
      ${PROJECT_NODE_STATUS_ACTIONS.filter((action) => action.status !== currentStatus)
        .map(
          (action) => `
            <button
              class="memory-status-action ${escapeHtml(action.status)}"
              data-action="update-project-node-status"
              data-node-id="${escapeHtml(node.id)}"
              data-node-status="${escapeHtml(action.status)}"
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

function renderNodeRelatedList(label, items, getTitle, getHref) {
  if (!items.length) {
    return `<p class="muted">暂无关联 ${escapeHtml(label)}</p>`;
  }

  return `
    <div class="memory-detail-list">
      ${items
        .slice(0, 5)
        .map((item) => {
          const title = escapeHtml(getTitle(item));
          const href = getHref?.(item);
          return href
            ? `<a class="secondary-link compact-button" href="${escapeHtml(href)}">${title}</a>`
            : `<span class="node-related-pill">${title}</span>`;
        })
        .join("")}
    </div>
  `;
}

function renderNodeActions(actions) {
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

function renderNodeResults(results) {
  if (!results.length) {
    return `<p class="muted">暂无 result</p>`;
  }

  return `
    <div class="memory-detail-list">
      ${results
        .map(
          (result) => `
            <article class="memory-detail-result">
              <strong>${escapeHtml(result.summary || result.outcome || "执行结果")}</strong>
              <span>${escapeHtml(formatDateOnly(result.createdAt))}</span>
              ${renderResultNodeSuggestions(result)}
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderCommitments(project) {
  const commitments = project?.commitments || [];
  const activeCommitments = commitments.filter(
    (commitment) => !["done", "archived"].includes(commitment.status)
  );

  return `
    <section class="panel commitment-panel" data-commitment-panel>
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Commitment / Waiting</p>
          <h3>承诺、等待与依赖</h3>
        </div>
        <span class="count-pill">${activeCommitments.length}</span>
      </div>
      ${
        activeCommitments.length
          ? `<div class="commitment-list">
              ${activeCommitments.map((commitment) => renderCommitmentCard(project, commitment)).join("")}
            </div>`
          : emptyState("暂无承诺、等待项或依赖项。")
      }
    </section>
  `;
}

function renderCommitmentCard(project, commitment) {
  const node = (project.nodes || []).find((item) => item.id === commitment.nodeId);
  const status = displayCommitmentStatus(commitment);

  return `
    <article class="commitment-card" id="commitment-${escapeHtml(commitment.id)}" data-commitment-id="${escapeHtml(commitment.id)}">
      <div class="context-item-top">
        <span class="context-type">${escapeHtml(commitmentTypeLabel(commitment.type))}</span>
        <span class="status ${escapeHtml(status)}">${escapeHtml(commitmentStatusLabel(status))}</span>
        ${commitment.dueAt ? `<span>截止 ${escapeHtml(formatDateOnly(commitment.dueAt))}</span>` : ""}
      </div>
      <h4>${escapeHtml(commitment.title)}</h4>
      <p>${escapeHtml(commitmentLine(commitment))}</p>
      <div class="context-meta">
        ${node ? `<span>Node: ${escapeHtml(node.title)}</span>` : ""}
        ${commitment.evidenceLinks?.length ? `<span>证据 ${commitment.evidenceLinks.length}</span>` : ""}
      </div>
    </article>
  `;
}

function renderRiskOpportunityRadar(project) {
  const risks = (project?.risks || []).filter((risk) => !["mitigated", "archived"].includes(risk.status));
  const opportunities = (project?.opportunities || []).filter(
    (opportunity) => !["lost", "archived"].includes(opportunity.status)
  );

  return `
    <section class="panel radar-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Risk / Opportunity Radar</p>
          <h3>风险与机会雷达</h3>
        </div>
        <span class="count-pill">${risks.length + opportunities.length}</span>
      </div>
      <div class="radar-layout">
        <div data-risk-radar>
          <div class="context-history-heading">
            <strong>风险</strong>
            <span class="count-pill">${risks.length}</span>
          </div>
          ${renderRadarList(project, risks, "risk")}
        </div>
        <div data-opportunity-radar>
          <div class="context-history-heading">
            <strong>机会</strong>
            <span class="count-pill">${opportunities.length}</span>
          </div>
          ${renderRadarList(project, opportunities, "opportunity")}
        </div>
      </div>
    </section>
  `;
}

function renderRadarList(project, items, kind) {
  if (!items.length) {
    return emptyState(kind === "risk" ? "暂无显式风险。" : "暂无显式机会。");
  }

  return `
    <div class="radar-list">
      ${items.map((item) => renderRadarCard(project, item, kind)).join("")}
    </div>
  `;
}

function renderRadarCard(project, item, kind) {
  const node = (project.nodes || []).find((nodeItem) => nodeItem.id === item.nodeId);
  const actionCount = Array.isArray(item.suggestedActionIds) ? item.suggestedActionIds.length : 0;
  const evidenceCount = Array.isArray(item.evidenceLinks) ? item.evidenceLinks.length : 0;
  const meta =
    kind === "risk"
      ? `${RISK_LABELS[item.severity] || item.severity} · ${riskStatusLabel(item.status)}`
      : `${IMPACT_LABELS[item.potentialImpact] || item.potentialImpact} · ${opportunityStatusLabel(item.status)}`;

  return `
    <article class="radar-card ${escapeHtml(kind)}" id="${escapeHtml(kind)}-${escapeHtml(item.id)}" data-radar-id="${escapeHtml(item.id)}">
      <div class="context-item-top">
        <span class="context-type">${escapeHtml(kind === "risk" ? "Risk" : "Opportunity")}</span>
        <span>${escapeHtml(meta)}</span>
      </div>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.description)}</p>
      <div class="context-meta">
        ${node ? `<span>Node: ${escapeHtml(node.title)}</span>` : ""}
        <span>证据 ${evidenceCount}</span>
        <span>建议 action ${actionCount}</span>
      </div>
    </article>
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

    ${renderMemoryGovernanceSummary(project)}

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
    <div class="memory-item ${isSelected ? "selected" : ""}" id="memory-${escapeHtml(memory.id)}" data-memory-open-id="${escapeHtml(memory.id)}">
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
    ? memory.sourceReferences.filter((reference) => reference?.contextId || reference?.sourceId || reference?.quote)
    : [];

  if (!sourceReferences.length) {
    return `<p class="muted">${escapeHtml(memory.source || "来源待补")}</p>`;
  }

  return `
    <div class="memory-detail-list">
      ${sourceReferences
        .map((reference) => {
          const context = project.contexts.find((item) => item.id === reference.contextId);
          const source = (project.sources || []).find((item) => item.id === reference.sourceId);
          return `
            <article class="memory-detail-source">
              <div>
                <strong>${escapeHtml(context?.title || source?.title || reference.note || "未知来源")}</strong>
                <span>${escapeHtml(formatDateOnly(context?.occurredAt || context?.createdAt || source?.occurredAt || source?.receivedAt))}</span>
              </div>
              <blockquote>${escapeHtml(reference.quote || memoryContent(memory))}</blockquote>
              ${
                context?.body
                  ? `<details class="source-context">
                      <summary>Context 原文</summary>
                      <p>${escapeHtml(context.body)}</p>
                    </details>
                    <a class="secondary-link compact-button" href="#context-${escapeHtml(context.id)}">跳到原文</a>`
                  : source?.body
                    ? `<details class="source-context">
                        <summary>Source 原文</summary>
                        <p>${escapeHtml(source.body)}</p>
                      </details>
                      <a class="secondary-link compact-button" href="#source-${escapeHtml(source.id)}">跳到 Source</a>`
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
              <span>${escapeHtml(update.operation || update.kind || update.type || "update")}</span>
              ${escapeHtml(update.summary || update.note || update.reason || "")}
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

function renderResultNodeSuggestions(result) {
  const suggestions = Array.isArray(result.projectNodeUpdates) ? result.projectNodeUpdates : [];
  if (!suggestions.length) {
    return "";
  }

  return `
    <ul class="memory-update-list">
      ${suggestions
        .map(
          (suggestion) => `
            <li>
              <span>node ${escapeHtml(suggestion.suggestedStatus)}</span>
              ${escapeHtml(suggestion.reason || "")}
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

function renderMemorySources(project, memory) {
  const sourceReferences = Array.isArray(memory.sourceReferences)
    ? memory.sourceReferences.filter((reference) => (reference?.contextId || reference?.sourceId) && reference?.quote)
    : [];

  if (!sourceReferences.length) {
    return `<small>${escapeHtml(memory.source || "来源待补")} · ${confidenceLabel(memory.confidence)}</small>`;
  }

  const firstSourceTitle = referenceTitle(project, sourceReferences[0]);

  return `
    <div class="memory-sources">
      <small>来源 ${sourceReferences.length} · ${escapeHtml(firstSourceTitle)} · ${confidenceLabel(memory.confidence)}</small>
      <details>
        <summary>查看引用片段</summary>
        ${sourceReferences
          .map(
            (reference) => `
              <blockquote>
                <strong>${escapeHtml(referenceTitle(project, reference))}</strong>
                <p>${escapeHtml(reference.quote)}</p>
                ${renderSourceEvidence(project, reference)}
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

function referenceTitle(project, reference) {
  if (reference?.contextId) {
    return contextTitle(project, reference.contextId);
  }

  if (reference?.sourceId) {
    return (project.sources || []).find((source) => source.id === reference.sourceId)?.title || "未知 Source";
  }

  return "未知来源";
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

function renderSourceEvidence(project, reference) {
  if (reference?.contextId) {
    return renderSourceContext(project, reference.contextId);
  }

  const source = (project.sources || []).find((item) => item.id === reference?.sourceId);
  if (!source?.body) {
    return "";
  }

  return `
    <details class="source-context">
      <summary>查看 Source 原文</summary>
      <p>${escapeHtml(source.body)}</p>
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
            ${openActions.map((action) => renderActionCard(project, action, selectedActionId)).join("")}
          </div>`
        : emptyState("暂无待处理行动")
    }

    ${
      doneActions.length
        ? `<details class="done-actions">
            <summary>已回流行动 ${doneActions.length}</summary>
            ${doneActions.map((action) => renderActionCard(project, action, selectedActionId)).join("")}
          </details>`
        : ""
    }
  `;
}

function renderActionCard(project, action, selectedActionId) {
  return `
    <button class="action-card ${action.id === selectedActionId ? "selected" : ""}" id="action-${escapeHtml(action.id)}" data-action-id="${action.id}" type="button">
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
      ${renderActionMemoryGovernance(project, action)}
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

    ${renderActionResultHistory(project, action)}

    <form class="result-form" data-form="record-result" data-action-id="${action.id}">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">Loop</p>
          <h3>结果回流</h3>
        </div>
      </div>
      <label>
        结果摘要
        <textarea name="summary" rows="4" placeholder="记录客户回复、工程结果、投资人反馈或新的阻塞" required></textarea>
      </label>
      <label>
        发生了什么变化
        <textarea name="whatChanged" rows="3" placeholder="例如：客户同意试点，但要求先确认权限边界"></textarea>
      </label>
      <label>
        新证据
        <textarea name="newEvidence" rows="3" placeholder="例如：CFO 明确说预算要等法务审批后释放"></textarea>
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
        <label class="checkbox-field">
          <input name="followUpNeeded" type="checkbox" value="true" />
          需要后续动作
        </label>
        <button class="primary-button" type="submit">
          <span>回流并更新记忆</span>
          <span>✓</span>
        </button>
      </div>
    </form>
  `;
}

function renderActionResultHistory(project, action) {
  const results = (project.results || []).filter((result) => result.actionId === action.id);
  if (!results.length) {
    return "";
  }

  return `
    <div class="result-history" data-result-history>
      <div class="context-history-heading">
        <strong>结果记录</strong>
        <span class="count-pill">${results.length}</span>
      </div>
      ${results
        .map(
          (result) => `
            <article class="result-history-item">
              <div class="result-history-top">
                <span>${escapeHtml(resultOutcomeLabel(result.outcome))}</span>
                <span>${escapeHtml(formatDateOnly(result.createdAt))}</span>
                ${result.followUpNeeded ? "<span>需要后续</span>" : ""}
              </div>
              <strong>${escapeHtml(result.summary || "执行结果")}</strong>
              <p>变化：${escapeHtml(result.whatChanged || result.summary || "")}</p>
              <p>新证据：${escapeHtml(result.newEvidence || result.summary || "")}</p>
              <small>Memory updates ${Array.isArray(result.relatedMemoryUpdates) ? result.relatedMemoryUpdates.length : 0}</small>
              ${renderResultNodeSuggestions(result)}
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderBriefSections(brief) {
  const sections = orderedBriefSections(brief);

  return `
    <div class="brief-sections">
      ${sections
        .filter(([, content]) => content !== undefined && content !== null && content !== "")
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

function orderedBriefSections(brief) {
  const sections = brief.sections || {};
  const preferredOrder = BRIEF_SECTION_ORDER[brief.type] || BRIEF_SECTION_ORDER.default;
  const seen = new Set();
  const ordered = preferredOrder
    .filter((key) => sections[key] !== undefined)
    .map((key) => {
      seen.add(key);
      return [BRIEF_SECTION_LABELS[key] || key, sections[key]];
    });
  const extras = Object.keys(sections)
    .filter((key) => !seen.has(key))
    .map((key) => [BRIEF_SECTION_LABELS[key] || key, sections[key]]);

  return [...ordered, ...extras];
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

function renderMemoryGovernanceSummary(project) {
  const counts = countMemoryStatuses(project.memories || []);
  const activeEvidence = counts.confirmed + counts.draft + counts.disputed;
  const retiredEvidence = counts.outdated + counts.archived;

  return `
    <div class="memory-governance-summary" data-memory-governance-summary>
      <div>
        <p class="eyebrow">Governance</p>
        <strong>记忆治理影响</strong>
        <span>参与行动证据 ${activeEvidence} · 默认排除 ${retiredEvidence}</span>
      </div>
      <div class="governance-metrics">
        ${renderGovernanceMetric("已确认", counts.confirmed, "confirmed")}
        ${renderGovernanceMetric("待确认", counts.draft, "draft")}
        ${renderGovernanceMetric("有争议", counts.disputed, "disputed")}
        ${renderGovernanceMetric("已过期", counts.outdated, "outdated")}
        ${renderGovernanceMetric("已归档", counts.archived, "archived")}
      </div>
    </div>
  `;
}

function renderActionMemoryGovernance(project, action) {
  const memoryIds = new Set(actionMemoryIds(action));
  const memories = (project.memories || []).filter((memory) => memoryIds.has(memory.id));
  if (!memories.length) {
    return `<div class="action-governance muted">证据待补</div>`;
  }

  const counts = countMemoryStatuses(memories);
  const needsReview = counts.draft + counts.disputed;
  const excluded = counts.outdated + counts.archived;

  return `
    <div class="action-governance" data-action-memory-governance>
      <span>已确认 ${counts.confirmed}</span>
      <span>待复核 ${needsReview}</span>
      ${excluded ? `<span>已排除 ${excluded}</span>` : ""}
    </div>
  `;
}

function renderGovernanceMetric(label, count, status) {
  return `
    <span class="governance-metric ${escapeHtml(status)}">
      <strong>${escapeHtml(String(count))}</strong>
      ${escapeHtml(label)}
    </span>
  `;
}

function countMemoryStatuses(memories) {
  return memories.reduce(
    (counts, memory) => {
      const status = memory.status || "draft";
      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
      return counts;
    },
    {
      draft: 0,
      confirmed: 0,
      outdated: 0,
      disputed: 0,
      archived: 0
    }
  );
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

function entityLinkIds(entity, kind) {
  const fields = {
    source: ["sourceIds", "relatedSourceIds"],
    signal: ["signalIds", "relatedSignalIds"],
    memory: ["memoryIds", "relatedMemoryIds"],
    project: ["projectIds", "relatedProjectIds"]
  }[kind] || [];

  return [
    ...new Set(
      fields
        .flatMap((field) => (Array.isArray(entity?.[field]) ? entity[field] : []))
        .filter(Boolean)
    )
  ];
}

function entitySources(project, entity) {
  const ids = new Set(entityLinkIds(entity, "source"));
  return (project.sources || []).filter((source) => ids.has(source.id));
}

function entitySignals(project, entity) {
  const ids = new Set(entityLinkIds(entity, "signal"));
  return (project.signals || []).filter((signal) => ids.has(signal.id));
}

function entityMemories(project, entity) {
  const ids = new Set(entityLinkIds(entity, "memory"));
  return (project.memories || []).filter((memory) => ids.has(memory.id));
}

function entityProjects(project, entity) {
  const ids = new Set(entityLinkIds(entity, "project"));
  return ids.has(project.id) ? [project] : [];
}

function entityLastInteractionAt(project, entity) {
  const dates = [
    entity?.lastInteractionAt,
    ...entitySources(project, entity).map((source) => source.occurredAt || source.receivedAt),
    ...entitySignals(project, entity).map((signal) => signal.createdAt),
    ...entityMemories(project, entity).map((memory) => memory.updatedAt || memory.createdAt)
  ]
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((left, right) => right.getTime() - left.getTime());

  return dates[0]?.toISOString() || "";
}

function entityNextAction(project, entity, memories) {
  const direct = (project.actions || []).find((action) => action.id === entity.nextSuggestedActionId);
  if (direct) {
    return direct;
  }

  const memoryIds = new Set(memories.map((memory) => memory.id));
  return (project.actions || []).find(
    (action) =>
      action.status !== "done" &&
      actionMemoryIds(action).some((memoryId) => memoryIds.has(memoryId))
  );
}

function nodeLinkedItems(items, ids = []) {
  const idSet = new Set(Array.isArray(ids) ? ids : []);
  return items.filter((item) => idSet.has(item.id));
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

function memoryTypeLabel(type) {
  return MEMORY_TYPES[type]?.label || "公司记忆";
}

function confidenceLabel(confidence) {
  const labels = {
    high: "高置信",
    medium: "中置信",
    low: "低置信"
  };

  return labels[confidence] || "待确认";
}

function resultOutcomeLabel(outcome) {
  return RESULT_OUTCOMES.find((item) => item.id === outcome)?.label || outcome || "结果";
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

function trimInline(value, maxLength = 80) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
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

function projectNodeStatusLabel(status) {
  return PROJECT_NODE_STATUS[status] || PROJECT_NODE_STATUS.planned;
}

function commitmentTypeLabel(type) {
  return COMMITMENT_TYPES[type] || COMMITMENT_TYPES.commitment;
}

function commitmentStatusLabel(status) {
  return COMMITMENT_STATUS[status] || COMMITMENT_STATUS.open;
}

function displayCommitmentStatus(commitment) {
  if (["done", "archived", "blocked", "overdue"].includes(commitment.status)) {
    return commitment.status;
  }

  if (commitment.dueAt && new Date(commitment.dueAt).getTime() < Date.now()) {
    return "overdue";
  }

  return commitment.status || "open";
}

function commitmentLine(commitment) {
  const target = commitment.toWhom ? ` -> ${commitment.toWhom}` : "";
  const due = commitment.dueAt ? ` · ${formatDateOnly(commitment.dueAt)}` : "";
  return `${commitment.who || "待确认"}${target}${due}`;
}

function riskStatusLabel(status) {
  return RISK_STATUS[status] || RISK_STATUS.open;
}

function opportunityStatusLabel(status) {
  return OPPORTUNITY_STATUS[status] || OPPORTUNITY_STATUS.new;
}

function priorityTypeLabel(type) {
  return {
    commitment: "Commitment",
    risk: "Risk",
    action: "Action",
    memory_review: "Memory Review",
    opportunity: "Opportunity"
  }[type] || "Priority";
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
