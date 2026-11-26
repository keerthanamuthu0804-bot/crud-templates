//#region src/accordion-wizard.js
var e = 1, t = [
	{
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
	},
	{
		componentType: "TAB",
		displayName: "Tab",
		category: "Layout",
		isContainer: !0,
		allowedParentTypes: ["TABS"],
		allowedChildTypes: ["ACCORDION", "WIZARD"],
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
	},
	{
		componentType: "ACCORDION",
		displayName: "Accordion",
		category: "Layout",
		isContainer: !0,
		allowedParentTypes: ["TAB", "WIZARD_STEP"],
		allowedChildTypes: ["ACCORDION_PANEL"],
		properties: [{
			key: "allowMultipleOpen",
			kind: "text",
			label: "Allow Multiple Panels Open",
			description: "Type true to let several panels stay open at the same time",
			defaultValue: "false"
		}, {
			key: "emptyStateText",
			kind: "text",
			label: "Empty State Text",
			description: "Message shown when the accordion has no panels",
			defaultValue: "No panels configured."
		}]
	},
	{
		componentType: "ACCORDION_PANEL",
		displayName: "Accordion Panel",
		category: "Layout",
		isContainer: !0,
		allowedParentTypes: ["ACCORDION"],
		allowedChildTypes: ["WIZARD"],
		properties: [{
			key: "title",
			kind: "text",
			label: "Panel Title",
			description: "Heading shown on the panel header",
			defaultValue: "Panel",
			required: !0
		}, {
			key: "defaultExpanded",
			kind: "text",
			label: "Default Expanded",
			description: "Type true to open this panel when the screen loads",
			defaultValue: "false"
		}]
	},
	{
		componentType: "WIZARD",
		displayName: "Wizard",
		category: "Layout",
		isContainer: !0,
		allowedParentTypes: ["TAB", "ACCORDION_PANEL"],
		allowedChildTypes: ["WIZARD_STEP"],
		properties: [
			{
				key: "initialStep",
				kind: "number",
				label: "Initial Step",
				description: "Zero-based index of the step shown first",
				defaultValue: 0,
				validation: {
					min: 0,
					integer: !0
				}
			},
			{
				key: "allowSkipSteps",
				kind: "text",
				label: "Allow Skip Steps",
				description: "Type true to let users jump to any step from the step list",
				defaultValue: "false"
			},
			{
				key: "nextLabel",
				kind: "text",
				label: "Next Button Label",
				description: "Text on the Next button",
				defaultValue: "Next"
			},
			{
				key: "backLabel",
				kind: "text",
				label: "Back Button Label",
				description: "Text on the Back button",
				defaultValue: "Back"
			}
		]
	},
	{
		componentType: "WIZARD_STEP",
		displayName: "Wizard Step",
		category: "Layout",
		isContainer: !0,
		allowedParentTypes: ["WIZARD"],
		allowedChildTypes: ["ACCORDION"],
		properties: [{
			key: "label",
			kind: "text",
			label: "Step Label",
			description: "Label displayed for the step",
			defaultValue: "Step",
			required: !0
		}]
	}
], n = [
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
		}
	},
	{
		id: "accordion-1",
		componentCode: "ACCORDION_1",
		componentType: "ACCORDION",
		parentId: "tab-1",
		displayName: "Accordion",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			allowMultipleOpen: "false",
			emptyStateText: "No panels configured."
		}
	},
	{
		id: "accordion-1-panel-1",
		componentCode: "ACCORDION_1_PANEL_1",
		componentType: "ACCORDION_PANEL",
		parentId: "accordion-1",
		displayName: "Panel 1",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			title: "Wizard Details",
			defaultExpanded: "true"
		}
	},
	{
		id: "wizard-1",
		componentCode: "WIZARD_1",
		componentType: "WIZARD",
		parentId: "accordion-1-panel-1",
		displayName: "Wizard",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			initialStep: 0,
			allowSkipSteps: "false",
			nextLabel: "Next",
			backLabel: "Back"
		}
	},
	{
		id: "wizard-1-step-1",
		componentCode: "WIZARD_1_STEP_1",
		componentType: "WIZARD_STEP",
		parentId: "wizard-1",
		displayName: "Step 1",
		displayOrder: 1,
		isVisible: !0,
		properties: { label: "Basic Details" },
		content: {
			type: "FORM",
			fields: "ALL_ACTIVE"
		}
	},
	{
		id: "wizard-1-step-2",
		componentCode: "WIZARD_1_STEP_2",
		componentType: "WIZARD_STEP",
		parentId: "wizard-1",
		displayName: "Step 2",
		displayOrder: 2,
		isVisible: !0,
		properties: { label: "Records" },
		content: {
			type: "TABLE",
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
		}
	},
	{
		id: "wizard-2",
		componentCode: "WIZARD_2",
		componentType: "WIZARD",
		parentId: "tab-2",
		displayName: "Wizard",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			initialStep: 0,
			allowSkipSteps: "false",
			nextLabel: "Next",
			backLabel: "Back"
		}
	},
	{
		id: "wizard-2-step-1",
		componentCode: "WIZARD_2_STEP_1",
		componentType: "WIZARD_STEP",
		parentId: "wizard-2",
		displayName: "Step 1",
		displayOrder: 1,
		isVisible: !0,
		properties: { label: "Basic Details" }
	},
	{
		id: "accordion-2-1",
		componentCode: "ACCORDION_2_1",
		componentType: "ACCORDION",
		parentId: "wizard-2-step-1",
		displayName: "Accordion",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			allowMultipleOpen: "false",
			emptyStateText: "No panels configured."
		}
	},
	{
		id: "accordion-2-1-panel-1",
		componentCode: "ACCORDION_2_1_PANEL_1",
		componentType: "ACCORDION_PANEL",
		parentId: "accordion-2-1",
		displayName: "Panel 1",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			title: "Basic Details",
			defaultExpanded: "true"
		},
		content: {
			type: "FORM",
			fields: "ALL_ACTIVE"
		}
	},
	{
		id: "wizard-2-step-2",
		componentCode: "WIZARD_2_STEP_2",
		componentType: "WIZARD_STEP",
		parentId: "wizard-2",
		displayName: "Step 2",
		displayOrder: 2,
		isVisible: !0,
		properties: { label: "Records" }
	},
	{
		id: "accordion-2-2",
		componentCode: "ACCORDION_2_2",
		componentType: "ACCORDION",
		parentId: "wizard-2-step-2",
		displayName: "Accordion",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			allowMultipleOpen: "false",
			emptyStateText: "No panels configured."
		}
	},
	{
		id: "accordion-2-2-panel-1",
		componentCode: "ACCORDION_2_2_PANEL_1",
		componentType: "ACCORDION_PANEL",
		parentId: "accordion-2-2",
		displayName: "Panel 1",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			title: "Records",
			defaultExpanded: "true"
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
	return e === !0 || String(e).trim().toLowerCase() === "true";
}
function l(e) {
	return e?.key ?? e?.id ?? null;
}
function u(e) {
	return [...e].sort((e, t) => (e.displayOrder ?? 0) - (t.displayOrder ?? 0));
}
function d(e, t) {
	let n = l(t);
	if (typeof e?.getChildren == "function" && n != null) {
		let t = e.getChildren(n);
		if (Array.isArray(t)) return u(t.filter((e) => e?.isVisible !== !1));
	}
	let r = e?.components;
	return Array.isArray(r) ? u(r.filter((e) => e.parentId != null && String(e.parentId) === String(n) && e.isVisible !== !1)) : [];
}
function f(e, t, n) {
	e != null && (Array.isArray(e) ? e.forEach((e) => f(e, t, n)) : o(e) ? t.appendChild(e) : o(e.element) && (t.appendChild(e.element), typeof e.dispose == "function" && n.push(e.dispose)));
}
function p(e, t, n, r) {
	try {
		if (typeof e?.renderChildren == "function") {
			f(e.renderChildren(t), n, r);
			return;
		}
		typeof e?.renderNode == "function" && d(e, t).forEach((t) => {
			f(e.renderNode(t), n, r);
		});
	} catch (e) {
		console.error("Template: platform content failed to render.", e), n.appendChild(a("p", "This content could not be rendered."));
	}
}
function m(e) {
	e.splice(0).forEach((e) => {
		try {
			e();
		} catch (e) {
			console.error("Template: dispose failed.", e);
		}
	});
}
function h(e, t) {
	let n = d(e, t).map((e) => e.componentType);
	return n.includes("TABLE") && !n.includes("FORM");
}
function g(e, t, n) {
	let r = [], i = !1;
	return {
		element: n,
		activate() {
			(!i || h(e, t)) && (m(r), n.replaceChildren(), p(e, t, n, r), i = !0);
		},
		dispose() {
			m(r);
		}
	};
}
function _(e, t, n) {
	let r = d(e.context, t).filter((e) => x[e.componentType]);
	if (r.length === 0) return g(e.context, t, n);
	let i = r.map((t) => x[t.componentType](t, e));
	return i.forEach((e) => n.appendChild(e.element)), {
		element: n,
		activate() {
			i.forEach((e) => e.activate());
		},
		dispose() {
			m(i.map((e) => e.dispose));
		}
	};
}
function v(e, t) {
	let { context: n } = t, r = a("div");
	r.setAttribute("data-component-type", "ACCORDION");
	let i = d(n, e).filter((e) => e.componentType === "ACCORDION_PANEL");
	if (i.length === 0) return r.appendChild(a("p", s(e, "emptyStateText", "No panels configured."))), {
		element: r,
		activate() {},
		dispose() {
			r.replaceChildren();
		}
	};
	let o = c(s(e, "allowMultipleOpen", "false")), l = [];
	function u(e, t) {
		l[e].body.hidden = !t, l[e].header.setAttribute("aria-expanded", String(t));
	}
	function f(e) {
		let t = l[e].body.hidden;
		t && !o && l.forEach((t, n) => {
			n !== e && u(n, !1);
		}), u(e, t), t && l[e].part.activate();
	}
	i.forEach((e, n) => {
		let i = t.uid("accordion-header"), o = t.uid("accordion-body"), c = a("section");
		c.setAttribute("data-component-type", "ACCORDION_PANEL");
		let u = a("h4"), d = a("button", s(e, "title", `Panel ${n + 1}`));
		d.type = "button", d.id = i, d.setAttribute("aria-expanded", "false"), d.setAttribute("aria-controls", o), u.appendChild(d);
		let p = a("div");
		p.id = o, p.setAttribute("role", "region"), p.setAttribute("aria-labelledby", i), p.hidden = !0;
		let m = a("div");
		m.setAttribute("data-panel-content", String(e.componentCode || n)), p.appendChild(m);
		let h = _(t, e, m);
		l.push({
			header: d,
			body: p,
			part: h
		}), d.addEventListener("click", () => f(n)), c.appendChild(u), c.appendChild(p), r.appendChild(c);
	});
	let p = !1;
	return i.forEach((e, t) => {
		c(s(e, "defaultExpanded", "false")) && (o || !p) && (u(t, !0), p = !0);
	}), {
		element: r,
		activate() {
			l.forEach((e) => {
				e.body.hidden || e.part.activate();
			});
		},
		dispose() {
			m(l.map((e) => e.part.dispose)), r.replaceChildren();
		}
	};
}
function y(e, t) {
	let { context: n } = t, r = a("div");
	r.setAttribute("data-component-type", "WIZARD");
	let i = d(n, e).filter((e) => e.componentType === "WIZARD_STEP");
	if (i.length === 0) return r.appendChild(a("p", "No wizard steps configured.")), {
		element: r,
		activate() {},
		dispose() {
			r.replaceChildren();
		}
	};
	let o = c(s(e, "allowSkipSteps", "false")), l = String(s(e, "nextLabel", "Next")), u = String(s(e, "backLabel", "Back")), f = a("ol");
	f.setAttribute("aria-label", "Wizard steps");
	let p = a("div"), h = a("div"), g = a("button", u), v = a("button", l);
	g.type = "button", v.type = "button";
	let y = [], b = 0;
	function x(e, t = !0) {
		e < 0 || e >= i.length || (b = e, y.forEach((t, n) => {
			let r = n === e;
			t.button.setAttribute("aria-current", r ? "step" : "false"), t.panel.hidden = !r;
		}), g.disabled = e === 0, v.disabled = e === i.length - 1, t && y[e].part.activate());
	}
	i.forEach((e, n) => {
		let r = a("li"), i = a("button", s(e, "label", `Step ${n + 1}`));
		i.type = "button", i.setAttribute("aria-current", "false");
		let c = a("section");
		c.setAttribute("data-wizard-step", String(e.componentCode || n)), c.hidden = !0;
		let l = a("div");
		c.appendChild(l);
		let u = _(t, e, l);
		y.push({
			button: i,
			panel: c,
			part: u
		}), i.addEventListener("click", () => {
			(o || n <= b) && x(n);
		}), r.appendChild(i), f.appendChild(r), p.appendChild(c);
	}), g.addEventListener("click", () => x(b - 1)), v.addEventListener("click", () => x(b + 1)), h.appendChild(g), h.appendChild(v), r.appendChild(f), r.appendChild(p), r.appendChild(h);
	let S = Number(s(e, "initialStep", 0));
	return x(Number.isInteger(S) ? Math.max(0, Math.min(S, i.length - 1)) : 0, !1), {
		element: r,
		activate() {
			y[b].part.activate();
		},
		dispose() {
			m(y.map((e) => e.part.dispose)), r.replaceChildren();
		}
	};
}
function b(e, t) {
	let { context: n } = t, r = a("div");
	r.setAttribute("data-component-type", "TABS");
	let i = d(n, e).filter((e) => e.componentType === "TAB");
	if (i.length === 0) return r.appendChild(a("p", "No tabs configured.")), {
		element: r,
		activate() {},
		dispose() {
			r.replaceChildren();
		}
	};
	let o = a("div");
	o.setAttribute("role", "tablist"), o.setAttribute("aria-label", "Tabs");
	let c = a("div"), l = [], u = [], f = [], p = 0;
	function h(e) {
		e < 0 || e >= i.length || (p = e, l.forEach((t, n) => {
			let r = n === e;
			t.setAttribute("aria-selected", String(r)), t.tabIndex = r ? 0 : -1, u[n].hidden = !r;
		}), f[e].activate());
	}
	i.forEach((e, n) => {
		let r = t.uid("tab"), i = t.uid("panel"), d = a("button", s(e, "label", `Tab ${n + 1}`));
		d.type = "button", d.id = r, d.setAttribute("role", "tab"), d.setAttribute("aria-controls", i), d.setAttribute("aria-selected", "false"), d.tabIndex = -1;
		let p = a("section");
		p.id = i, p.setAttribute("role", "tabpanel"), p.setAttribute("aria-labelledby", r), p.tabIndex = 0, p.hidden = !0;
		let m = String(s(e, "panelTitle", "")).trim(), g = String(s(e, "description", "")).trim();
		m && p.appendChild(a("h3", m)), g && p.appendChild(a("p", g));
		let v = a("div");
		v.setAttribute("data-tab-content", String(e.componentCode || n)), p.appendChild(v), f.push(_(t, e, v)), d.addEventListener("click", () => h(n)), d.addEventListener("keydown", (e) => {
			let t;
			if (e.key === "ArrowRight") t = (n + 1) % l.length;
			else if (e.key === "ArrowLeft") t = (n - 1 + l.length) % l.length;
			else if (e.key === "Home") t = 0;
			else if (e.key === "End") t = l.length - 1;
			else return;
			e.preventDefault(), h(t), l[t].focus();
		}), l.push(d), u.push(p), o.appendChild(d), c.appendChild(p);
	}), r.appendChild(o), r.appendChild(c);
	let g = Number(s(e, "activeIndex", 0));
	return h(Number.isInteger(g) ? Math.max(0, Math.min(g, i.length - 1)) : 0), {
		element: r,
		activate() {
			f[p].activate();
		},
		dispose() {
			m(f.map((e) => e.dispose)), r.replaceChildren();
		}
	};
}
var x = {
	ACCORDION: v,
	WIZARD: y
};
function S(e) {
	let t = a("section"), n = `template-instance-${++r}`, o = [], s = 0, c = {
		context: e,
		uid: (e) => `${n}-${e}-${++s}`
	};
	t.setAttribute("data-template-instance", n);
	let l = u((Array.isArray(e?.roots) ? e.roots : Array.isArray(e?.components) ? e.components.filter((e) => !e.parentId) : []).filter((e) => e?.isVisible !== !1).filter((e) => e.componentType === "TABS"));
	l.forEach((e) => {
		let n = b(e, c);
		t.appendChild(n.element), o.push(n.dispose);
	}), l.length === 0 && t.appendChild(a("p", "No tabs container configured."));
	let d = !1, f = () => {
		d || (d = !0, i.delete(f), m(o), t.replaceChildren());
	};
	return i.add(f), {
		element: t,
		dispose: f
	};
}
function C() {
	[...i].forEach((e) => e()), i.clear();
}
var w = {
	contractVersion: 1,
	componentTypes: t,
	components: n,
	render: S,
	destroy: C
};
//#endregion
export { t as componentTypes, n as components, e as contractVersion, w as default, C as destroy, S as render };
