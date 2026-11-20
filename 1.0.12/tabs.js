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
	isContainer: !1,
	allowedParentTypes: ["TABS"],
	properties: [
		{
			key: "label",
			kind: "text",
			label: "Tab Label",
			defaultValue: "Tab"
		},
		{
			key: "content",
			kind: "textarea",
			label: "Content",
			defaultValue: ""
		},
		{
			key: "description",
			kind: "textarea",
			label: "Description",
			defaultValue: ""
		}
	]
}], n = [
	{
		id: "tabs-root",
		componentCode: "TABS_ROOT",
		componentType: "TABS",
		displayName: "Tabs",
		displayOrder: 0,
		isVisible: !0,
		properties: { activeIndex: 0 }
	},
	{
		id: "tab-1",
		componentCode: "TAB_1",
		componentType: "TAB",
		displayName: "Tab 1",
		displayOrder: 1,
		parentId: "tabs-root",
		isVisible: !0,
		properties: {
			label: "Tab 1",
			content: "",
			description: ""
		}
	},
	{
		id: "tab-2",
		componentCode: "TAB_2",
		componentType: "TAB",
		displayName: "Tab 2",
		displayOrder: 2,
		parentId: "tabs-root",
		isVisible: !0,
		properties: {
			label: "Tab 2",
			content: "",
			description: ""
		}
	}
], r = 0, i = /* @__PURE__ */ new Set();
function a(e, t) {
	let n = document.createElement(e);
	return t != null && (n.textContent = String(t)), n;
}
function o(e, t, n = "") {
	return e?.properties?.[t] ?? n;
}
function s(e) {
	return e?.key ?? e?.id ?? null;
}
function c(e) {
	return [...e].sort((e, t) => (e.displayOrder ?? 0) - (t.displayOrder ?? 0));
}
function l(e, t) {
	let n = s(t);
	if (typeof e?.getChildren == "function" && n != null) {
		let t = e.getChildren(n);
		if (Array.isArray(t)) return t.filter((e) => e?.isVisible !== !1);
	}
	let r = e?.components;
	return Array.isArray(r) ? c(r.filter((e) => e.parentId != null && String(e.parentId) === String(n) && e.isVisible !== !1)) : [];
}
function u(e, t, n) {
	let r = a("div");
	r.setAttribute("data-component-type", "TABS");
	let i = l(t, e).filter((e) => e.componentType === "TAB");
	if (i.length === 0) return r.appendChild(a("p", "No tabs configured.")), r;
	let s = a("div");
	s.setAttribute("role", "tablist"), s.setAttribute("aria-label", o(e, "label", "Tabs") || "Tabs");
	let c = a("div"), u = [], d = [];
	function f(e) {
		e < 0 || e >= i.length || u.forEach((t, n) => {
			let r = n === e;
			t.setAttribute("aria-selected", String(r)), t.tabIndex = r ? 0 : -1, d[n].hidden = !r;
		});
	}
	i.forEach((e, t) => {
		let r = `${n}-tab-${t}`, i = `${n}-panel-${t}`, l = a("button", o(e, "label", `Tab ${t + 1}`));
		l.type = "button", l.id = r, l.setAttribute("role", "tab"), l.setAttribute("aria-controls", i), l.setAttribute("aria-selected", "false"), l.tabIndex = -1;
		let p = a("section");
		p.id = i, p.setAttribute("role", "tabpanel"), p.setAttribute("aria-labelledby", r), p.tabIndex = 0, p.hidden = !0;
		let m = o(e, "content", ""), h = o(e, "description", "");
		m && p.appendChild(a("div", m)), h && p.appendChild(a("p", h)), l.addEventListener("click", () => f(t)), l.addEventListener("keydown", (e) => {
			let n;
			if (e.key === "ArrowRight") n = (t + 1) % u.length;
			else if (e.key === "ArrowLeft") n = (t - 1 + u.length) % u.length;
			else if (e.key === "Home") n = 0;
			else if (e.key === "End") n = u.length - 1;
			else return;
			e.preventDefault(), f(n), u[n].focus();
		}), u.push(l), d.push(p), s.appendChild(l), c.appendChild(p);
	}), r.appendChild(s), r.appendChild(c);
	let p = Number(o(e, "activeIndex", 0));
	return f(Number.isInteger(p) ? Math.max(0, Math.min(p, i.length - 1)) : 0), r;
}
function d(e) {
	let t = a("section"), n = `tabs-instance-${++r}`;
	t.setAttribute("data-template-instance", n);
	let o = c((Array.isArray(e?.roots) ? e.roots : Array.isArray(e?.components) ? e.components.filter((e) => !e.parentId) : []).filter((e) => e?.isVisible !== !1).filter((e) => e.componentType === "TABS"));
	o.forEach((r, i) => {
		t.appendChild(u(r, e, `${n}-${i}`));
	}), o.length === 0 && t.appendChild(a("p", "No tabs container configured."));
	let s = !1, l = () => {
		s || (s = !0, i.delete(l), t.replaceChildren());
	};
	return i.add(l), {
		element: t,
		dispose: l
	};
}
function f() {
	[...i].forEach((e) => e()), i.clear();
}
var p = {
	contractVersion: 1,
	componentTypes: t,
	components: n,
	render: d,
	destroy: f
};
//#endregion
export { t as componentTypes, n as components, e as contractVersion, p as default, f as destroy, d as render };
