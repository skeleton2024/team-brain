import { SIGNAL_TYPES } from "../types.js";
import { makeId } from "../../services/store.js";

const SIGNAL_RULES = [
  {
    type: "customer_need",
    keywords: ["客户", "用户", "需求", "试点", "预算", "采购", "反馈", "担心", "customer", "pilot"]
  },
  {
    type: "investor_question",
    keywords: ["投资人", "融资", "估值", "市场", "壁垒", "ARR", "CAC", "LTV", "investor", "moat"]
  },
  {
    type: "product_feedback",
    keywords: ["产品", "功能", "体验", "路线", "MVP", "roadmap", "优先", "不做", "版本"]
  },
  {
    type: "engineering_blocker",
    keywords: ["工程", "技术", "阻塞", "bug", "API", "部署", "导入", "GitHub", "Slack"]
  },
  {
    type: "team_constraint",
    keywords: ["团队", "人手", "时间", "资源", "容量", "本周", "deadline", "全职"]
  },
  {
    type: "risk",
    keywords: ["风险", "可能", "担心", "法务", "合规", "延期", "敏感", "安全", "权限"]
  },
  {
    type: "opportunity",
    keywords: ["机会", "愿意付费", "付费意向", "合作", "增长", "转介绍", "可以卖", "opportunity"]
  },
  {
    type: "commitment",
    keywords: ["承诺", "答应", "下周", "周五", "回复", "发送", "交付", "follow-up"]
  },
  {
    type: "decision",
    keywords: ["决定", "决策", "确认", "取舍", "先做", "暂不", "暂停"]
  }
];

const SIGNAL_TO_MEMORY_TYPE = {
  customer_need: "customer_concern",
  investor_question: "investor_question",
  product_feedback: "product_decision",
  engineering_blocker: "engineering_blocker",
  team_constraint: "team_constraint",
  risk: "risk",
  opportunity: "opportunity",
  commitment: "fact",
  decision: "product_decision",
  fact: "fact"
};

const SIGNAL_ACTION_TEMPLATES = {
  customer_need: {
    type: "customer_followup",
    title: "准备客户 follow-up 草稿",
    expectedArtifact: "客户 follow-up 草稿和待确认问题"
  },
  investor_question: {
    type: "investor_reply",
    title: "整理投资人回复 Brief",
    expectedArtifact: "投资人问答草稿和证据缺口"
  },
  product_feedback: {
    type: "product_plan",
    title: "更新产品取舍说明",
    expectedArtifact: "产品取舍说明和下一步验证计划"
  },
  engineering_blocker: {
    type: "coding_brief",
    title: "生成工程推进 Brief",
    expectedArtifact: "工程任务说明和验收标准"
  },
  team_constraint: {
    type: "operating_plan",
    title: "重排执行优先级",
    expectedArtifact: "本周取舍、负责人和风险缓解方案"
  },
  risk: {
    type: "risk_review",
    title: "制定风险确认清单",
    expectedArtifact: "风险列表、决策门槛和人工确认项"
  },
  opportunity: {
    type: "negotiation_prep",
    title: "准备机会推进方案",
    expectedArtifact: "机会推进草稿和不可承诺边界"
  },
  commitment: {
    type: "customer_followup",
    title: "确认承诺和跟进节奏",
    expectedArtifact: "承诺清单和跟进计划"
  }
};

export function extractSignals({ project, source, now = new Date().toISOString() } = {}) {
  const fragments = splitIntoFragments(source?.body || "");
  const fallbackType = inferSignalTypeFromSource(source?.kind);
  const signals = fragments
    .map((fragment) => buildSignalFromFragment({ fragment, source, fallbackType, now }))
    .filter((signal) => signal.summary.length >= 8)
    .slice(0, 8);

  const outputSignals = signals.length
    ? signals
    : [buildSignalFromFragment({ fragment: source?.body || "", source, fallbackType, now })];

  return {
    signals: outputSignals,
    runSummary: summarizeRun(project, source, outputSignals.length)
  };
}

function buildSignalFromFragment({ fragment, source, fallbackType, now }) {
  const type = classifyFragment(fragment, fallbackType);
  const confidence = scoreConfidence(fragment, type);
  const title = summarizeTitle(fragment, SIGNAL_TYPES[type] || "业务信号");

  return {
    id: makeId("sig"),
    sourceId: source?.id,
    type,
    title,
    summary: fragment,
    quote: excerpt(fragment),
    confidence,
    suggestedEntityIds: [],
    suggestedProjectIds: Array.isArray(source?.relatedProjectIds) ? source.relatedProjectIds : [],
    suggestedMemory: {
      type: SIGNAL_TO_MEMORY_TYPE[type] || "fact",
      title,
      content: fragment,
      confidence
    },
    suggestedAction: buildSuggestedAction(type, fragment),
    status: "new",
    createdBy: "ai",
    createdAt: now,
    updatedAt: now
  };
}

function buildSuggestedAction(type, fragment) {
  const template = SIGNAL_ACTION_TEMPLATES[type];
  if (!template) {
    return undefined;
  }

  return {
    ...template,
    whyNow: fragment,
    priority: type === "risk" || type === "engineering_blocker" ? "high" : "medium",
    riskLevel: type === "risk" || type === "investor_question" ? "high" : "medium",
    status: "pending",
    humanConfirmationChecklist: [
      "确认事实准确",
      "确认不会自动对外发送",
      "确认高风险承诺已改为待确认"
    ]
  };
}

function splitIntoFragments(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .split(/[\n。！？；;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => (item.length > 150 ? splitLongFragment(item) : [item]))
    .slice(0, 12);
}

function splitLongFragment(fragment) {
  const parts = fragment
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const groups = [];
  let current = "";

  parts.forEach((part) => {
    const next = current ? `${current}，${part}` : part;
    if (next.length > 130 && current) {
      groups.push(current);
      current = part;
    } else {
      current = next;
    }
  });

  if (current) {
    groups.push(current);
  }

  return groups;
}

function classifyFragment(fragment, fallback = "fact") {
  const lower = String(fragment || "").toLowerCase();
  const scored = SIGNAL_RULES.map((rule) => ({
    type: rule.type,
    score: rule.keywords.reduce(
      (total, keyword) => total + (lower.includes(keyword.toLowerCase()) ? 1 : 0),
      0
    )
  })).sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].type : fallback;
}

function scoreConfidence(fragment, type) {
  const lower = String(fragment || "").toLowerCase();
  const rule = SIGNAL_RULES.find((item) => item.type === type);
  const score =
    rule?.keywords.reduce(
      (total, keyword) => total + (lower.includes(keyword.toLowerCase()) ? 1 : 0),
      0
    ) ?? 0;

  if (score >= 2) {
    return 0.86;
  }

  if (score === 1) {
    return 0.68;
  }

  return 0.46;
}

function summarizeRun(project, source, signalCount) {
  const projectName = project?.name ? `「${project.name}」` : "当前项目";
  const sourceName = source?.title || "未命名 Source";
  return `${projectName}从「${sourceName}」提取 ${signalCount} 条 Signal。`;
}

function summarizeTitle(text, fallback) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) {
    return fallback;
  }

  return clean.length > 32 ? `${clean.slice(0, 32)}...` : clean;
}

function excerpt(value) {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  return clean.length > 180 ? `${clean.slice(0, 180)}...` : clean;
}

function inferSignalTypeFromSource(kind) {
  const map = {
    customer_feedback: "customer_need",
    investor_question: "investor_question",
    engineering_update: "engineering_blocker",
    founder_note: "decision",
    sales_note: "opportunity",
    support_note: "customer_need",
    meeting_note: "fact",
    manual_note: "fact",
    other: "fact"
  };

  return map[kind] || "fact";
}
