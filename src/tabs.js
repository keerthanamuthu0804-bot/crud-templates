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
function normalize(context) {
  const meta = context?.metadata ?? context ?? {};
  const tabs = (Array.isArray(meta.tabs) ? meta.tabs : []).map((t, i) => ({
    ...t,
    id: String(t.id ?? `tab-${i + 1}`),
    title: t.title ?? t.name ?? t.displayName ?? `Tab ${i + 1}`,
  }));
  return {
    title: meta.title ?? meta.screenTitle ?? meta.screenName ?? "",
    tabs,
    defaultTab: meta.defaultTab != null ? String(meta.defaultTab) : null,
  };
}

// ---------- contract v1 renderer ----------
let current = null;

export default {
  contractVersion: 1,
  supportedScreenTypes: ["TABS"],

  render(context) {
    const cfg = normalize(context);
    const rt = context?.runtime ?? {};

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
        firstTime: !it.opened,
      };
      it.opened = true;
      host.dispatchEvent(
        new CustomEvent("vc-tab-change", { bubbles: true, detail }),
      );
      if (typeof rt.onTabChange === "function") rt.onTabChange(detail);
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
