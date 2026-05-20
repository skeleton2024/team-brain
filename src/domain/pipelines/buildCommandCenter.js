const PRIORITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1
};

const RISK_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1
};

export function buildCommandCenter({ project, now = new Date().toISOString() } = {}) {
  if (!project) {
    return emptySnapshot(now);
  }

  const sources = Array.isArray(project.sources) ? project.sources : [];
  const signals = Array.isArray(project.signals) ? project.signals : [];
  const memories = Array.isArray(project.memories) ? project.memories : [];
  const actions = Array.isArray(project.actions) ? project.actions : [];
  const nodes = Array.isArray(project.nodes) ? project.nodes : [];
  const commitments = Array.isArray(project.commitments) ? project.commitments : [];

  const todayInbox = buildInboxItems(sources, signals);
  const memoryReview = buildMemoryReview(memories);
  const actionFocus = buildActionFocus(actions);
  const riskRadar = buildRiskRadar(project, memories, actions);
  const opportunityRadar = buildOpportunityRadar(project, memories, signals);
  const health = buildProjectHealth({
    todayInbox,
    memoryReview,
    actionFocus,
    riskRadar,
    commitments,
    nodes
  });

  return {
    generatedAt: now,
    projectId: project.id,
    projectName: project.name,
    health,
    metrics: {
      inbox: todayInbox.length,
      memoryReview: memoryReview.length,
      openActions: actionFocus.length,
      blockedNodes: nodes.filter((node) => node.status === "blocked").length,
      risks: riskRadar.length,
      opportunities: opportunityRadar.length,
      commitments: commitments.filter((item) => item.status !== "done" && item.status !== "archived").length
    },
    todayInbox,
    memoryReview,
    actionFocus,
    riskRadar,
    opportunityRadar,
    priorityQueue: []
  };
}

function emptySnapshot(now) {
  return {
    generatedAt: now,
    projectId: "",
    projectName: "",
    health: {
      status: "empty",
      label: "暂无项目",
      reasons: ["创建或选择项目后显示 Command Center。"]
    },
    metrics: {
      inbox: 0,
      memoryReview: 0,
      openActions: 0,
      blockedNodes: 0,
      risks: 0,
      opportunities: 0,
      commitments: 0
    },
    todayInbox: [],
    memoryReview: [],
    actionFocus: [],
    riskRadar: [],
    opportunityRadar: [],
    priorityQueue: []
  };
}

function buildInboxItems(sources, signals) {
  const sourceItems = sources
    .filter((source) => !["archived", "ignored"].includes(source.status))
    .map((source) => ({
      id: source.id,
      type: "source",
      title: source.title || "未命名 Source",
      summary: source.body || "",
      status: source.status || "new",
      occurredAt: source.occurredAt || source.receivedAt || source.createdAt,
      evidenceLinks: [
        {
          sourceId: source.id,
          quote: trimEvidence(source.body)
        }
      ]
    }));

  const signalItems = signals
    .filter((signal) => !["converted", "ignored"].includes(signal.status))
    .map((signal) => ({
      id: signal.id,
      type: "signal",
      title: signal.title || "未命名 Signal",
      summary: signal.summary || signal.quote || "",
      status: signal.status || "new",
      occurredAt: signal.updatedAt || signal.createdAt,
      evidenceLinks: [
        {
          sourceId: signal.sourceId,
          signalId: signal.id,
          quote: trimEvidence(signal.quote || signal.summary)
        }
      ]
    }));

  return [...sourceItems, ...signalItems]
    .sort((left, right) => compareDates(right.occurredAt, left.occurredAt))
    .slice(0, 5);
}

function buildMemoryReview(memories) {
  return memories
    .filter((memory) => ["draft", "disputed", "outdated"].includes(memory.status || "draft"))
    .map((memory) => ({
      id: memory.id,
      type: memory.type,
      title: memory.title,
      summary: memory.content || memory.detail || "",
      status: memory.status || "draft",
      updatedAt: memory.updatedAt || memory.createdAt,
      evidenceLinks: normalizeEvidenceLinks(memory.sourceReferences)
    }))
    .sort((left, right) => memoryReviewWeight(right.status) - memoryReviewWeight(left.status))
    .slice(0, 5);
}

function buildActionFocus(actions) {
  return actions
    .filter((action) => !["done", "archived"].includes(action.status))
    .map((action) => ({
      id: action.id,
      type: action.type,
      title: action.title,
      reason: action.whyNow || action.rationale || "",
      priority: action.priority || "medium",
      riskLevel: action.riskLevel || "medium",
      status: action.status || "pending",
      targetId: action.id,
      evidenceLinks: (action.evidenceMemoryIds || action.sourceMemoryIds || []).map((memoryId) => ({
        memoryId,
        note: "action evidence"
      })),
      score:
        (PRIORITY_WEIGHT[action.priority] || 2) * 10 +
        (RISK_WEIGHT[action.riskLevel] || 2) * 3 +
        (action.status === "pending" ? 2 : 0)
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
}

function buildRiskRadar(project, memories, actions) {
  const explicitRisks = Array.isArray(project.risks)
    ? project.risks
        .filter((risk) => !["mitigated", "archived"].includes(risk.status))
        .map((risk) => ({
          id: risk.id,
          title: risk.title,
          description: risk.description,
          severity: risk.severity || "medium",
          status: risk.status || "open",
          evidenceLinks: normalizeEvidenceLinks(risk.evidenceLinks),
          source: "risk"
        }))
    : [];

  const memoryRisks = memories
    .filter((memory) => memory.type === "risk" && !["archived"].includes(memory.status))
    .map((memory) => ({
      id: memory.id,
      title: memory.title,
      description: memory.content || memory.detail || "",
      severity: memory.status === "confirmed" ? "high" : "medium",
      status: memory.status || "draft",
      evidenceLinks: normalizeEvidenceLinks(memory.sourceReferences),
      source: "memory"
    }));

  const actionRisks = actions
    .filter((action) => action.status !== "done" && action.riskLevel === "high")
    .map((action) => ({
      id: action.id,
      title: action.title,
      description: action.whyNow || action.rationale || "",
      severity: "high",
      status: action.status || "pending",
      evidenceLinks: (action.evidenceMemoryIds || []).map((memoryId) => ({
        memoryId,
        note: "high-risk action"
      })),
      source: "action"
    }));

  return [...explicitRisks, ...memoryRisks, ...actionRisks]
    .sort((left, right) => (RISK_WEIGHT[right.severity] || 2) - (RISK_WEIGHT[left.severity] || 2))
    .slice(0, 5);
}

function buildOpportunityRadar(project, memories, signals) {
  const explicitOpportunities = Array.isArray(project.opportunities)
    ? project.opportunities
        .filter((opportunity) => !["lost", "archived"].includes(opportunity.status))
        .map((opportunity) => ({
          id: opportunity.id,
          title: opportunity.title,
          description: opportunity.description,
          impact: opportunity.potentialImpact || "medium",
          confidence: opportunity.confidence,
          status: opportunity.status || "new",
          evidenceLinks: normalizeEvidenceLinks(opportunity.evidenceLinks),
          source: "opportunity"
        }))
    : [];

  const memoryOpportunities = memories
    .filter((memory) => memory.type === "opportunity" && !["archived"].includes(memory.status))
    .map((memory) => ({
      id: memory.id,
      title: memory.title,
      description: memory.content || memory.detail || "",
      impact: memory.status === "confirmed" ? "high" : "medium",
      confidence: memory.confidence,
      status: memory.status || "draft",
      evidenceLinks: normalizeEvidenceLinks(memory.sourceReferences),
      source: "memory"
    }));

  const signalOpportunities = signals
    .filter((signal) => signal.type === "opportunity" && !["ignored", "converted"].includes(signal.status))
    .map((signal) => ({
      id: signal.id,
      title: signal.title,
      description: signal.summary || signal.quote || "",
      impact: "medium",
      confidence: signal.confidence,
      status: signal.status || "new",
      evidenceLinks: [
        {
          sourceId: signal.sourceId,
          signalId: signal.id,
          quote: trimEvidence(signal.quote || signal.summary)
        }
      ],
      source: "signal"
    }));

  return [...explicitOpportunities, ...memoryOpportunities, ...signalOpportunities].slice(0, 5);
}

function buildProjectHealth({ todayInbox, memoryReview, actionFocus, riskRadar, commitments, nodes }) {
  const reasons = [];
  const blockedNodes = nodes.filter((node) => node.status === "blocked");
  const highRisks = riskRadar.filter((risk) => risk.severity === "high");
  const overdueCommitments = commitments.filter((item) => item.status === "overdue");
  const highActions = actionFocus.filter((action) => action.priority === "high");
  const disputedMemories = memoryReview.filter((memory) => memory.status === "disputed");

  if (blockedNodes.length) {
    reasons.push(`${blockedNodes.length} 个节点阻塞`);
  }
  if (highRisks.length) {
    reasons.push(`${highRisks.length} 个高风险需要处理`);
  }
  if (overdueCommitments.length) {
    reasons.push(`${overdueCommitments.length} 个承诺逾期`);
  }
  if (todayInbox.length) {
    reasons.push(`${todayInbox.length} 条 Inbox / Signal 等待 review`);
  }
  if (highActions.length) {
    reasons.push(`${highActions.length} 个高优先级 action`);
  }
  if (disputedMemories.length) {
    reasons.push(`${disputedMemories.length} 条争议 memory`);
  }

  if (blockedNodes.length || highRisks.length || overdueCommitments.length) {
    return {
      status: "at_risk",
      label: "At Risk",
      reasons
    };
  }

  if (todayInbox.length || highActions.length || memoryReview.length) {
    return {
      status: "needs_attention",
      label: "Needs Attention",
      reasons
    };
  }

  return {
    status: "healthy",
    label: "Healthy",
    reasons: ["暂无高优先级阻塞，继续推进当前 action。"]
  };
}

function normalizeEvidenceLinks(links = []) {
  if (!Array.isArray(links)) {
    return [];
  }

  return links.map((link) => ({
    sourceId: link.sourceId,
    contextId: link.contextId,
    signalId: link.signalId,
    memoryId: link.memoryId,
    quote: trimEvidence(link.quote),
    note: link.note,
    confidence: link.confidence
  }));
}

function memoryReviewWeight(status) {
  return {
    disputed: 4,
    draft: 3,
    outdated: 2
  }[status] || 1;
}

function compareDates(left, right) {
  return new Date(left || 0).getTime() - new Date(right || 0).getTime();
}

function trimEvidence(value) {
  const text = String(value || "").trim();
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}
