//#region src/tabs.js
var e = 1, t = [{
	componentType: "TABS",
	displayName: "Tabs",
	category: "Layout",
	isContainer: !0,
	allowedChildTypes: ["TAB"],
	properties: [{
		key: "activeIndex",
		kind: "number",
		label: "Default Active Tab",
		description: "Zero-based index of the tab shown first",
		defaultValue: 0,
		validation: {
			min: 0,
			integer: !0
		}
	}]
}, {
	componentType: "TAB",
	displayName: "Tab",
	category: "Layout",
	isContainer: !0,
	allowedParentTypes: ["TABS"],
	properties: [
		{
			key: "label",
			kind: "text",
			label: "Tab Label",
			description: "Label displayed on the tab",
			defaultValue: "Tab",
			required: !0
		},
		{
			key: "panelTitle",
			kind: "text",
			label: "Panel Title",
			description: "Heading shown at the top of the tab panel",
			defaultValue: ""
		},
		{
			key: "description",
			kind: "textarea",
			label: "Description",
			description: "Optional text shown above the tab content",
			defaultValue: ""
		}
	]
}], n = [
	{
		id: "tabs-root",
		componentCode: "TABS_ROOT",
		componentType: "TABS",
		displayName: "Tabs",
		displayOrder: 1,
		isVisible: !0,
		properties: { activeIndex: 0 }
	},
	{
		id: "tab-1",
		componentCode: "TAB_1",
		componentType: "TAB",
		parentId: "tabs-root",
		displayName: "Tab 1",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			label: "Tab 1",
			panelTitle: "",
			description: ""
		},
		content: {
			type: "FORM",
			fields: "ALL_ACTIVE"
		}
	},
	{
		id: "tab-2",
		componentCode: "TAB_2",
		componentType: "TAB",
		parentId: "tabs-root",
		displayName: "Tab 2",
		displayOrder: 2,
		isVisible: !0,
		properties: {
			label: "Tab 2",
			panelTitle: "",
			description: ""
		},
		content: {
			type: "TABLE",
			fields: "ALL_ACTIVE"
		}
	}
], r = 0, i = /* @__PURE__ */ new Set();
function a(e, t) {
	let n = document.createElement(e);
	return t != null && (n.textContent = String(t)), n;
}
function o(e) {
	return !e || typeof e != "object" ? !1 : typeof Node < "u" ? e instanceof Node : typeof e.appendChild == "function";
}
function s(e, t, n = "") {
	return e?.properties?.[t] ?? n;
}
function c(e) {
	return e?.key ?? e?.id ?? null;
}
function l(e) {
	return [...e].sort((e, t) => (e.displayOrder ?? 0) - (t.displayOrder ?? 0));
}
function u(e, t) {
	let n = c(t);
	if (typeof e?.getChildren == "function" && n != null) {
		let t = e.getChildren(n);
		if (Array.isArray(t)) return t.filter((e) => e?.isVisible !== !1);
	}
	let r = e?.components;
	return Array.isArray(r) ? l(r.filter((e) => e.parentId != null && String(e.parentId) === String(n) && e.isVisible !== !1)) : [];
}
function d(e, t, n) {
	e != null && (Array.isArray(e) ? e.forEach((e) => d(e, t, n)) : o(e) ? t.appendChild(e) : o(e.element) && (t.appendChild(e.element), typeof e.dispose == "function" && n.push(e.dispose)));
}
function f(e, t, n, r) {
	try {
		if (typeof e?.renderChildren == "function") {
			d(e.renderChildren(t), n, r);
			return;
		}
		typeof e?.renderNode == "function" && u(e, t).forEach((t) => {
			d(e.renderNode(t), n, r);
		});
	} catch (e) {
		console.error("Tabs template: platform content failed to render.", e), n.appendChild(a("p", "This tab's content could not be rendered."));
	}
}
function p(e) {
	e.splice(0).forEach((e) => {
		try {
			e();
		} catch (e) {
			console.error("Tabs template: dispose failed.", e);
		}
	});
}
function m(e, t) {
	let n = u(e, t).map((e) => e.componentType);
	return n.includes("TABLE") && !n.includes("FORM");
}
function h(e, t, n, r) {
	let i = a("div");
	i.setAttribute("data-component-type", "TABS");
	let o = u(t, e).filter((e) => e.componentType === "TAB");
	if (o.length === 0) return i.appendChild(a("p", "No tabs configured.")), i;
	let c = a("div");
	c.setAttribute("role", "tablist"), c.setAttribute("aria-label", "Tabs");
	let l = a("div"), d = [], h = [], g = [], _ = o.map(() => []), v = o.map(() => !1);
	r.push(() => _.forEach(p));
	function y(e) {
		p(_[e]), g[e].replaceChildren(), f(t, o[e], g[e], _[e]), v[e] = !0;
	}
	function b(e) {
		e < 0 || e >= o.length || (d.forEach((t, n) => {
			let r = n === e;
			t.setAttribute("aria-selected", String(r)), t.tabIndex = r ? 0 : -1, h[n].hidden = !r;
		}), (!v[e] || m(t, o[e])) && y(e));
	}
	o.forEach((e, t) => {
		let r = `${n}-tab-${t}`, i = `${n}-panel-${t}`, o = a("button", s(e, "label", `Tab ${t + 1}`));
		o.type = "button", o.id = r, o.setAttribute("role", "tab"), o.setAttribute("aria-controls", i), o.setAttribute("aria-selected", "false"), o.tabIndex = -1;
		let u = a("section");
		u.id = i, u.setAttribute("role", "tabpanel"), u.setAttribute("aria-labelledby", r), u.tabIndex = 0, u.hidden = !0;
		let f = String(s(e, "panelTitle", "")).trim(), p = String(s(e, "description", "")).trim();
		f && u.appendChild(a("h3", f)), p && u.appendChild(a("p", p));
		let m = a("div");
		m.setAttribute("data-tab-content", String(e.componentCode || t)), u.appendChild(m), o.addEventListener("click", () => b(t)), o.addEventListener("keydown", (e) => {
			let n;
			if (e.key === "ArrowRight") n = (t + 1) % d.length;
			else if (e.key === "ArrowLeft") n = (t - 1 + d.length) % d.length;
			else if (e.key === "Home") n = 0;
			else if (e.key === "End") n = d.length - 1;
			else return;
			e.preventDefault(), b(n), d[n].focus();
		}), d.push(o), h.push(u), g.push(m), c.appendChild(o), l.appendChild(u);
	}), i.appendChild(c), i.appendChild(l);
	let x = Number(s(e, "activeIndex", 0));
	return b(Number.isInteger(x) ? Math.max(0, Math.min(x, o.length - 1)) : 0), i;
}
function g(e) {
	let t = a("section"), n = `tabs-instance-${++r}`, o = [];
	t.setAttribute("data-template-instance", n);
	let s = l((Array.isArray(e?.roots) ? e.roots : Array.isArray(e?.components) ? e.components.filter((e) => !e.parentId) : []).filter((e) => e?.isVisible !== !1).filter((e) => e.componentType === "TABS"));
	s.forEach((r, i) => {
		t.appendChild(h(r, e, `${n}-${i}`, o));
	}), s.length === 0 && t.appendChild(a("p", "No tabs container configured."));
	let c = !1, u = () => {
		c || (c = !0, i.delete(u), p(o), t.replaceChildren());
	};
	return i.add(u), {
		element: t,
		dispose: u
	};
}
function _() {
	[...i].forEach((e) => e()), i.clear();
}
var v = {
	contractVersion: 1,
	componentTypes: t,
	components: n,
	render: g,
	destroy: _
};
//#endregion
export { t as componentTypes, n as components, e as contractVersion, v as default, _ as destroy, g as render };
