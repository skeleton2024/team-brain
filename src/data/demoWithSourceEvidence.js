import { DEMO_PROJECT } from "./demo.js";

const DEMO_CONTEXT_ID = "ctx-demo-1";
const RISK_QUOTE = "团队明确决定，所有对外内容只生成草稿，发送前必须人工确认，避免自动承诺。";
const PRODUCT_QUOTE = "第一版不做复杂集成，先完成上下文、记忆、行动、Brief、结果回流的演示闭环。";

export const DEMO_PROJECT_WITH_SOURCE_EVIDENCE = {
  ...DEMO_PROJECT,
  contexts: DEMO_PROJECT.contexts.map((context) => {
    if (context.id !== DEMO_CONTEXT_ID) {
      return context;
    }

    return {
      ...context,
      body: `${context.body} ${RISK_QUOTE} ${PRODUCT_QUOTE}`
    };
  }),
  memories: DEMO_PROJECT.memories.map((memory) => {
    if (memory.id === "mem-demo-risk") {
      return {
        ...memory,
        sourceReferences: [
          sourceReference(
            RISK_QUOTE,
            "直接支持外部沟通必须保留草稿和人工确认",
            0.95
          )
        ]
      };
    }

    if (memory.id === "mem-demo-product") {
      return {
        ...memory,
        sourceReferences: [
          sourceReference(
            PRODUCT_QUOTE,
            "直接支持 MVP 优先完成可演示闭环且暂不做复杂集成",
            0.95
          )
        ]
      };
    }

    return memory;
  })
};

function sourceReference(quote, note, confidence) {
  return {
    contextId: DEMO_CONTEXT_ID,
    quote,
    note,
    confidence
  };
}
