import {
  getActiveProject,
  renderApp as renderBaseApp
} from "./render.js";

export { getActiveProject };

export function renderApp(state) {
  const project = getActiveProject(state);
  const html = renderBaseApp(state);
  if (!project?.contexts?.length) {
    return html;
  }

  return injectContextBodies(html, project.contexts);
}

function injectContextBodies(html, contexts) {
  return contexts.reduce((nextHtml, context) => {
    if (!context?.title || !context?.body) {
      return nextHtml;
    }

    const title = escapeHtml(context.title);
    const body = escapeHtml(context.body);
    const pattern = new RegExp(
      `(<blockquote>\\s*<strong>${escapeRegExp(title)}</strong>\\s*<p>[^<]*</p>\\s*</blockquote>)`,
      "g"
    );

    return nextHtml.replace(
      pattern,
      `$1\n              <details class="source-context"><summary>查看 Context 原文</summary><p>${body}</p></details>`
    );
  }, html);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
