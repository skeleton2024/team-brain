export const CONTEXT_TYPES = [
  { id: "meeting", label: "会议纪要" },
  { id: "customer", label: "客户反馈" },
  { id: "investor", label: "投资人问题" },
  { id: "engineering", label: "工程进展" },
  { id: "founder", label: "创始人笔记" },
  { id: "other", label: "其他上下文" }
];

export const CONTEXT_IMPORTANCE = [
  { id: "low", label: "低" },
  { id: "medium", label: "中" },
  { id: "high", label: "高" }
];

export const CONTEXT_IMPORTANCE_LABELS = Object.fromEntries(
  CONTEXT_IMPORTANCE.map((item) => [item.id, item.label])
);

export const MEMORY_TYPES = {
  customer_concern: {
    label: "客户顾虑",
    shortLabel: "客户",
    tone: "teal"
  },
  investor_question: {
    label: "投资人问题",
    shortLabel: "投资",
    tone: "violet"
  },
  product_decision: {
    label: "产品决策",
    shortLabel: "产品",
    tone: "green"
  },
  engineering_blocker: {
    label: "工程阻塞",
    shortLabel: "工程",
    tone: "orange"
  },
  team_constraint: {
    label: "团队限制",
    shortLabel: "团队",
    tone: "gray"
  },
  risk: {
    label: "风险点",
    shortLabel: "风险",
    tone: "red"
  },
  opportunity: {
    label: "机会",
    shortLabel: "机会",
    tone: "blue"
  },
  fact: {
    label: "公司事实",
    shortLabel: "事实",
    tone: "gray"
  },
  result_learning: {
    label: "结果学习",
    shortLabel: "回流",
    tone: "green"
  }
};

export const ACTION_TYPES = {
  customer_followup: "客户 follow-up",
  investor_reply: "投资人回复",
  coding_brief: "Coding Brief",
  product_plan: "产品路线整理",
  negotiation_prep: "谈判准备",
  risk_review: "风险确认",
  operating_plan: "执行计划",
  learning_loop: "结果复盘"
};

export const PRIORITY_LABELS = {
  high: "高",
  medium: "中",
  low: "低"
};

export const RISK_LABELS = {
  high: "高风险",
  medium: "中风险",
  low: "低风险"
};

export const ACTION_STATUS = {
  pending: "待处理",
  briefed: "已生成 Brief",
  done: "已回流"
};

export const RESULT_OUTCOMES = [
  { id: "positive", label: "正向进展" },
  { id: "neutral", label: "需要观察" },
  { id: "blocked", label: "出现阻塞" }
];
