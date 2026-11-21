//#region src/tabs.js
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
		allowedChildTypes: ["FIELD"],
		properties: [{
			key: "label",
			kind: "text",
			label: "Tab Label",
			description: "Label displayed on the tab",
			defaultValue: "Tab",
			required: !0
		}, {
			key: "description",
			kind: "textarea",
			label: "Description",
			description: "Optional text shown above the tab content",
			defaultValue: ""
		}]
	},
	{
		componentType: "FIELD",
		displayName: "Field",
		category: "Data",
		isContainer: !1,
		allowedParentTypes: ["TAB"],
		properties: [
			{
				key: "label",
				kind: "text",
				label: "Field Label",
				description: "Label displayed next to the input",
				defaultValue: "Field",
				required: !0
			},
			{
				key: "fieldName",
				kind: "text",
				label: "Field Name",
				description: "Name of the entity field this input represents",
				defaultValue: ""
			},
			{
				key: "inputType",
				kind: "select",
				label: "Input Type",
				defaultValue: "text",
				options: [
					{
						value: "text",
						label: "Text"
					},
					{
						value: "textarea",
						label: "Text area"
					},
					{
						value: "number",
						label: "Number"
					},
					{
						value: "date",
						label: "Date"
					},
					{
						value: "checkbox",
						label: "Checkbox"
					}
				]
			},
			{
				key: "placeholder",
				kind: "text",
				label: "Placeholder",
				defaultValue: ""
			},
			{
				key: "defaultValue",
				kind: "text",
				label: "Default Value",
				defaultValue: ""
			},
			{
				key: "isRequired",
				kind: "checkbox",
				label: "Required",
				defaultValue: !1
			}
		]
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
			description: ""
		}
	},
	{
		id: "tab-1-field-1",
		componentCode: "TAB_1_FIELD_1",
		componentType: "FIELD",
		parentId: "tab-1",
		displayName: "Field 1",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			label: "Field 1",
			fieldName: "",
			inputType: "text",
			placeholder: "",
			defaultValue: "",
			isRequired: !1
		}
	},
	{
		id: "tab-1-field-2",
		componentCode: "TAB_1_FIELD_2",
		componentType: "FIELD",
		parentId: "tab-1",
		displayName: "Field 2",
		displayOrder: 2,
		isVisible: !0,
		properties: {
			label: "Field 2",
			fieldName: "",
			inputType: "text",
			placeholder: "",
			defaultValue: "",
			isRequired: !1
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
			description: ""
		}
	},
	{
		id: "tab-2-field-1",
		componentCode: "TAB_2_FIELD_1",
		componentType: "FIELD",
		parentId: "tab-2",
		displayName: "Field 1",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			label: "Field 1",
			fieldName: "",
			inputType: "text",
			placeholder: "",
			defaultValue: "",
			isRequired: !1
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
	return e === !0 || e === "true" || e === 1 || e === "1";
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
		if (Array.isArray(t)) return t.filter((e) => e?.isVisible !== !1);
	}
	let r = e?.components;
	return Array.isArray(r) ? u(r.filter((e) => e.parentId != null && String(e.parentId) === String(n) && e.isVisible !== !1)) : [];
}
var f = [
	"text",
	"textarea",
	"number",
	"date",
	"checkbox"
];
function p(e, t) {
	let n = a("div");
	n.setAttribute("data-component-type", "FIELD"), n.setAttribute("data-component-code", e.componentCode || "");
	let r = String(s(e, "fieldName", "")).trim(), i = String(s(e, "inputType", "text")), o = f.includes(i) ? i : "text", l = c(s(e, "isRequired", !1)), u = String(s(e, "defaultValue", "")), d = String(s(e, "placeholder", "")), p = String(s(e, "label", "") || e.displayName || "Field"), m = a("label", l ? `${p} *` : p);
	m.setAttribute("for", t);
	let h;
	return o === "textarea" ? (h = a("textarea"), h.value = u) : (h = a("input"), h.type = o, o === "checkbox" ? h.checked = c(u) : h.value = u), h.id = t, r && h.setAttribute("name", r), d && o !== "checkbox" && h.setAttribute("placeholder", d), l && h.setAttribute("aria-required", "true"), n.appendChild(m), n.appendChild(h), n;
}
function m(e, t, n) {
	e != null && (Array.isArray(e) ? e.forEach((e) => m(e, t, n)) : o(e) ? t.appendChild(e) : o(e.element) && (t.appendChild(e.element), typeof e.dispose == "function" && n.push(e.dispose)));
}
function h(e, t, n, r, i, o) {
	d(e, t).forEach((t, s) => {
		try {
			t.componentType === "FIELD" ? n.appendChild(p(t, `${r}-field-${i}-${s}`)) : typeof e?.renderNode == "function" && m(e.renderNode(t), n, o);
		} catch (e) {
			console.error("Tabs template: a tab child failed to render.", e), n.appendChild(a("p", "A component in this tab could not be rendered."));
		}
	});
}
function g(e, t, n, r) {
	let i = a("div");
	i.setAttribute("data-component-type", "TABS");
	let o = d(t, e).filter((e) => e.componentType === "TAB");
	if (o.length === 0) return i.appendChild(a("p", "No tabs configured.")), i;
	let c = a("div");
	c.setAttribute("role", "tablist"), c.setAttribute("aria-label", "Tabs");
	let l = a("div"), u = [], f = [];
	function p(e) {
		e < 0 || e >= o.length || u.forEach((t, n) => {
			let r = n === e;
			t.setAttribute("aria-selected", String(r)), t.tabIndex = r ? 0 : -1, f[n].hidden = !r;
		});
	}
	o.forEach((e, i) => {
		let o = `${n}-tab-${i}`, d = `${n}-panel-${i}`, m = a("button", s(e, "label", `Tab ${i + 1}`));
		m.type = "button", m.id = o, m.setAttribute("role", "tab"), m.setAttribute("aria-controls", d), m.setAttribute("aria-selected", "false"), m.tabIndex = -1;
		let g = a("section");
		g.id = d, g.setAttribute("role", "tabpanel"), g.setAttribute("aria-labelledby", o), g.tabIndex = 0, g.hidden = !0;
		let _ = s(e, "description", "");
		_ && g.appendChild(a("p", _)), h(t, e, g, n, i, r), m.addEventListener("click", () => p(i)), m.addEventListener("keydown", (e) => {
			let t;
			if (e.key === "ArrowRight") t = (i + 1) % u.length;
			else if (e.key === "ArrowLeft") t = (i - 1 + u.length) % u.length;
			else if (e.key === "Home") t = 0;
			else if (e.key === "End") t = u.length - 1;
			else return;
			e.preventDefault(), p(t), u[t].focus();
		}), u.push(m), f.push(g), c.appendChild(m), l.appendChild(g);
	}), i.appendChild(c), i.appendChild(l);
	let m = Number(s(e, "activeIndex", 0));
	return p(Number.isInteger(m) ? Math.max(0, Math.min(m, o.length - 1)) : 0), i;
}
function _(e) {
	let t = a("section"), n = `tabs-instance-${++r}`, o = [];
	t.setAttribute("data-template-instance", n);
	let s = u((Array.isArray(e?.roots) ? e.roots : Array.isArray(e?.components) ? e.components.filter((e) => !e.parentId) : []).filter((e) => e?.isVisible !== !1).filter((e) => e.componentType === "TABS"));
	s.forEach((r, i) => {
		t.appendChild(g(r, e, `${n}-${i}`, o));
	}), s.length === 0 && t.appendChild(a("p", "No tabs container configured."));
	let c = !1, l = () => {
		c || (c = !0, i.delete(l), o.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Tabs template: dispose failed.", e);
			}
		}), t.replaceChildren());
	};
	return i.add(l), {
		element: t,
		dispose: l
	};
}
function v() {
	[...i].forEach((e) => e()), i.clear();
}
var y = {
	contractVersion: 1,
	componentTypes: t,
	components: n,
	render: _,
	destroy: v
};
//#endregion
export { t as componentTypes, n as components, e as contractVersion, y as default, v as destroy, _ as render };
