import { ACTION_TYPES, MEMORY_TYPES } from "./types.js";
import { makeId } from "../services/store.js";

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

const ACTION_BY_MEMORY_TYPE = {
  customer_concern: {
    type: "customer_followup",
    title: "准备客户 follow-up 草稿",
    expectedOutput: "不自动发送的客户 follow-up 草稿、问题清单和确认项",
    priority: "high",
    riskLevel: "medium"
  },
  investor_question: {
    type: "investor_reply",
    title: "整理投资人回复 Brief",
    expectedOutput: "投资人问答草稿、证据缺口和创始人确认项",
    priority: "high",
    riskLevel: "high"
  },
  product_decision: {
    type: "product_plan",
    title: "更新产品路线和取舍说明",
    expectedOutput: "产品路线、非目标清单和下一步验证计划",
    priority: "medium",
    riskLevel: "low"
  },
  engineering_blocker: {
    type: "coding_brief",
    title: "生成工程推进 Brief",
    expectedOutput: "可交给开发者执行的任务 Brief 和验收标准",
    priority: "high",
    riskLevel: "low"
  },
  team_constraint: {
    type: "operating_plan",
    title: "重排本周执行优先级",
    expectedOutput: "本周任务取舍、负责人和风险缓冲",
    priority: "medium",
    riskLevel: "low"
  },
  risk: {
    type: "risk_review",
    title: "制定风险确认清单",
    expectedOutput: "风险列表、决策门槛和人工确认项",
    priority: "high",
    riskLevel: "high"
  },
  opportunity: {
    type: "negotiation_prep",
    title: "准备试点推进方案",
    expectedOutput: "试点提案、下一次沟通草稿和不可承诺边界",
    priority: "medium",
    riskLevel: "medium"
  },
  result_learning: {
    type: "learning_loop",
    title: "复盘结果并生成下一步",
    expectedOutput: "结果学习、待验证假设和后续行动",
    priority: "medium",
    riskLevel: "low"
  }
};

const ACTIVE_MEMORY_STATUSES = new Set(["confirmed", "draft", "disputed"]);
const MEMORY_STATUS_ORDER = {
  confirmed: 0,
  draft: 1,
  disputed: 2
};
const MEMORY_TRANSITION_STATUS = new Set([
  "draft",
  "confirmed",
  "outdated",
  "disputed",
  "archived"
]);

export function absorbContext(project, input) {
  const now = new Date().toISOString();
  const context = {
    id: makeId("ctx"),
    kind: input.kind,
    title: input.title || "未命名上下文",
    body: input.body,
    occurredAt: input.occurredAt || now,
    participants: normalizeList(input.participants),
    tags: normalizeList(input.tags),
    importance: normalizeImportance(input.importance),
    createdAt: now,
    updatedAt: now,
    memoryIds: [],
    actionIds: []
  };

  const memories = extractMemories(input.body, {
    source: context.title,
    sourceContextId: context.id,
    defaultType: inferTypeFromContext(input.kind)
  }).filter((memory) => !hasSimilarMemory(project.memories, memory));

  context.memoryIds = memories.map((memory) => memory.id);

  const actions = proposeActions(project, memories);
  context.actionIds = actions.map((action) => action.id);

  return {
    ...project,
    updatedAt: now,
    contexts: [context, ...project.contexts],
    memories: [...memories, ...project.memories],
    actions: mergeActions(actions, project.actions)
  };
}

export function generateBrief(project, actionId) {
  const action = project.actions.find((item) => item.id === actionId);
  if (!action) {
    return project;
  }

  const existingBrief = project.briefs.find((brief) => brief.actionId === actionId);
  if (existingBrief) {
    return {
      ...project,
      actions: project.actions.map((item) =>
        item.id === actionId ? { ...item, status: "briefed", briefId: existingBrief.id } : item
      )
    };
  }

  const memories = resolveMemories(project, action.sourceMemoryIds);
  const brief = buildBrief(project, action, memories);

  return {
    ...project,
    updatedAt: new Date().toISOString(),
    briefs: [brief, ...project.briefs],
    actions: project.actions.map((item) =>
      item.id === actionId ? { ...item, status: "briefed", briefId: brief.id } : item
    )
  };
}

export function updateMemoryStatus(project, memoryId, status) {
  if (!MEMORY_TRANSITION_STATUS.has(status)) {
    return project;
  }

  const now = new Date().toISOString();
  let changed = false;

  const memories = project.memories.map((memory) => {
    if (memory.id !== memoryId || memory.status === status) {
      return memory;
    }

    changed = true;
    return {
      ...memory,
      status,
      updatedAt: now,
      ...(status === "confirmed" ? { lastVerifiedAt: now } : {})
    };
  });

  if (!changed) {
    return project;
  }

  return {
    ...project,
    updatedAt: now,
    memories
  };
}

export function recordActionResult(project, actionId, resultInput) {
  const now = new Date().toISOString();
  const action = project.actions.find((item) => item.id === actionId);
  if (!action) {
    return project;
  }

  const result = {
    id: makeId("result"),
    actionId,
    outcome: resultInput.outcome,
    summary: resultInput.summary,
    createdAt: now,
    memoryIds: [],
    actionIds: []
  };

  const resultContext = {
    id: makeId("ctx"),
    kind: "other",
    title: `行动结果：${action.title}`,
    body: resultInput.summary,
    occurredAt: now,
    participants: [],
    tags: ["结果回流"],
    importance: resultInput.outcome === "blocked" ? "high" : "medium",
    createdAt: now,
    updatedAt: now,
    memoryIds: [],
    actionIds: []
  };

  const extracted = extractMemories(resultInput.summary, {
    source: resultContext.title,
    sourceContextId: resultContext.id,
    defaultType: "result_learning"
  });

  const resultConfidence = "high";
  const resultMemory = {
    id: makeId("mem"),
    type: "result_learning",
    title: summarizeTitle(resultInput.summary, "执行结果已回流"),
    detail: resultInput.summary,
    source: resultContext.title,
    confidence: resultConfidence,
    status: "draft",
    sourceReferences: [
      makeSourceReference({
        contextId: resultContext.id,
        quote: resultInput.summary,
        note: resultContext.title,
        confidence: resultConfidence
      })
    ],
    createdBy: "ai",
    createdAt: now,
    updatedAt: now
  };

  const newMemories = [resultMemory, ...extracted].filter(
    (memory, index, items) =>
      items.findIndex((item) => normalize(item.title) === normalize(memory.title)) === index
  );

  result.memoryIds = newMemories.map((memory) => memory.id);

  const followUpActions = proposeResultActions(project, action, resultInput, newMemories);
  result.actionIds = followUpActions.map((item) => item.id);
  resultContext.memoryIds = result.memoryIds;
  resultContext.actionIds = result.actionIds;

  return {
    ...project,
    updatedAt: now,
    contexts: [resultContext, ...project.contexts],
    memories: [...newMemories, ...project.memories],
    actions: mergeActions(
      followUpActions,
      project.actions.map((item) =>
        item.id === actionId ? { ...item, status: "done", resultId: result.id } : item
      )
    ),
    results: [result, ...project.results]
  };
}

function extractMemories(text, options) {
  const fragments = splitIntoFragments(text);
  const now = new Date().toISOString();

  const memories = fragments
    .map((fragment) => {
      const type = classifyFragment(fragment, options.defaultType);
      const confidence = scoreConfidence(fragment, type);
      return {
        id: makeId("mem"),
        type,
        title: summarizeTitle(fragment, MEMORY_TYPES[type]?.label ?? "公司记忆"),
        detail: fragment,
        source: options.source,
        confidence,
        status: "draft",
        sourceReferences: [
          makeSourceReference({
            contextId: options.sourceContextId,
            quote: fragment,
            note: options.source,
            confidence
          })
        ],
        createdBy: "ai",
        createdAt: now,
        updatedAt: now
      };
    })
    .filter((memory) => memory.detail.length >= 8);

  if (memories.length > 0) {
    return memories.slice(0, 8);
  }

  const confidence = "low";
  const detail = text.slice(0, 280);

  return [
    {
      id: makeId("mem"),
      type: options.defaultType || "fact",
      title: summarizeTitle(text, "新增公司事实"),
      detail,
      source: options.source,
      confidence,
      status: "draft",
      sourceReferences: [
        makeSourceReference({
          contextId: options.sourceContextId,
          quote: detail,
          note: options.source,
          confidence
        })
      ],
      createdBy: "ai",
      createdAt: now,
      updatedAt: now
    }
  ];
}

function proposeActions(project, memories) {
  const usableMemories = memories
    .filter(isUsableActionMemory)
    .sort(compareMemoryEvidenceStrength);
  const byType = groupBy(usableMemories, "type");

  return Object.entries(byType)
    .map(([memoryType, sourceMemories]) => buildActionForMemoryType(memoryType, sourceMemories))
    .filter(Boolean)
    .filter((action) => !hasSimilarAction(project.actions, action))
    .slice(0, 5);
}

function proposeResultActions(project, completedAction, resultInput, memories) {
  const text = resultInput.summary;
  const actions = [];
  const sourceMemoryIds = memories.filter(isUsableActionMemory).map((memory) => memory.id);

  if (resultInput.outcome === "positive" || includesAny(text, ["愿意", "同意", "下周", "试点", "付费", "推进"])) {
    actions.push({
      id: makeId("act"),
      type: "negotiation_prep",
      title: "准备下一轮推进方案",
      rationale: "结果显示对方有继续推进信号，需要把下一步边界和成功标准写清楚。",
      priority: "high",
      riskLevel: "medium",
      expectedOutput: "下一轮沟通草稿、试点范围和人工确认清单",
      sourceMemoryIds,
      status: "pending",
      requiresHumanConfirmation: true,
      createdAt: new Date().toISOString()
    });
  }

  if (resultInput.outcome === "blocked" || includesAny(text, ["拒绝", "没有", "卡住", "担心", "延迟", "风险"])) {
    actions.push({
      id: makeId("act"),
      type: "risk_review",
      title: "整理阻塞原因和降风险方案",
      rationale: "执行结果暴露了新的阻塞，需要更新判断并避免过早承诺。",
      priority: "high",
      riskLevel: "high",
      expectedOutput: "阻塞拆解、备选方案和创始人决策项",
      sourceMemoryIds,
      status: "pending",
      requiresHumanConfirmation: true,
      createdAt: new Date().toISOString()
    });
  }

  if (includesAny(text, ["bug", "工程", "技术", "接口", "部署", "数据", "权限"])) {
    actions.push({
      id: makeId("act"),
      type: "coding_brief",
      title: "更新工程修复 Brief",
      rationale: "结果中出现工程或数据问题，需要转成可执行任务并确认验收标准。",
      priority: "high",
      riskLevel: "low",
      expectedOutput: "开发任务说明、验收标准和回归检查",
      sourceMemoryIds,
      status: "pending",
      requiresHumanConfirmation: true,
      createdAt: new Date().toISOString()
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: makeId("act"),
      type: "learning_loop",
      title: "复盘执行结果并更新下一步",
      rationale: `行动“${completedAction.title}”已有回流，适合把学习转成下一轮验证。`,
      priority: "medium",
      riskLevel: "low",
      expectedOutput: "学习摘要、假设变化和下一步建议",
      sourceMemoryIds,
      status: "pending",
      requiresHumanConfirmation: true,
      createdAt: new Date().toISOString()
    });
  }

  return actions.filter((action) => !hasSimilarAction(project.actions, action));
}

function buildActionForMemoryType(memoryType, memories) {
  const template = ACTION_BY_MEMORY_TYPE[memoryType] || ACTION_BY_MEMORY_TYPE.result_learning;
  if (!template) {
    return null;
  }

  const sourceMemories = memories.filter(isUsableActionMemory).sort(compareMemoryEvidenceStrength);
  const lead = sourceMemories[0];
  if (!lead) {
    return null;
  }
  const statusNote = actionEvidenceStatusNote(sourceMemories);

  return {
    id: makeId("act"),
    type: template.type,
    title: adaptActionTitle(template.title, lead),
    rationale: `${statusNote}来自记忆“${lead.title}”。${lead.detail}`,
    priority: template.priority,
    riskLevel: template.riskLevel,
    expectedOutput: template.expectedOutput,
    sourceMemoryIds: sourceMemories.map((memory) => memory.id),
    status: "pending",
    requiresHumanConfirmation: true,
    createdAt: new Date().toISOString()
  };
}

function buildBrief(project, action, memories) {
  const memoryText = memories.map((memory) => `- ${memory.title}: ${memory.detail}`).join("\n");
  const typeName = ACTION_TYPES[action.type] || action.type;

  return {
    id: makeId("brief"),
    actionId: action.id,
    createdAt: new Date().toISOString(),
    title: `${action.title} Brief`,
    sections: {
      goal: `完成“${action.title}”，产出 ${action.expectedOutput}。`,
      background:
        memoryText ||
        `${project.name} 当前处于 ${project.stage}，需要把上下文转成可执行动作。`,
      strategy: buildStrategy(action),
      draft: buildDraft(project, action, memories, typeName),
      risks: buildRiskNotes(action),
      successCriteria: [
        "输出能被团队成员直接审阅和修改",
        "没有自动发送、自动承诺或自动修改外部系统",
        "关键假设、证据缺口和风险边界被写清楚",
        "执行后可以把结果回填到 TeamMind"
      ],
      checklist: [
        "创始人确认事实是否准确",
        "负责人确认下一步是否可执行",
        "高风险承诺已删除或改成待确认表述",
        "对外发送前完成最后人工审阅"
      ]
    }
  };
}

function buildStrategy(action) {
  const strategies = {
    customer_followup: [
      "先回应客户明确提出的顾虑，再给出最小可试用范围",
      "把敏感数据、权限和删除机制写成待确认项",
      "只请求一个低摩擦的下一步，不要求客户立刻大规模迁移"
    ],
    investor_reply: [
      "把问题拆成事实、假设和待补证据三类",
      "用当前 traction 和学习速度回答，而不是过度承诺",
      "把不确定项标成后续补充材料"
    ],
    coding_brief: [
      "限定任务边界，优先完成闭环路径",
      "写清楚输入、状态变化、验收标准和不做事项",
      "保留人工确认，不触发自动外部操作"
    ],
    product_plan: [
      "围绕 60 秒 Demo 排序，不为未来集成提前铺太重",
      "把非目标写清楚，减少团队分心",
      "用结果回流验证行动建议是否有价值"
    ],
    negotiation_prep: [
      "先确认对方目标和约束，再提出可逆试点",
      "明确不可承诺边界，避免把草稿当作最终协议",
      "把成功标准写成双方都能验证的事实"
    ],
    risk_review: [
      "列出风险触发条件、影响范围和缓解动作",
      "把需要人工确认的点前置",
      "遇到合规、金钱或承诺问题时升级给创始人"
    ],
    operating_plan: [
      "把本周工作压缩到最少关键路径",
      "每个动作只保留一个负责人和一个验收结果",
      "推迟不影响 Demo 闭环的集成与自动化"
    ],
    learning_loop: [
      "把结果转成新的事实、假设变化和后续行动",
      "优先处理会改变产品方向或客户承诺的信息",
      "保留原始结果，避免只沉淀结论"
    ]
  };

  return strategies[action.type] || strategies.learning_loop;
}

function buildDraft(project, action, memories, typeName) {
  const mainMemory = memories[0]?.detail || action.rationale;

  if (action.type === "customer_followup") {
    return [
      `主题：关于 ${project.name} 试用范围和数据边界的下一步`,
      "",
      "你好，",
      "",
      `我们整理了上次沟通里的重点：${mainMemory}`,
      "",
      "建议下一步先做一个小范围试用，只使用你们确认可放入的材料，并在试用前明确数据范围、访问权限和删除方式。",
      "",
      "如果这个方向可行，我建议我们约 25 分钟确认试用边界和成功标准。",
      "",
      "这封邮件只是草稿，发送前需要团队人工确认。"
    ].join("\n");
  }

  if (action.type === "investor_reply") {
    return [
      "投资人回复草稿",
      "",
      `当前判断：${mainMemory}`,
      "",
      "我们会把已验证事实、仍在验证的假设、以及下一步补证计划分开说明。对尚未验证的数据，不做确定性承诺。",
      "",
      "待补材料：最新客户访谈摘要、使用频率证据、关键风险处理策略。"
    ].join("\n");
  }

  if (action.type === "coding_brief") {
    return [
      "工程任务 Brief",
      "",
      `目标：${action.title}`,
      `背景：${mainMemory}`,
      "",
      "实现范围：完成界面内闭环状态更新、数据持久化和可演示 Demo。",
      "不做范围：不接真实外部工具，不自动发送邮件，不自动修改代码仓库。",
      "验收：用户可以新增上下文、看到记忆和行动、生成 Brief、填写结果并产生新记忆。"
    ].join("\n");
  }

  return [
    `${typeName} 草稿`,
    "",
    `项目：${project.name}`,
    `行动：${action.title}`,
    `背景：${mainMemory}`,
    "",
    "建议先确认事实，再确认边界，最后确认下一步负责人和时间点。所有对外内容发送前都需要人工审阅。"
  ].join("\n");
}

function buildRiskNotes(action) {
  const notes = [
    "不要把建议草稿当成最终承诺",
    "不要自动发送邮件或消息",
    "涉及价格、法务、数据权限、融资承诺时必须人工确认"
  ];

  if (action.type === "coding_brief") {
    notes.push("不要自动修改、提交或 merge 代码");
  }

  if (action.riskLevel === "high") {
    notes.push("高风险行动需要创始人或负责人二次确认");
  }

  return notes;
}

function splitIntoFragments(text) {
  return text
    .replace(/\r/g, "\n")
    .split(/[\n。！？!?；;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => (item.length > 140 ? splitLongFragment(item) : [item]))
    .slice(0, 12);
}

function splitLongFragment(fragment) {
  const parts = fragment.split(/[，,]/).map((item) => item.trim()).filter(Boolean);
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

function makeSourceReference({ contextId, quote, note, confidence }) {
  return {
    contextId: contextId || "ctx-unknown-source",
    quote: excerpt(quote),
    note,
    confidence: confidenceScoreValue(confidence)
  };
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

function summarizeTitle(text, fallback) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) {
    return fallback;
  }

  return clean.length > 28 ? `${clean.slice(0, 28)}...` : clean;
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

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}

function mergeActions(incoming, existing) {
  return [...incoming, ...existing].filter(
    (action, index, items) =>
      items.findIndex(
        (item) =>
          normalize(item.title) === normalize(action.title) &&
          item.status !== "done" &&
          action.status !== "done"
      ) === index
  );
}

function resolveMemories(project, memoryIds) {
  const ids = new Set(memoryIds || []);
  return project.memories.filter((memory) => ids.has(memory.id));
}

function hasSimilarMemory(existing, memory) {
  return existing.some(
    (item) =>
      item.status !== "outdated" &&
      item.status !== "archived" &&
      item.type === memory.type &&
      (normalize(item.title) === normalize(memory.title) ||
        normalize(item.detail).includes(normalize(memory.detail).slice(0, 18)))
  );
}

function isUsableActionMemory(memory) {
  return ACTIVE_MEMORY_STATUSES.has(memory.status || "draft");
}

function compareMemoryEvidenceStrength(left, right) {
  return (
    (MEMORY_STATUS_ORDER[left.status || "draft"] ?? 1) -
    (MEMORY_STATUS_ORDER[right.status || "draft"] ?? 1)
  );
}

function actionEvidenceStatusNote(memories) {
  const statuses = new Set(memories.map((memory) => memory.status || "draft"));
  if (statuses.has("disputed")) {
    return "包含有争议记忆，请人工复核。";
  }

  if (statuses.has("draft")) {
    return "依据包含待确认记忆，请人工复核。";
  }

  return "";
}

function hasSimilarAction(existing, action) {
  return existing.some(
    (item) => item.status !== "done" && normalize(item.title) === normalize(action.title)
  );
}

function adaptActionTitle(title, memory) {
  if (!memory?.title) {
    return title;
  }

  if (memory.type === "engineering_blocker") {
    return `推进工程阻塞：${memory.title}`;
  }

  if (memory.type === "investor_question") {
    return `回复投资人问题：${memory.title}`;
  }

  if (memory.type === "customer_concern") {
    return `回应客户顾虑：${memory.title}`;
  }

  return title;
}

function includesAny(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeImportance(value) {
  return ["low", "medium", "high"].includes(value) ? value : "medium";
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}
