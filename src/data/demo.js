const now = new Date().toISOString();

export const DEMO_PROJECT = {
  id: "project-demo-northstar",
  name: "Northstar Copilot",
  stage: "客户发现 / Pre-seed",
  createdAt: now,
  updatedAt: now,
  contexts: [
    {
      id: "ctx-demo-1",
      kind: "meeting",
      title: "周一增长和客户访谈复盘",
      body:
        "我们采访了 5 个早期 SaaS 团队。客户愿意尝试把会议纪要和客户反馈放进一个公司记忆系统，但他们担心敏感数据和权限边界。一个付费意向客户希望先看到投资人问答和客户 follow-up 的草稿。工程上，Slack 导入还没做，当前只能粘贴文本。团队只有两名全职开发，本周必须先完成可演示闭环。",
      createdAt: now,
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
      createdAt: now
    },
    {
      id: "mem-demo-risk",
      type: "risk",
      title: "外部沟通不能自动承诺或自动发送",
      detail:
        "客户 follow-up、投资人回复和谈判内容必须先生成草稿，保留人工确认。",
      source: "产品原则",
      confidence: "high",
      createdAt: now
    },
    {
      id: "mem-demo-product",
      type: "product_decision",
      title: "MVP 优先跑通上下文到结果回流闭环",
      detail:
        "第一版不做复杂集成，先让用户看到上下文、记忆、行动、Brief、结果回流的完整链路。",
      source: "创始人笔记",
      confidence: "high",
      createdAt: now
    },
    {
      id: "mem-demo-engineering",
      type: "engineering_blocker",
      title: "Slack 导入暂未实现",
      detail:
        "当前工程能力只支持手动粘贴上下文，Slack、Notion、GitHub 等作为后续集成预留。",
      source: "周一增长和客户访谈复盘",
      confidence: "medium",
      createdAt: now
    },
    {
      id: "mem-demo-team",
      type: "team_constraint",
      title: "本周只有两名全职开发",
      detail:
        "团队容量有限，本周应避免后台、权限和外部集成的过度开发。",
      source: "周一增长和客户访谈复盘",
      confidence: "high",
      createdAt: now
    }
  ],
  actions: [
    {
      id: "act-demo-customer",
      type: "customer_followup",
      title: "准备付费意向客户 follow-up 草稿",
      rationale:
        "客户已经表达试用兴趣，但敏感数据和权限边界仍是关键顾虑。",
      priority: "high",
      riskLevel: "medium",
      expectedOutput: "一封不自动发送的 follow-up 邮件草稿和确认清单",
      sourceMemoryIds: ["mem-demo-customer", "mem-demo-risk"],
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
      priority: "high",
      riskLevel: "low",
      expectedOutput: "一个可执行的 MVP 工程任务说明",
      sourceMemoryIds: ["mem-demo-engineering", "mem-demo-product"],
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
      priority: "medium",
      riskLevel: "low",
      expectedOutput: "演示路径和产品取舍说明",
      sourceMemoryIds: ["mem-demo-product", "mem-demo-team"],
      status: "pending",
      requiresHumanConfirmation: true,
      createdAt: now
    }
  ],
  briefs: [],
  results: []
};
