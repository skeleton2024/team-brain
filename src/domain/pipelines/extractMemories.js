import { MEMORY_TYPES } from "../types.js";
import { makeId } from "../../services/store.js";

const MEMORY_RULES = [
  {
    type: "customer_concern",
    keywords: [
      "客户",
      "用户",
      "担心",
      "顾虑",
      "质疑",
      "不愿意",
      "价格",
      "隐私",
      "权限",
      "数据",
      "准确",
      "customer",
      "feedback"
    ]
  },
  {
    type: "investor_question",
    keywords: [
      "投资人",
      "融资",
      "估值",
      "市场",
      "壁垒",
      "竞争",
      "ARR",
      "CAC",
      "LTV",
      "moat",
      "investor",
      "why now"
    ]
  },
  {
    type: "product_decision",
    keywords: [
      "决定",
      "产品",
      "路线",
      "roadmap",
      "MVP",
      "优先",
      "版本",
      "功能",
      "取舍",
      "不做",
      "先做"
    ]
  },
  {
    type: "engineering_blocker",
    keywords: [
      "工程",
      "技术",
      "阻塞",
      "bug",
      "API",
      "延迟",
      "部署",
      "数据库",
      "导入",
      "merge",
      "性能",
      "GitHub",
      "Slack"
    ]
  },
  {
    type: "team_constraint",
    keywords: [
      "团队",
      "人手",
      "时间",
      "资源",
      "容量",
      "创始人",
      "全职",
      "兼职",
      "本周",
      "deadline"
    ]
  },
  {
    type: "risk",
    keywords: [
      "风险",
      "可能",
      "合规",
      "法务",
      "延期",
      "流失",
      "承诺",
      "自动发送",
      "敏感",
      "安全"
    ]
  },
  {
    type: "opportunity",
    keywords: [
      "机会",
      "愿意付费",
      "付费意向",
      "试点",
      "pilot",
      "合作",
      "增长",
      "转介绍",
      "需求",
      "可以卖"
    ]
  }
];

export function extractMemories({ project, context, now = new Date().toISOString(), defaultType } = {}) {
  const text = context?.body || "";
  const source = context?.title || "未命名上下文";
  const sourceContextId = context?.id;
  const fallbackType = defaultType || inferTypeFromContext(context?.kind);
  const fragments = splitIntoFragments(text);

  const memories = fragments
    .map((fragment) => buildMemoryFromFragment(fragment, fallbackType, source, sourceContextId, now))
    .filter((memory) => memory.detail.length >= 8);

  const outputMemories = memories.length > 0 ? memories.slice(0, 8) : [buildFallbackMemory(text, fallbackType, source, sourceContextId, now)];

  return {
    memories: outputMemories,
    runSummary: summarizeRun(project, source, outputMemories.length)
  };
}

export function makeSourceReference({ contextId, quote, note, confidence }) {
  return {
    contextId: contextId || "ctx-unknown-source",
    quote: excerpt(quote),
    note,
    confidence: confidenceScoreValue(confidence)
  };
}

export function summarizeTitle(text, fallback) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) {
    return fallback;
  }

  return clean.length > 28 ? `${clean.slice(0, 28)}...` : clean;
}

function buildMemoryFromFragment(fragment, fallbackType, source, sourceContextId, now) {
  const type = classifyFragment(fragment, fallbackType);
  const confidence = scoreConfidence(fragment, type);

  return {
    id: makeId("mem"),
    type,
    title: summarizeTitle(fragment, MEMORY_TYPES[type]?.label ?? "公司记忆"),
    detail: fragment,
    source,
    confidence,
    status: "draft",
    sourceReferences: [
      makeSourceReference({
        contextId: sourceContextId,
        quote: fragment,
        note: source,
        confidence
      })
    ],
    createdBy: "ai",
    createdAt: now,
    updatedAt: now
  };
}

function buildFallbackMemory(text, fallbackType, source, sourceContextId, now) {
  const confidence = "low";
  const detail = text.slice(0, 280);

  return {
    id: makeId("mem"),
    type: fallbackType || "fact",
    title: summarizeTitle(text, "新增公司事实"),
    detail,
    source,
    confidence,
    status: "draft",
    sourceReferences: [
      makeSourceReference({
        contextId: sourceContextId,
        quote: detail,
        note: source,
        confidence
      })
    ],
    createdBy: "ai",
    createdAt: now,
    updatedAt: now
  };
}

function summarizeRun(project, source, memoryCount) {
  const projectName = project?.name ? `「${project.name}」` : "当前项目";
  return `${projectName}从「${source}」提取 ${memoryCount} 条候选记忆。`;
}

function splitIntoFragments(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .split(/[\n。！？!?；;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => (item.length > 140 ? splitLongFragment(item) : [item]))
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
    if (next.length > 120 && current) {
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
  const scored = MEMORY_RULES.map((rule) => ({
    type: rule.type,
    score: rule.keywords.reduce(
      (total, keyword) => total + (fragment.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0),
      0
    )
  })).sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].type : fallback;
}

function scoreConfidence(fragment, type) {
  const rule = MEMORY_RULES.find((item) => item.type === type);
  const score =
    rule?.keywords.reduce(
      (total, keyword) => total + (fragment.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0),
      0
    ) ?? 0;

  if (score >= 2) {
    return "high";
  }

  if (score === 1) {
    return "medium";
  }

  return "low";
}

function confidenceScoreValue(confidence) {
  const scores = {
    high: 0.9,
    medium: 0.7,
    low: 0.45
  };

  return scores[confidence] ?? 0.5;
}

function excerpt(value) {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  return clean.length > 180 ? `${clean.slice(0, 180)}...` : clean;
}

function inferTypeFromContext(kind) {
  const map = {
    customer: "customer_concern",
    investor: "investor_question",
    engineering: "engineering_blocker",
    founder: "product_decision",
    meeting: "fact",
    other: "fact"
  };

  return map[kind] || "fact";
}
