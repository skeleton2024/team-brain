const now = new Date().toISOString();
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const oneDayAhead = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const demoContextId = "ctx-demo-1";

export const DEMO_PROJECT = {
  id: "project-demo-northstar",
  name: "Northstar Copilot",
  stage: "客户发现 / Pre-seed",
  createdAt: now,
  updatedAt: now,
  sources: [
    {
      id: "src-demo-1",
      kind: "meeting_note",
      title: "周一增长和客户访谈复盘原文",
      body:
        "我们采访了 5 个早期 SaaS 团队。客户愿意尝试把会议纪要和客户反馈放进一个公司记忆系统，但他们担心敏感数据和权限边界。一个付费意向客户希望先看到投资人问答和客户 follow-up 的草稿。",
      origin: "manual",
      externalRef: "周一增长复盘",
      occurredAt: twoDaysAgo,
      receivedAt: twoDaysAgo,
      participants: ["增长负责人", "创始人", "客户访谈小组"],
      relatedEntityIds: ["ent-demo-founder", "ent-demo-customer-team"],
      relatedProjectIds: ["project-demo-northstar"],
      tags: ["客户发现", "权限", "MVP"],
      importance: "high",
      status: "processed",
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo
    }
  ],
  signals: [
    {
      id: "sig-demo-1",
      sourceId: "src-demo-1",
      type: "customer_need",
      title: "客户愿意试用但担心权限边界",
      summary: "客户愿意尝试公司记忆系统，但需要先确认敏感数据和权限边界。",
      quote: "客户愿意尝试把会议纪要和客户反馈放进一个公司记忆系统，但他们担心敏感数据和权限边界。",
      confidence: 0.86,
      suggestedEntityIds: ["ent-demo-founder", "ent-demo-customer-team"],
      suggestedProjectIds: ["project-demo-northstar"],
      suggestedMemory: {
        type: "customer_concern",
        title: "客户愿意试用但担心权限边界",
        content: "客户愿意尝试公司记忆系统，但需要先确认敏感数据和权限边界。",
        confidence: 0.86
      },
      suggestedAction: {
        type: "customer_followup",
        title: "准备客户 follow-up 草稿",
        whyNow: "客户已经表达试用兴趣，但权限边界仍需人工确认。",
        priority: "high",
        riskLevel: "medium",
        expectedArtifact: "客户 follow-up 草稿和待确认问题",
        status: "pending",
        humanConfirmationChecklist: ["确认事实准确", "确认不会自动对外发送"]
      },
      status: "new",
      createdBy: "ai",
      createdAt: oneDayAgo,
      updatedAt: oneDayAgo
    }
  ],
  entities: [
    {
      id: "ent-demo-founder",
      type: "team_member",
      name: "创始人",
      role: "决策人",
      organization: "Northstar Copilot",
      description: "参与客户访谈复盘和产品取舍确认。",
      status: "active",
      relationshipStage: "internal_owner",
      ownerSuggestion: "",
      tags: ["demo", "team"],
      sourceIds: ["src-demo-1"],
      signalIds: ["sig-demo-1"],
      memoryIds: ["mem-demo-product", "mem-demo-risk"],
      projectIds: ["project-demo-northstar"],
      relatedSourceIds: ["src-demo-1"],
      relatedSignalIds: ["sig-demo-1"],
      relatedMemoryIds: ["mem-demo-product", "mem-demo-risk"],
      relatedProjectIds: ["project-demo-northstar"],
      lastInteractionAt: twoDaysAgo,
      nextSuggestedActionId: "act-demo-product",
      createdAt: twoDaysAgo,
      updatedAt: oneDayAgo
    },
    {
      id: "ent-demo-customer-team",
      type: "customer",
      name: "客户访谈小组",
      role: "早期反馈来源",
      organization: "",
      description: "提供权限边界、敏感数据和 follow-up 草稿需求反馈。",
      status: "watching",
      relationshipStage: "suggested_from_inbox",
      ownerSuggestion: "",
      tags: ["demo", "customer"],
      sourceIds: ["src-demo-1"],
      signalIds: ["sig-demo-1"],
      memoryIds: ["mem-demo-customer"],
      projectIds: ["project-demo-northstar"],
      relatedSourceIds: ["src-demo-1"],
      relatedSignalIds: ["sig-demo-1"],
      relatedMemoryIds: ["mem-demo-customer"],
      relatedProjectIds: ["project-demo-northstar"],
      lastInteractionAt: twoDaysAgo,
      nextSuggestedActionId: "act-demo-customer",
      createdAt: twoDaysAgo,
      updatedAt: oneDayAgo
    }
  ],
  entityRelations: [],
  nodes: [
    {
      id: "node-demo-customer-discovery",
      projectId: "project-demo-northstar",
      title: "客户试点与权限边界确认",
      goal: "把早期客户的试点意愿转成可人工确认的试用范围和 follow-up 草稿。",
      status: "active",
      ownerSuggestion: "创始人",
      dueAt: "",
      successCriteria: ["客户确认试点范围", "权限和数据边界被写入 follow-up 草稿"],
      inputContextIds: ["ctx-demo-1", "ctx-demo-2"],
      sourceIds: ["src-demo-1"],
      signalIds: ["sig-demo-1"],
      memoryIds: ["mem-demo-customer", "mem-demo-risk"],
      actionIds: ["act-demo-customer"],
      waitingIds: ["commit-demo-security-brief", "commit-demo-customer-feedback"],
      riskIds: ["risk-demo-security-boundary"],
      resultIds: [],
      createdAt: twoDaysAgo,
      updatedAt: oneDayAgo
    },
    {
      id: "node-demo-engineering-loop",
      projectId: "project-demo-northstar",
      title: "手动闭环工程稳定",
      goal: "在不接 Slack API 的前提下，把手动录入、记忆、Brief 和结果回流做稳。",
      status: "planned",
      ownerSuggestion: "工程负责人",
      dueAt: "",
      successCriteria: ["手动信息闭环可演示", "不触发任何外部自动动作"],
      inputContextIds: ["ctx-demo-3"],
      sourceIds: [],
      signalIds: [],
      memoryIds: ["mem-demo-engineering", "mem-demo-product"],
      actionIds: ["act-demo-engineering", "act-demo-product"],
      waitingIds: ["commit-demo-engineering-dependency"],
      riskIds: ["risk-demo-scope-creep"],
      resultIds: [],
      createdAt: oneDayAgo,
      updatedAt: now
    }
  ],
  commitments: [
    {
      id: "commit-demo-security-brief",
      projectId: "project-demo-northstar",
      nodeId: "node-demo-customer-discovery",
      type: "commitment",
      title: "给客户发送权限边界 follow-up 草稿",
      who: "创始人",
      toWhom: "客户访谈小组",
      dueAt: oneDayAgo,
      status: "open",
      evidenceLinks: [
        {
          contextId: "ctx-demo-2",
          quote: "一个付费意向客户愿意下周试点，但要求先确认权限设置、删除机制和数据范围。",
          note: "付费意向客户安全顾虑",
          confidence: 0.88
        }
      ],
      createdAt: twoDaysAgo,
      updatedAt: oneDayAgo
    },
    {
      id: "commit-demo-customer-feedback",
      projectId: "project-demo-northstar",
      nodeId: "node-demo-customer-discovery",
      type: "waiting",
      title: "等待客户确认试点范围",
      who: "客户访谈小组",
      toWhom: "Northstar Copilot",
      dueAt: oneDayAhead,
      status: "waiting",
      evidenceLinks: [
        {
          contextId: "ctx-demo-2",
          quote: "他们希望 follow-up 草稿里不要承诺自动导入所有历史数据。",
          note: "付费意向客户安全顾虑",
          confidence: 0.76
        }
      ],
      createdAt: oneDayAgo,
      updatedAt: now
    },
    {
      id: "commit-demo-engineering-dependency",
      projectId: "project-demo-northstar",
      nodeId: "node-demo-engineering-loop",
      type: "dependency",
      title: "工程需要确认本周只保留手动录入范围",
      who: "工程负责人",
      toWhom: "产品负责人",
      dueAt: now,
      status: "blocked",
      evidenceLinks: [
        {
          contextId: "ctx-demo-3",
          quote: "工程同步确认本周不做 Slack 导入，先把手动粘贴上下文、生成记忆、生成行动 Brief 和结果回流路径做稳定。",
          note: "手动粘贴闭环工程同步",
          confidence: 0.82
        }
      ],
      createdAt: oneDayAgo,
      updatedAt: now
    },
    {
      id: "commit-demo-investor-follow-up",
      projectId: "project-demo-northstar",
      nodeId: "",
      type: "follow_up",
      title: "复盘投资人问答材料缺口",
      who: "创始人",
      toWhom: "",
      dueAt: oneDayAhead,
      status: "open",
      evidenceLinks: [
        {
          sourceId: "src-demo-1",
          signalId: "sig-demo-1",
          quote: "一个付费意向客户希望先看到投资人问答和客户 follow-up 的草稿。",
          note: "周一增长复盘",
          confidence: 0.66
        }
      ],
      createdAt: twoDaysAgo,
      updatedAt: now
    }
  ],
  risks: [
    {
      id: "risk-demo-security-boundary",
      projectId: "project-demo-northstar",
      nodeId: "node-demo-customer-discovery",
      entityIds: ["ent-demo-customer-team"],
      title: "试点前权限边界不清会阻塞客户推进",
      description: "客户已经表达试用兴趣，但权限设置、删除机制和数据范围仍未确认。",
      severity: "high",
      likelihood: "medium",
      status: "open",
      evidenceLinks: [
        {
          contextId: "ctx-demo-2",
          memoryId: "mem-demo-customer",
          quote: "要求先确认权限设置、删除机制和数据范围。",
          note: "付费意向客户安全顾虑",
          confidence: 0.9
        }
      ],
      suggestedActionIds: ["act-demo-customer"],
      createdAt: oneDayAgo,
      updatedAt: now
    },
    {
      id: "risk-demo-scope-creep",
      projectId: "project-demo-northstar",
      nodeId: "node-demo-engineering-loop",
      entityIds: ["ent-demo-founder"],
      title: "过早接 Slack 导入会冲掉手动闭环交付",
      description: "团队容量有限，本周应避免外部集成，把手动闭环做稳。",
      severity: "medium",
      likelihood: "high",
      status: "monitoring",
      evidenceLinks: [
        {
          contextId: "ctx-demo-3",
          memoryId: "mem-demo-engineering",
          quote: "本周不做 Slack 导入，先把手动粘贴上下文、生成记忆、生成行动 Brief 和结果回流路径做稳定。",
          note: "手动粘贴闭环工程同步",
          confidence: 0.82
        }
      ],
      suggestedActionIds: ["act-demo-engineering"],
      createdAt: oneDayAgo,
      updatedAt: now
    }
  ],
  opportunities: [
    {
      id: "opp-demo-paid-pilot",
      projectId: "project-demo-northstar",
      nodeId: "node-demo-customer-discovery",
      entityIds: ["ent-demo-customer-team"],
      title: "付费意向客户试点可成为 Alpha 证明点",
      description: "客户愿意下周试点，只要权限和数据边界能先被清楚说明。",
      potentialImpact: "high",
      confidence: 0.78,
      status: "evaluating",
      evidenceLinks: [
        {
          contextId: "ctx-demo-2",
          memoryId: "mem-demo-customer",
          quote: "一个付费意向客户愿意下周试点。",
          note: "付费意向客户安全顾虑",
          confidence: 0.82
        }
      ],
      suggestedActionIds: ["act-demo-customer"],
      createdAt: oneDayAgo,
      updatedAt: now
    },
    {
      id: "opp-demo-investor-materials",
      projectId: "project-demo-northstar",
      nodeId: "",
      entityIds: ["ent-demo-founder"],
      title: "投资人问答草稿可以复用为 demo 资产",
      description: "客户希望先看到投资人问答和 follow-up 草稿，说明这些材料能作为产品价值展示。",
      potentialImpact: "medium",
      confidence: 0.64,
      status: "new",
      evidenceLinks: [
        {
          sourceId: "src-demo-1",
          quote: "一个付费意向客户希望先看到投资人问答和客户 follow-up 的草稿。",
          note: "周一增长复盘",
          confidence: 0.66
        }
      ],
      suggestedActionIds: ["act-demo-product"],
      createdAt: twoDaysAgo,
      updatedAt: now
    }
  ],
  contexts: [
    {
      id: demoContextId,
      kind: "meeting",
      title: "周一增长和客户访谈复盘",
      body:
        "我们采访了 5 个早期 SaaS 团队。客户愿意尝试把会议纪要和客户反馈放进一个公司记忆系统，但他们担心敏感数据和权限边界。一个付费意向客户希望先看到投资人问答和客户 follow-up 的草稿。工程上，Slack 导入还没做，当前只能粘贴文本。团队只有两名全职开发，本周必须先完成可演示闭环。",
      occurredAt: twoDaysAgo,
      participants: ["增长负责人", "创始人", "客户访谈小组"],
      tags: ["客户发现", "权限", "MVP"],
      importance: "high",
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
      memoryIds: [
        "mem-demo-customer",
        "mem-demo-risk",
        "mem-demo-product",
        "mem-demo-engineering",
        "mem-demo-team"
      ],
      actionIds: [
        "act-demo-customer",
        "act-demo-engineering",
        "act-demo-product"
      ]
    },
    {
      id: "ctx-demo-2",
      kind: "customer",
      title: "付费意向客户安全顾虑",
      body:
        "一个付费意向客户愿意下周试点，但要求先确认权限设置、删除机制和数据范围。他们希望 follow-up 草稿里不要承诺自动导入所有历史数据。",
      occurredAt: oneDayAgo,
      participants: ["客户 A", "创始人"],
      tags: ["试点", "安全", "follow-up"],
      importance: "high",
      createdAt: oneDayAgo,
      updatedAt: oneDayAgo,
      memoryIds: ["mem-demo-customer", "mem-demo-risk"],
      actionIds: ["act-demo-customer"]
    },
    {
      id: "ctx-demo-3",
      kind: "engineering",
      title: "手动粘贴闭环工程同步",
      body:
        "工程同步确认本周不做 Slack 导入，先把手动粘贴上下文、生成记忆、生成行动 Brief 和结果回流路径做稳定。团队只有两名全职开发，需要控制范围。",
      occurredAt: now,
      participants: ["工程负责人", "产品负责人"],
      tags: ["工程", "范围控制", "闭环"],
      importance: "medium",
      createdAt: now,
      updatedAt: now,
      memoryIds: ["mem-demo-engineering", "mem-demo-product", "mem-demo-team"],
      actionIds: ["act-demo-engineering", "act-demo-product"]
    }
  ],
  memories: [
    {
      id: "mem-demo-customer",
      type: "customer_concern",
      title: "客户担心敏感数据和权限边界",
      detail:
        "早期 SaaS 团队愿意尝试公司记忆系统，但需要明确数据隔离、访问权限和可删除机制。",
      source: "周一增长和客户访谈复盘",
      confidence: "high",
      status: "confirmed",
      sourceReferences: [
        {
          contextId: "ctx-demo-1",
          quote: "客户愿意尝试把会议纪要和客户反馈放进一个公司记忆系统，但他们担心敏感数据和权限边界。",
          note: "周一增长和客户访谈复盘",
          confidence: 0.9
        },
        {
          contextId: "ctx-demo-2",
          quote: "一个付费意向客户愿意下周试点，但要求先确认权限设置、删除机制和数据范围。",
          note: "付费意向客户安全顾虑",
          confidence: 0.88
        }
      ],
      createdBy: "human",
      createdAt: twoDaysAgo,
      updatedAt: oneDayAgo,
      lastVerifiedAt: oneDayAgo
    },
    {
      id: "mem-demo-risk",
      type: "risk",
      title: "外部沟通不能自动承诺或自动发送",
      detail:
        "客户 follow-up、投资人回复和谈判内容必须先生成草稿，保留人工确认。",
      source: "周一增长和客户访谈复盘",
      confidence: "high",
      status: "confirmed",
      sourceReferences: [
        {
          contextId: "ctx-demo-2",
          quote: "他们希望 follow-up 草稿里不要承诺自动导入所有历史数据。",
          note: "付费意向客户安全顾虑",
          confidence: 0.86
        }
      ],
      createdBy: "human",
      createdAt: oneDayAgo,
      updatedAt: now,
      lastVerifiedAt: now
    },
    {
      id: "mem-demo-product",
      type: "product_decision",
      title: "MVP 优先跑通上下文到结果回流闭环",
      detail:
        "第一版不做复杂集成，先让用户看到上下文、记忆、行动、Brief、结果回流的完整链路。",
      source: "周一增长和客户访谈复盘",
      confidence: "high",
      status: "confirmed",
      sourceReferences: [
        {
          contextId: "ctx-demo-3",
          quote: "先把手动粘贴上下文、生成记忆、生成行动 Brief 和结果回流路径做稳定。",
          note: "手动粘贴闭环工程同步",
          confidence: 0.9
        }
      ],
      createdBy: "human",
      createdAt: oneDayAgo,
      updatedAt: now,
      lastVerifiedAt: now
    },
    {
      id: "mem-demo-engineering",
      type: "engineering_blocker",
      title: "Slack 导入暂未实现",
      detail:
        "当前工程能力只支持手动粘贴上下文，Slack、Notion、GitHub 等作为后续集成预留。",
      source: "周一增长和客户访谈复盘",
      confidence: "medium",
      status: "draft",
      sourceReferences: [
        {
          contextId: "ctx-demo-1",
          quote: "工程上，Slack 导入还没做，当前只能粘贴文本。",
          note: "周一增长和客户访谈复盘",
          confidence: 0.7
        },
        {
          contextId: "ctx-demo-3",
          quote: "工程同步确认本周不做 Slack 导入。",
          note: "手动粘贴闭环工程同步",
          confidence: 0.78
        }
      ],
      createdBy: "ai",
      createdAt: oneDayAgo,
      updatedAt: now
    },
    {
      id: "mem-demo-team",
      type: "team_constraint",
      title: "本周只有两名全职开发",
      detail:
        "团队容量有限，本周应避免后台、权限和外部集成的过度开发。",
      source: "周一增长和客户访谈复盘",
      confidence: "high",
      status: "outdated",
      sourceReferences: [
        {
          contextId: "ctx-demo-1",
          quote: "团队只有两名全职开发，本周必须先完成可演示闭环。",
          note: "周一增长和客户访谈复盘",
          confidence: 0.85
        },
        {
          contextId: "ctx-demo-3",
          quote: "团队只有两名全职开发，需要控制范围。",
          note: "手动粘贴闭环工程同步",
          confidence: 0.82
        }
      ],
      createdBy: "human",
      createdAt: twoDaysAgo,
      updatedAt: now,
      lastVerifiedAt: twoDaysAgo
    }
  ],
  actions: [
    {
      id: "act-demo-customer",
      type: "customer_followup",
      title: "准备付费意向客户 follow-up 草稿",
      rationale:
        "客户已经表达试用兴趣，但敏感数据和权限边界仍是关键顾虑。",
      whyNow: "客户已经表达试用兴趣，但敏感数据和权限边界仍是关键顾虑。",
      priority: "high",
      riskLevel: "medium",
      expectedOutput: "一封不自动发送的 follow-up 邮件草稿和确认清单",
      expectedArtifact: "一封不自动发送的 follow-up 邮件草稿和确认清单",
      sourceMemoryIds: ["mem-demo-customer", "mem-demo-risk"],
      evidenceMemoryIds: ["mem-demo-customer", "mem-demo-risk"],
      status: "pending",
      requiresHumanConfirmation: true,
      createdAt: now
    },
    {
      id: "act-demo-engineering",
      type: "coding_brief",
      title: "生成手动上下文输入的工程 Brief",
      rationale:
        "Slack 导入暂不做，必须把粘贴文本的闭环体验做稳。",
      whyNow: "Slack 导入暂不做，必须把粘贴文本的闭环体验做稳。",
      priority: "high",
      riskLevel: "low",
      expectedOutput: "一个可执行的 MVP 工程任务说明",
      expectedArtifact: "一个可执行的 MVP 工程任务说明",
      sourceMemoryIds: ["mem-demo-engineering", "mem-demo-product"],
      evidenceMemoryIds: ["mem-demo-engineering", "mem-demo-product"],
      status: "pending",
      requiresHumanConfirmation: true,
      createdAt: now
    },
    {
      id: "act-demo-product",
      type: "product_plan",
      title: "整理 60 秒 Demo 路线",
      rationale:
        "MVP 需要让早期团队快速理解闭环价值，而不是把产品看成聊天机器人。",
      whyNow: "MVP 需要让早期团队快速理解闭环价值，而不是把产品看成聊天机器人。",
      priority: "medium",
      riskLevel: "low",
      expectedOutput: "演示路径和产品取舍说明",
      expectedArtifact: "演示路径和产品取舍说明",
      sourceMemoryIds: ["mem-demo-product", "mem-demo-team"],
      evidenceMemoryIds: ["mem-demo-product", "mem-demo-team"],
      status: "pending",
      requiresHumanConfirmation: true,
      createdAt: now
    }
  ],
  briefs: [],
  results: [],
  reconciliationResults: [],
  pendingMemoryUpdates: []
};
