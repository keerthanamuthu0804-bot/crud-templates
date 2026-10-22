const NS = "http://www.w3.org/2000/svg";

const PALETTE = [
  "var(--primary, #2563eb)",
  "var(--success, #16a34a)",
  "var(--warning, #d97706)",
  "var(--danger, #dc2626)",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
];
const MUTED = "var(--text-muted, #6b7280)";
const GRID = "var(--border, #e5e7eb)";
const SURFACE = "var(--surface, #ffffff)";

// ---------- tiny DOM helpers (class = "vc-" + name) ----------
const h = (tag, cls, props = {}, ...kids) => {
  const n = document.createElement(tag);
  if (cls) n.className = "vc-" + cls;
  Object.assign(n, props);
  n.append(...kids);
  return n;
};

const svgEl = (tag, attrs = {}, ...kids) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  n.append(...kids);
  return n;
};

const svgText = (x, y, str, attrs = {}) => {
  const t = svgEl("text", {
    x,
    y,
    style: `fill:${MUTED};font-size:11px`,
    ...attrs,
  });
  t.textContent = str;
  return t;
};

const tip = (node, str) => {
  const t = svgEl("title");
  t.textContent = str;
  node.append(t);
  return node;
};

const fmt = (n) =>
  Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

const shorten = (str, n = 12) =>
  str.length > n ? str.slice(0, n - 1) + "…" : str;

// ---------- read core app context ----------
function normalize(context) {
  const meta = context?.metadata ?? context ?? {};
  const chart = meta.chart ?? meta.graph ?? {};
  const screenId =
    meta.screenId ?? meta.screenKey ?? meta.screenName ?? meta.id ?? "screen";

  // rows: metadata.data / context.data / context.rows, illana storage
  let rows = meta.data ?? context?.data ?? context?.rows;
  if (!Array.isArray(rows)) {
    const key = chart.dataKey ?? `crud:${screenId}`;
    const rt = context?.runtime ?? {};
    try {
      rows =
        typeof rt.storage?.list === "function"
          ? rt.storage.list(key)
          : JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      rows = [];
    }
  }
  if (!Array.isArray(rows)) rows = [];

  // x field: kudukkalaina first row-oda first key
  const xField = chart.xField ?? chart.x ?? Object.keys(rows[0] ?? {})[0];

  // series: kudukkalaina numeric fields ellam
  let series =
    chart.series ?? chart.yFields ?? (chart.yField ? [chart.yField] : null);
  if (!series) {
    series = Object.keys(rows[0] ?? {}).filter(
      (k) => k !== xField && k !== "id" && Number.isFinite(Number(rows[0][k])),
    );
  }
  series = series.map((x) =>
    typeof x === "string"
      ? { field: x, label: x }
      : { field: x.field ?? x.name, label: x.label ?? x.field ?? x.name },
  );

  return {
    title: meta.title ?? meta.screenTitle ?? meta.screenName ?? "",
    type: String(chart.type ?? "bar").toLowerCase(),
    aggregate: String(chart.aggregate ?? "sum").toLowerCase(),
    xField,
    series,
    rows,
  };
}

// ---------- group by x, then sum / avg / count / min / max ----------
function aggregate(rows, xField, series, mode) {
  const groups = new Map();
  rows.forEach((r) => {
    const k = String(r[xField] ?? "—");
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  });
  const labels = [...groups.keys()];
  const values = series.map((sr) =>
    labels.map((k) => {
      const list = groups.get(k);
      if (mode === "count") return list.length;
      const nums = list.map((r) => Number(r[sr.field])).filter(Number.isFinite);
      if (!nums.length) return 0;
      const total = nums.reduce((a, b) => a + b, 0);
      if (mode === "avg") return total / nums.length;
      if (mode === "min") return Math.min(...nums);
      if (mode === "max") return Math.max(...nums);
      return total;
    }),
  );
  return { labels, values };
}

// 1 / 2 / 5 x 10^k step
function niceScale(max) {
  const rough = max / 5;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const f = rough / pow;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
  return { step, top: Math.ceil(max / step) * step };
}

// ---------- bar / line ----------
const W = 640;
const H = 320;
const M = { t: 16, r: 16, b: 40, l: 56 };

function drawCartesian(kind, labels, values, series) {
  const svg = svgEl("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: "100%",
    role: "img",
  });
  const iw = W - M.l - M.r;
  const ih = H - M.t - M.b;
  const max = Math.max(0, ...values.flat()) || 1;
  const { step, top } = niceScale(max);
  const y = (v) => M.t + ih - (v / top) * ih;

  const ticks = Math.round(top / step);
  for (let i = 0; i <= ticks; i++) {
    const v = i * step;
    svg.append(
      svgEl("line", {
        x1: M.l,
        x2: W - M.r,
        y1: y(v),
        y2: y(v),
        style: `stroke:${GRID};stroke-width:1`,
      }),
      svgText(M.l - 8, y(v) + 4, fmt(v), { "text-anchor": "end" }),
    );
  }

  const band = iw / labels.length;
  labels.forEach((lb, i) =>
    svg.append(
      svgText(M.l + band * i + band / 2, H - M.b + 18, shorten(lb), {
        "text-anchor": "middle",
      }),
    ),
  );

  if (kind === "bar") {
    const groupW = band * 0.7;
    const barW = groupW / series.length;
    values.forEach((vals, si) =>
      vals.forEach((v, i) => {
        const x = M.l + band * i + (band - groupW) / 2 + barW * si;
        svg.append(
          tip(
            svgEl("rect", {
              x,
              y: y(v),
              width: Math.max(1, barW - 2),
              height: Math.max(0, M.t + ih - y(v)),
              rx: 2,
              style: `fill:${PALETTE[si % PALETTE.length]}`,
            }),
            `${series[si].label} · ${labels[i]}: ${fmt(v)}`,
          ),
        );
      }),
    );
  } else {
    values.forEach((vals, si) => {
      const color = PALETTE[si % PALETTE.length];
      const pts = vals.map((v, i) => [M.l + band * i + band / 2, y(v)]);
      svg.append(
        svgEl("polyline", {
          points: pts.map((p) => p.join(",")).join(" "),
          style: `fill:none;stroke:${color};stroke-width:2`,
        }),
      );
      pts.forEach((p, i) =>
        svg.append(
          tip(
            svgEl("circle", {
              cx: p[0],
              cy: p[1],
              r: 4,
              style: `fill:${color};stroke:${SURFACE};stroke-width:1.5`,
            }),
            `${series[si].label} · ${labels[i]}: ${fmt(vals[i])}`,
          ),
        ),
      );
    });
  }
  return svg;
}

// ---------- pie / donut ----------
function drawPie(labels, vals, donut) {
  const size = 280;
  const c = size / 2;
  const r = c - 6;
  const total = vals.reduce((a, b) => a + b, 0);
  const svg = svgEl("svg", {
    viewBox: `0 0 ${size} ${size}`,
    width: "100%",
    role: "img",
    style: "max-width:300px",
  });
  if (total <= 0) return svg;

  const nonZero = vals.filter((v) => v > 0).length;
  let angle = -Math.PI / 2;
  vals.forEach((v, i) => {
    if (v <= 0) return;
    const color = PALETTE[i % PALETTE.length];
    const label = `${labels[i]}: ${fmt(v)} (${((v / total) * 100).toFixed(1)}%)`;
    if (nonZero === 1) {
      svg.append(
        tip(
          svgEl("circle", { cx: c, cy: c, r, style: `fill:${color}` }),
          label,
        ),
      );
      return;
    }
    const a2 = angle + (v / total) * Math.PI * 2;
    const p = (a) => [c + r * Math.cos(a), c + r * Math.sin(a)];
    const [x1, y1] = p(angle);
    const [x2, y2] = p(a2);
    svg.append(
      tip(
        svgEl("path", {
          d: `M ${c} ${c} L ${x1} ${y1} A ${r} ${r} 0 ${a2 - angle > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`,
          style: `fill:${color};stroke:${SURFACE};stroke-width:2`,
        }),
        label,
      ),
    );
    angle = a2;
  });
  if (donut) {
    svg.append(
      svgEl("circle", { cx: c, cy: c, r: r * 0.55, style: `fill:${SURFACE}` }),
    );
  }
  return svg;
}

// ---------- legend ----------
function legend(items) {
  const box = h("div", "legend");
  box.style.display = "flex";
  box.style.flexWrap = "wrap";
  box.style.gap = "6px 16px";
  box.style.marginTop = "12px";
  items.forEach((it, i) => {
    const sw = h("span", "swatch");
    sw.style.cssText = `display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;background:${PALETTE[i % PALETTE.length]}`;
    const row = h("div", "legend-item", {}, sw, it);
    row.style.fontSize = "13px";
    box.append(row);
  });
  return box;
}

// ---------- contract v1 renderer ----------
let host = null;

export default {
  contractVersion: 1,
  supportedScreenTypes: ["GRAPH"],

  render(context) {
    const cfg = normalize(context);
    host = h("div", "host");
    host.append(h("h2", "title", { textContent: cfg.title }));

    if (!cfg.rows.length || !cfg.xField || !cfg.series.length) {
      host.append(h("p", "empty", { textContent: "No data to display." }));
      return host;
    }

    const { labels, values } = aggregate(
      cfg.rows,
      cfg.xField,
      cfg.series,
      cfg.aggregate,
    );

    const wrap = h("div", "chart");
    wrap.style.marginTop = "16px";

    if (cfg.type === "pie" || cfg.type === "donut") {
      const vals = values[0];
      const total = vals.reduce((a, b) => a + b, 0) || 1;
      wrap.append(drawPie(labels, vals, cfg.type === "donut"));
      host.append(
        wrap,
        legend(
          labels.map(
            (l, i) =>
              `${l}: ${fmt(vals[i])} (${((vals[i] / total) * 100).toFixed(1)}%)`,
          ),
        ),
      );
    } else {
      wrap.append(
        drawCartesian(
          cfg.type === "line" ? "line" : "bar",
          labels,
          values,
          cfg.series,
        ),
      );
      host.append(wrap);
      if (cfg.series.length > 1)
        host.append(legend(cfg.series.map((s) => s.label)));
    }
    return host;
  },

  destroy() {
    host?.replaceChildren();
    host = null;
  },
};
