//#region src/accordion-wizard.js
var e = 1, t = [
	{
		componentType: "ACCORDION",
		displayName: "Accordion",
		category: "Layout",
		isContainer: !0,
		allowedChildTypes: ["ACCORDION_PANEL"],
		properties: [{
			key: "allowMultipleOpen",
			kind: "text",
			label: "Allow Multiple Panels Open",
			defaultValue: "false"
		}, {
			key: "emptyStateText",
			kind: "text",
			label: "Empty State Text",
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
			defaultValue: "Details",
			required: !0
		}, {
			key: "defaultExpanded",
			kind: "text",
			label: "Default Expanded",
			defaultValue: "true"
		}]
	},
	{
		componentType: "WIZARD",
		displayName: "Wizard",
		category: "Layout",
		isContainer: !0,
		allowedParentTypes: ["ACCORDION_PANEL"],
		allowedChildTypes: ["WIZARD_STEP"],
		properties: [
			{
				key: "initialStep",
				kind: "number",
				label: "Initial Step",
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
				defaultValue: "false"
			},
			{
				key: "nextLabel",
				kind: "text",
				label: "Next Button Label",
				defaultValue: "Next"
			},
			{
				key: "backLabel",
				kind: "text",
				label: "Back Button Label",
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
		properties: [{
			key: "label",
			kind: "text",
			label: "Step Label",
			defaultValue: "Step",
			required: !0
		}]
	}
], n = [
	{
		id: "accordion-root",
		componentCode: "ACCORDION_ROOT",
		componentType: "ACCORDION",
		displayName: "Accordion",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			allowMultipleOpen: "false",
			emptyStateText: "No panels configured."
		}
	},
	{
		id: "accordion-panel-1",
		componentCode: "ACCORDION_PANEL_1",
		componentType: "ACCORDION_PANEL",
		parentId: "accordion-root",
		displayName: "Panel 1",
		displayOrder: 1,
		isVisible: !0,
		properties: {
			title: "Wizard Details",
			defaultExpanded: "true"
		}
	},
	{
		id: "wizard-root",
		componentCode: "WIZARD_ROOT",
		componentType: "WIZARD",
		parentId: "accordion-panel-1",
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
		id: "wizard-step-1",
		componentCode: "WIZARD_STEP_1",
		componentType: "WIZARD_STEP",
		parentId: "wizard-root",
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
		id: "wizard-step-2",
		componentCode: "WIZARD_STEP_2",
		componentType: "WIZARD_STEP",
		parentId: "wizard-root",
		displayName: "Step 2",
		displayOrder: 2,
		isVisible: !0,
		properties: { label: "Records" },
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
function o(e, t, n) {
	return e?.properties?.[t] ?? n;
}
function s(e) {
	return e?.key ?? e?.id ?? null;
}
function c(e) {
	return [...e].sort((e, t) => (Number(e.displayOrder) || 0) - (Number(t.displayOrder) || 0));
}
function l(e, t) {
	let n = s(t), r = [];
	return r = typeof e.getChildren == "function" && n !== null ? e.getChildren(n) || [] : (e.components || []).filter((e) => e.parentId === n), c(r.filter((e) => e.isVisible !== !1));
}
function u(e) {
	for (let t of e.splice(0)) try {
		typeof t == "function" && t();
	} catch (e) {
		console.error("Template cleanup failed:", e);
	}
}
function d(e, t, n) {
	e != null && (Array.isArray(e) ? e.forEach((e) => d(e, t, n)) : e.nodeType ? t.appendChild(e) : e.element?.nodeType && (t.appendChild(e.element), typeof e.dispose == "function" && n.push(e.dispose)));
}
function f(e, t, n, r) {
	try {
		let i;
		if (typeof e.renderChildren == "function") i = e.renderChildren(t);
		else if (typeof e.renderNode == "function") i = l(e, t).map((t) => e.renderNode(t));
		else throw Error("Platform rendering is unavailable.");
		d(i, n, r);
	} catch (e) {
		console.error("Platform content render failed:", e), n.textContent = "Content could not be displayed.";
	}
}
function p(e, t) {
	let n = a("section"), r = l(e, t).filter((e) => e.componentType === "WIZARD_STEP");
	if (!r.length) return n.textContent = "No wizard steps configured.", {
		element: n,
		dispose: () => n.replaceChildren()
	};
	let i = a("div"), s = a("div"), c = a("div"), d = [], p = [], m = r.map(() => []), h = String(o(t, "allowSkipSteps", "false")) === "true", g = o(t, "nextLabel", "Next"), _ = o(t, "backLabel", "Back");
	r.forEach((e, t) => {
		let n = a("button", o(e, "label", `Step ${t + 1}`));
		n.type = "button";
		let r = a("section");
		r.hidden = !0;
		let c = a("div");
		r.appendChild(c), d.push(n), p.push({
			panel: r,
			content: c,
			step: e
		}), i.appendChild(n), s.appendChild(r);
	});
	let v = a("button", _), y = a("button", g);
	v.type = "button", y.type = "button", c.append(v, y), n.append(i, s, c);
	let b = 0;
	function x(t) {
		if (t < 0 || t >= r.length) return;
		b = t, d.forEach((e, n) => {
			e.setAttribute("aria-current", n === t ? "step" : "false"), p[n].panel.hidden = n !== t;
		}), v.disabled = t === 0, y.textContent = t === r.length - 1 ? "Finish" : g;
		let n = p[t], i = n.step.content?.type === "TABLE";
		(!n.content.dataset.rendered || i) && (u(m[t]), n.content.replaceChildren(), f(e, n.step, n.content, m[t]), n.content.dataset.rendered = "true");
	}
	d.forEach((e, t) => {
		e.addEventListener("click", () => {
			(h || t <= b) && x(t);
		});
	}), v.addEventListener("click", () => {
		x(b - 1);
	}), y.addEventListener("click", () => {
		b < r.length - 1 && x(b + 1);
	});
	let S = Number(o(t, "initialStep", 0));
	return x(Number.isInteger(S) ? Math.min(Math.max(S, 0), r.length - 1) : 0), {
		element: n,
		dispose() {
			m.forEach(u), n.replaceChildren();
		}
	};
}
function m(e, t) {
	let n = a("section"), r = l(e, t).filter((e) => e.componentType === "ACCORDION_PANEL");
	if (!r.length) return n.textContent = o(t, "emptyStateText", "No panels configured."), {
		element: n,
		dispose: () => n.replaceChildren()
	};
	let i = String(o(t, "allowMultipleOpen", "false")) === "true", s = [], c = [];
	if (r.forEach((t, r) => {
		let u = a("section"), d = a("button", o(t, "title", `Panel ${r + 1}`));
		d.type = "button", d.setAttribute("aria-expanded", "false");
		let f = a("div");
		f.hidden = !0;
		let m = l(e, t).filter((e) => e.componentType === "WIZARD");
		m.forEach((t) => {
			let n = p(e, t);
			f.appendChild(n.element), s.push(n.dispose);
		}), m.length || (f.textContent = "No wizard configured."), d.addEventListener("click", () => {
			let e = !f.hidden;
			i || c.forEach((e) => {
				e.body.hidden = !0, e.header.setAttribute("aria-expanded", "false");
			}), f.hidden = e, d.setAttribute("aria-expanded", String(!e));
		}), u.append(d, f), n.appendChild(u), c.push({
			header: d,
			body: f
		}), String(o(t, "defaultExpanded", "false")) === "true" && (f.hidden = !1, d.setAttribute("aria-expanded", "true"));
	}), !i) {
		let e = c.findIndex((e) => !e.body.hidden);
		e >= 0 && c.forEach((t, n) => {
			let r = n === e;
			t.body.hidden = !r, t.header.setAttribute("aria-expanded", String(r));
		});
	}
	return {
		element: n,
		dispose() {
			s.forEach((e) => e()), n.replaceChildren();
		}
	};
}
function h(e) {
	let t = a("div");
	t.id = `accordion-wizard-${++r}`;
	let n = c((e.roots || (e.components || []).filter((e) => !e.parentId)).filter((e) => e.isVisible !== !1 && e.componentType === "ACCORDION")), o = [];
	n.forEach((n) => {
		let r = m(e, n);
		t.appendChild(r.element), o.push(r.dispose);
	}), n.length || (t.textContent = "No accordion configured.");
	let s = !1, l = () => {
		s || (s = !0, i.delete(l), u(o), t.replaceChildren());
	};
	return i.add(l), {
		element: t,
		dispose: l
	};
}
function g() {
	for (let e of [...i]) e();
	i.clear();
}
var _ = {
	contractVersion: 1,
	componentTypes: t,
	components: n,
	render: h,
	destroy: g
};
//#endregion
export { t as componentTypes, n as components, e as contractVersion, _ as default, g as destroy, h as render };
