import { makeId } from "../../services/store.js";

const REVIEW_OPERATIONS = new Set(["update", "conflict", "outdate"]);
const ACTIVE_EXISTING_STATUSES = new Set(["draft", "confirmed", "disputed"]);

const CONCERN_TERMS = [
  "担心",
  "顾虑",
  "质疑",
  "问题",
  "风险",
  "阻塞",
  "反对",
  "拒绝",
  "concern",
  "worried",
  "worry",
  "risk",
  "blocker",
  "problem"
];

const RESOLVED_TERMS = [
  "不担心",
  "不再担心",
  "不是问题",
  "不成问题",
  "无需担心",
  "已经解决",
  "已解决",
  "解决了",
  "不再是问题",
  "no longer",
  "not concerned",
  "not a concern",
  "is not a problem",
  "resolved"
];

const NEGATION_TERMS = [
  "不",
  "不是",
  "不再",
  "无需",
  "没有",
  "已不",
  "已经不",
  "not",
  "no longer",
  "without"
];

const TOPIC_ANCHORS = [
  "价格",
  "roi",
  "权限",
  "数据",
  "安全",
  "隐私",
  "删除",
  "上线",
  "试点",
  "留存",
  "投资人",
  "slack",
  "github",
  "api",
  "price",
  "pricing",
  "security",
  "privacy",
  "pilot",
  "retention"
];

export function reconcileMemories({
  existingMemories = [],
  candidateMemories = [],
  now = new Date().toISOString()
} = {}) {
  const acceptedMemories = [];
  const reconciliationResults = [];
  const memoryUpdates = [];

  candidateMemories.forEach((candidate) => {
    const existingPool = existingMemories.filter(isComparableMemory);
    const batchDuplicate = findBatchDuplicate(candidate, acceptedMemories);
    const decision = batchDuplicate || decideCandidate(candidate, existingPool);
    const result = buildReconciliationResult(candidate, decision, now);

    reconciliationResults.push(result);

    if (decision.operation === "new") {
      acceptedMemories.push(candidate);
      return;
    }

    if (REVIEW_OPERATIONS.has(decision.operation) && decision.existingMemory) {
      memoryUpdates.push(buildMemoryUpdate(candidate, decision));
    }
  });

  return {
    acceptedMemories,
    reconciliationResults,
    memoryUpdates
  };
}

function findBatchDuplicate(candidate, acceptedMemories) {
  const duplicate = acceptedMemories
    .map((acceptedMemory) => ({
      acceptedMemory,
      score: compareMemories(acceptedMemory, candidate)
    }))
    .find((match) => match.score.sameType && (match.score.exact || match.score.total >= 0.86));

  if (!duplicate) {
    return null;
  }

  return {
    operation: "duplicate",
    existingMemory: duplicate.acceptedMemory,
    reason: "候选记忆与本次已接受的记忆重复，跳过重复写入。"
  };
}

function decideCandidate(candidate, existingMemories) {
  const rankedMatches = existingMemories
    .map((existingMemory) => ({
      existingMemory,
      score: compareMemories(existingMemory, candidate)
    }))
    .filter((match) => match.score.topic >= 0.18 || match.score.exact || match.score.sameTypeTopic)
    .sort((left, right) => right.score.total - left.score.total);

  const best = rankedMatches[0];
  if (!best) {
    return {
      operation: "new",
      reason: "未找到同类型或同主题的现有记忆。"
    };
  }

  const { existingMemory, score } = best;
  const reversal = detectReversal(existingMemory, candidate, score);

  if (reversal) {
    return {
      operation: reversal.operation,
      existingMemory,
      reason: reversal.reason
    };
  }

  if (score.exact || score.total >= 0.86) {
    return {
      operation: "duplicate",
      existingMemory,
      reason: "候选记忆与现有记忆高度相似，跳过重复写入。"
    };
  }

  if (score.sameTypeTopic && isMoreComplete(candidate, existingMemory)) {
    return {
      operation: "update",
      existingMemory,
      reason: "候选记忆与现有记忆主题一致，但包含更完整或更新的细节。",
      suggestedMemory: mergeSuggestedMemory(existingMemory, candidate)
    };
  }

  if (score.sameTypeTopic && score.total >= 0.58) {
    return {
      operation: "duplicate",
      existingMemory,
      reason: "候选记忆与现有记忆表达不同但信息重叠，暂不重复新增。"
    };
  }

  return {
    operation: "new",
    reason: "同类型记忆中未发现足够重叠或冲突的内容。"
  };
}

function buildReconciliationResult(candidate, decision, now) {
  return {
    id: makeId("rec"),
    candidateMemoryId: candidate.id,
    ...(candidate.sourceReferences?.[0]?.contextId
      ? { sourceContextId: candidate.sourceReferences[0].contextId }
      : {}),
    ...(decision.existingMemory ? { existingMemoryId: decision.existingMemory.id } : {}),
    operation: decision.operation,
    reason: decision.reason,
    ...(decision.suggestedMemory ? { suggestedMemory: decision.suggestedMemory } : {}),
    requiresHumanReview: REVIEW_OPERATIONS.has(decision.operation),
    createdAt: now
  };
}

function buildMemoryUpdate(candidate, decision) {
  const operationMap = {
    update: "update",
    conflict: "dispute",
    outdate: "outdate"
  };

  return {
    memoryId: decision.existingMemory.id,
    candidateMemoryId: candidate.id,
    operation: operationMap[decision.operation],
    reason: decision.reason,
    suggestedContent: memoryText(candidate)
  };
}

function compareMemories(existingMemory, candidate) {
  const sameType = existingMemory.type === candidate.type;
  const existingText = memoryText(existingMemory);
  const candidateText = memoryText(candidate);
  const contentSimilarity = similarity(existingText, candidateText);
  const titleSimilarity = similarity(existingMemory.title, candidate.title);
  const topic = Math.max(contentSimilarity, titleSimilarity, sharedKeywordScore(existingText, candidateText));
  const exact =
    normalize(existingMemory.title) === normalize(candidate.title) ||
    normalize(existingText) === normalize(candidateText);
  const sameTypeTopic = sameType && topic >= 0.24;

  return {
    sameType,
    sameTypeTopic,
    exact,
    topic,
    total: (sameType ? 0.18 : 0) + Math.max(contentSimilarity, titleSimilarity) + (exact ? 0.24 : 0)
  };
}

function detectReversal(existingMemory, candidate, score) {
  if (!score.sameTypeTopic && score.topic < 0.28) {
    return null;
  }

  const existingText = `${existingMemory.title} ${memoryText(existingMemory)}`;
  const candidateText = `${candidate.title} ${memoryText(candidate)}`;
  const existingHasConcern = includesAny(existingText, CONCERN_TERMS);
  const candidateHasConcern = includesAny(candidateText, CONCERN_TERMS);
  const existingResolved = includesAny(existingText, RESOLVED_TERMS);
  const candidateResolved = includesAny(candidateText, RESOLVED_TERMS);
  const candidateNegatesTopic = includesAny(candidateText, NEGATION_TERMS) && score.topic >= 0.32;

  if ((candidateResolved || candidateNegatesTopic) && existingHasConcern && !existingResolved) {
    return {
      operation: "outdate",
      reason: "新上下文显示旧记忆中的担忧或阻塞可能已经过期。"
    };
  }

  if (candidateHasConcern && existingResolved) {
    return {
      operation: "conflict",
      reason: "新上下文重新提出了旧记忆已解决的信息，需人工确认。"
    };
  }

  if (candidateNegatesTopic && score.topic >= 0.48) {
    return {
      operation: "conflict",
      reason: "新旧记忆围绕同一主题出现相反判断，暂不自动覆盖。"
    };
  }

  return null;
}

function mergeSuggestedMemory(existingMemory, candidate) {
  const sourceReferences = [
    ...(Array.isArray(candidate.sourceReferences) ? candidate.sourceReferences : []),
    ...(Array.isArray(existingMemory.sourceReferences) ? existingMemory.sourceReferences : [])
  ].filter(
    (reference, index, items) =>
      items.findIndex(
        (item) =>
          item.contextId === reference.contextId &&
          normalize(item.quote) === normalize(reference.quote)
      ) === index
  );

  return {
    ...existingMemory,
    title: candidate.title.length > existingMemory.title.length ? candidate.title : existingMemory.title,
    detail: memoryText(candidate).length > memoryText(existingMemory).length ? memoryText(candidate) : memoryText(existingMemory),
    content: candidate.content || candidate.detail || existingMemory.content || existingMemory.detail,
    confidence: strongerConfidence(existingMemory.confidence, candidate.confidence),
    sourceReferences,
    updatedAt: candidate.updatedAt || existingMemory.updatedAt
  };
}

function isMoreComplete(candidate, existingMemory) {
  const candidateLength = normalize(memoryText(candidate)).length;
  const existingLength = normalize(memoryText(existingMemory)).length;
  const candidateSources = candidate.sourceReferences?.length ?? 0;
  const existingSources = existingMemory.sourceReferences?.length ?? 0;

  return candidateLength > existingLength * 1.2 || candidateSources > existingSources;
}

function isComparableMemory(memory) {
  return ACTIVE_EXISTING_STATUSES.has(memory.status || "draft");
}

function strongerConfidence(left, right) {
  const rank = {
    low: 0,
    medium: 1,
    high: 2
  };

  return (rank[right] ?? 0) > (rank[left] ?? 0) ? right : left;
}

function similarity(left, right) {
  const leftFeatures = features(left);
  const rightFeatures = features(right);
  if (!leftFeatures.size || !rightFeatures.size) {
    return 0;
  }

  const intersection = [...leftFeatures].filter((item) => rightFeatures.has(item)).length;
  const union = new Set([...leftFeatures, ...rightFeatures]).size;

  return intersection / union;
}

function sharedKeywordScore(left, right) {
  const sharedAnchors = TOPIC_ANCHORS.filter(
    (term) => includesAny(left, [term]) && includesAny(right, [term])
  );
  if (sharedAnchors.length) {
    return Math.min(0.72, 0.34 + sharedAnchors.length * 0.16);
  }

  const leftKeywords = keywordFeatures(left);
  const rightKeywords = keywordFeatures(right);
  if (!leftKeywords.size || !rightKeywords.size) {
    return 0;
  }

  const shared = [...leftKeywords].filter((item) => rightKeywords.has(item)).length;
  return shared / Math.max(leftKeywords.size, rightKeywords.size);
}

function features(value) {
  const normalized = normalize(value);
  const parts = normalized.match(/[a-z0-9]+|\p{Script=Han}/gu) || [];
  const output = new Set(parts.filter((part) => part.length > 1 || /\p{Script=Han}/u.test(part)));

  for (let index = 0; index < normalized.length - 1; index += 1) {
    output.add(normalized.slice(index, index + 2));
  }

  return output;
}

function keywordFeatures(value) {
  const normalized = normalize(value);
  const parts = normalized.match(/[a-z0-9]+|\p{Script=Han}{2,}/gu) || [];
  return new Set(parts.filter((part) => part.length >= 2));
}

function memoryText(memory) {
  return memory.content || memory.detail || "";
}

function includesAny(text, terms) {
  const lower = String(text || "").toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}
