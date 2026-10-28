import { normalizeField, readRecords, findAction } from "./common.js";

const h = (tag, cls, props = {}, ...kids) => {
  const n = document.createElement(tag);
  if (cls)
    n.className = cls
      .split(" ")
      .map((c) => (c.startsWith("vc-") ? c : "vc-" + c))
      .join(" ");
  Object.assign(n, props);
  n.append(...kids);
  return n;
};

// ---------- read core app context ----------
// Tab configuration comes from metadata, never hardcoded:
//   1. metadata.tabs = [{ id, title, fields?: [...] }]
//   2. otherwise metadata.fields grouped by the field property
//      "tab" / "section" / "group" (one tab per distinct value)
// Default panel content = the tab's fields shown for context.records.
// A platform can take over a panel by providing renderTab(detail),
// which returns a DOM node (called the first time the tab opens).
function groupFieldsIntoTabs(rawFields) {
  const groups = new Map();
  rawFields.forEach((f) => {
    const key = f.tab ?? f.section ?? f.group;
    if (key == null || key === "") return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  });
  return [...groups.entries()].map(([title, fields]) => ({
    id: String(title),
    title: String(title),
    fields,
  }));
}

function normalize(context) {
  const meta = context?.metadata ?? context ?? {};
  let rawTabs = Array.isArray(meta.tabs) ? meta.tabs : null;
  if (!rawTabs) {
    rawTabs = groupFieldsIntoTabs(meta.fields ?? meta.columns ?? []);
  }
  const tabs = rawTabs.map((t, i) => ({
    ...t,
    id: String(t.id ?? `tab-${i + 1}`),
    title: t.title ?? t.name ?? t.displayName ?? `Tab ${i + 1}`,
    fields: (t.fields ?? t.columns ?? [])
      .map(normalizeField)
      .filter((f) => f.name),
  }));
  return {
    title: meta.title ?? meta.screenTitle ?? meta.screenName ?? "",
    tabs,
    defaultTab: meta.defaultTab != null ? String(meta.defaultTab) : null,
  };
}

// default panel content: the tab's fields over the platform records
function recordsTable(fields, records) {
  if (!records.length) {
    return h("p", "empty", { textContent: "No records yet." });
  }
  return h(
    "table",
    "table",
    {},
    h(
      "thead",
      "",
      {},
      h(
        "tr",
        "",
        {},
        ...fields.map((f) => h("th", "", { textContent: f.label })),
      ),
    ),
    h(
      "tbody",
      "",
      {},
      ...records.map((r) =>
        h(
          "tr",
          "",
          {},
          ...fields.map((f) => h("td", "", { textContent: r[f.name] ?? "" })),
        ),
      ),
    ),
  );
}

// ---------- contract v1 renderer ----------
let current = null;

export default {
  contractVersion: 1,
  supportedScreenTypes: ["TABS"],

  render(context) {
    const cfg = normalize(context);
    const records = readRecords(context);
    const renderTab = findAction(context, ["renderTab", "onRenderTab"]);
    const onTabChange = findAction(context, ["onTabChange"]);

    const host = h("div", "host");
    host.append(h("h2", "title", { textContent: cfg.title }));
    current = host;

    if (!cfg.tabs.length) {
      host.append(h("p", "empty", { textContent: "No tabs configured." }));
      return host;
    }

    const list = h("div", "tabs", { role: "tablist" });
    const panels = h("div", "tab-panels");
    host.append(list, panels);

    const items = cfg.tabs.map((tab) => ({
      tab,
      button: null,
      panel: h("div", "tab-panel", { role: "tabpanel", hidden: true }),
      opened: false,
    }));
    items.forEach((it) => (it.panel.dataset.tabId = it.tab.id));

    function activate(i, focus = false) {
      items.forEach((it, k) => {
        const active = k === i;
        it.button.className = "vc-tab" + (active ? " vc-tab-active" : "");
        it.button.setAttribute("aria-selected", String(active));
        it.button.tabIndex = active ? 0 : -1;
        it.panel.hidden = !active;
      });
      if (focus) items[i].button.focus();
    }

    function notify(i) {
      const it = items[i];
      const detail = {
        id: it.tab.id,
        index: i,
        tab: it.tab,
        panel: it.panel,
        records,
        firstTime: !it.opened,
      };

      // fill the panel the first time the tab opens
      if (detail.firstTime) {
        let content;
        try {
          content = renderTab ? renderTab(detail) : undefined;
        } catch (e) {
          console.error("[tabs] renderTab failed", e);
        }
        if (content instanceof Node) {
          it.panel.replaceChildren(content);
        } else if (it.tab.fields.length) {
          it.panel.replaceChildren(recordsTable(it.tab.fields, records));
        }
      }
      it.opened = true;

      host.dispatchEvent(
        new CustomEvent("vc-tab-change", { bubbles: true, detail }),
      );
      if (onTabChange) onTabChange(detail);
    }

    function select(i, focus = false) {
      activate(i, focus);
      notify(i);
    }

    items.forEach((it, i) => {
      it.button = h("button", "tab", {
        type: "button",
        role: "tab",
        textContent: it.tab.title,
        onclick: () => {
          if (!it.panel.hidden) return;
          select(i);
        },
        onkeydown: (e) => {
          const move = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
          if (!move) return;
          e.preventDefault();
          select((i + move + items.length) % items.length, true);
        },
      });
      list.append(it.button);
      panels.append(it.panel);
    });

    const start = Math.max(
      0,
      items.findIndex((it) => it.tab.id === cfg.defaultTab),
    );
    activate(start);
    queueMicrotask(() => notify(start));

    return host;
  },

  destroy() {
    current?.replaceChildren();
    current = null;
  },
};
