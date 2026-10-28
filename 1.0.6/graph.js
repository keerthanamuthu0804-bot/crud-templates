//#region src/graph.js
var e = [
	"var(--primary, #2563eb)",
	"var(--success, #16a34a)",
	"var(--warning, #d97706)",
	"var(--danger, #dc2626)",
	"#7c3aed",
	"#0891b2",
	"#db2777",
	"#65a30d"
], t = "var(--text-muted, #6b7280)", n = "var(--border, #e5e7eb)", r = "var(--surface, #ffffff)", i = (e, t, n = {}, ...r) => {
	let i = document.createElement(e);
	return t && (i.className = "vc-" + t), Object.assign(i, n), i.append(...r), i;
}, a = (e, t = {}, ...n) => {
	let r = document.createElementNS("http://www.w3.org/2000/svg", e);
	for (let [e, n] of Object.entries(t)) r.setAttribute(e, n);
	return r.append(...n), r;
}, o = (e, n, r, i = {}) => {
	let o = a("text", {
		x: e,
		y: n,
		style: `fill:${t};font-size:11px`,
		...i
	});
	return o.textContent = r, o;
}, s = (e, t) => {
	let n = a("title");
	return n.textContent = t, e.append(n), e;
}, c = (e) => Number(e).toLocaleString(void 0, { maximumFractionDigits: 2 }), l = (e, t = 12) => e.length > t ? e.slice(0, t - 1) + "…" : e;
function u(e) {
	let t = e?.metadata ?? e ?? {}, n = t.chart ?? t.graph ?? {}, r = t.screenId ?? t.screenKey ?? t.screenName ?? t.id ?? "screen", i = t.data ?? e?.data ?? e?.rows;
	if (!Array.isArray(i)) {
		let t = n.dataKey ?? `crud:${r}`, a = e?.runtime ?? {};
		try {
			i = typeof a.storage?.list == "function" ? a.storage.list(t) : [];
		} catch {
			i = [];
		}
	}
	Array.isArray(i) || (i = []);
	let a = n.xField ?? n.x ?? Object.keys(i[0] ?? {})[0], o = n.series ?? n.yFields ?? (n.yField ? [n.yField] : null);
	return o ||= Object.keys(i[0] ?? {}).filter((e) => e !== a && e !== "id" && Number.isFinite(Number(i[0][e]))), o = o.map((e) => typeof e == "string" ? {
		field: e,
		label: e
	} : {
		field: e.field ?? e.name,
		label: e.label ?? e.field ?? e.name
	}), {
		title: t.title ?? t.screenTitle ?? t.screenName ?? "",
		type: String(n.type ?? "bar").toLowerCase(),
		aggregate: String(n.aggregate ?? "sum").toLowerCase(),
		xField: a,
		series: o,
		rows: i
	};
}
function d(e, t, n, r) {
	let i = /* @__PURE__ */ new Map();
	e.forEach((e) => {
		let n = String(e[t] ?? "—");
		i.has(n) || i.set(n, []), i.get(n).push(e);
	});
	let a = [...i.keys()];
	return {
		labels: a,
		values: n.map((e) => a.map((t) => {
			let n = i.get(t);
			if (r === "count") return n.length;
			let a = n.map((t) => Number(t[e.field])).filter(Number.isFinite);
			if (!a.length) return 0;
			let o = a.reduce((e, t) => e + t, 0);
			return r === "avg" ? o / a.length : r === "min" ? Math.min(...a) : r === "max" ? Math.max(...a) : o;
		}))
	};
}
function f(e) {
	let t = e / 5, n = 10 ** Math.floor(Math.log10(t)), r = t / n, i = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * n;
	return {
		step: i,
		top: Math.ceil(e / i) * i
	};
}
var p = 640, m = 320, h = {
	t: 16,
	r: 16,
	b: 40,
	l: 56
};
function g(t, i, u, d) {
	let g = a("svg", {
		viewBox: `0 0 ${p} ${m}`,
		width: "100%",
		role: "img"
	}), _ = p - h.l - h.r, v = m - h.t - h.b, { step: y, top: b } = f(Math.max(0, ...u.flat()) || 1), x = (e) => h.t + v - e / b * v, S = Math.round(b / y);
	for (let e = 0; e <= S; e++) {
		let t = e * y;
		g.append(a("line", {
			x1: h.l,
			x2: p - h.r,
			y1: x(t),
			y2: x(t),
			style: `stroke:${n};stroke-width:1`
		}), o(h.l - 8, x(t) + 4, c(t), { "text-anchor": "end" }));
	}
	let C = _ / i.length;
	if (i.forEach((e, t) => g.append(o(h.l + C * t + C / 2, m - h.b + 18, l(e), { "text-anchor": "middle" }))), t === "bar") {
		let t = C * .7, n = t / d.length;
		u.forEach((r, o) => r.forEach((r, l) => {
			let u = h.l + C * l + (C - t) / 2 + n * o;
			g.append(s(a("rect", {
				x: u,
				y: x(r),
				width: Math.max(1, n - 2),
				height: Math.max(0, h.t + v - x(r)),
				rx: 2,
				style: `fill:${e[o % e.length]}`
			}), `${d[o].label} · ${i[l]}: ${c(r)}`));
		}));
	} else u.forEach((t, n) => {
		let o = e[n % e.length], l = t.map((e, t) => [h.l + C * t + C / 2, x(e)]);
		g.append(a("polyline", {
			points: l.map((e) => e.join(",")).join(" "),
			style: `fill:none;stroke:${o};stroke-width:2`
		})), l.forEach((e, l) => g.append(s(a("circle", {
			cx: e[0],
			cy: e[1],
			r: 4,
			style: `fill:${o};stroke:${r};stroke-width:1.5`
		}), `${d[n].label} · ${i[l]}: ${c(t[l])}`)));
	});
	return g;
}
function _(t, n, i) {
	let o = n.reduce((e, t) => e + t, 0), l = a("svg", {
		viewBox: "0 0 280 280",
		width: "100%",
		role: "img",
		style: "max-width:300px"
	});
	if (o <= 0) return l;
	let u = n.filter((e) => e > 0).length, d = -Math.PI / 2;
	return n.forEach((n, i) => {
		if (n <= 0) return;
		let f = e[i % e.length], p = `${t[i]}: ${c(n)} (${(n / o * 100).toFixed(1)}%)`;
		if (u === 1) {
			l.append(s(a("circle", {
				cx: 140,
				cy: 140,
				r: 134,
				style: `fill:${f}`
			}), p));
			return;
		}
		let m = d + n / o * Math.PI * 2, h = (e) => [140 + 134 * Math.cos(e), 140 + 134 * Math.sin(e)], [g, _] = h(d), [v, y] = h(m);
		l.append(s(a("path", {
			d: `M 140 140 L ${g} ${_} A 134 134 0 ${+(m - d > Math.PI)} 1 ${v} ${y} Z`,
			style: `fill:${f};stroke:${r};stroke-width:2`
		}), p)), d = m;
	}), i && l.append(a("circle", {
		cx: 140,
		cy: 140,
		r: 73.7,
		style: `fill:${r}`
	})), l;
}
function v(t) {
	let n = i("div", "legend");
	return n.style.display = "flex", n.style.flexWrap = "wrap", n.style.gap = "6px 16px", n.style.marginTop = "12px", t.forEach((t, r) => {
		let a = i("span", "swatch");
		a.style.cssText = `display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;background:${e[r % e.length]}`;
		let o = i("div", "legend-item", {}, a, t);
		o.style.fontSize = "13px", n.append(o);
	}), n;
}
var y = null, b = {
	contractVersion: 1,
	supportedScreenTypes: ["GRAPH"],
	render(e) {
		let t = u(e);
		if (y = i("div", "host"), y.append(i("h2", "title", { textContent: t.title })), !t.rows.length || !t.xField || !t.series.length) return y.append(i("p", "empty", { textContent: "No data to display." })), y;
		let { labels: n, values: r } = d(t.rows, t.xField, t.series, t.aggregate), a = i("div", "chart");
		if (a.style.marginTop = "16px", t.type === "pie" || t.type === "donut") {
			let e = r[0], i = e.reduce((e, t) => e + t, 0) || 1;
			a.append(_(n, e, t.type === "donut")), y.append(a, v(n.map((t, n) => `${t}: ${c(e[n])} (${(e[n] / i * 100).toFixed(1)}%)`)));
		} else a.append(g(t.type === "line" ? "line" : "bar", n, r, t.series)), y.append(a), t.series.length > 1 && y.append(v(t.series.map((e) => e.label)));
		return y;
	},
	destroy() {
		y?.replaceChildren(), y = null;
	}
};
//#endregion
export { b as default };
