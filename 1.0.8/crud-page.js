//#region src/common.js
var e = {
	create: !1,
	edit: !1,
	delete: !1
}, t = (e) => typeof e == "object" && !!e && !Array.isArray(e), n = (e, t, n = {}, ...r) => {
	let i = document.createElement(e);
	return t && (i.className = t), Object.assign(i, n), i.append(...r), i;
}, r = {
	screenCard: "screen-card",
	header: "screen-header",
	title: "screen-title",
	tableWrap: "table-container",
	table: "data-table",
	actions: "table-actions",
	empty: "empty-state",
	form: "dynamic-form",
	field: "form-field",
	label: "form-label",
	control: "form-control",
	formActions: "form-actions",
	formError: "form-error",
	editingRow: "editing-row",
	dialog: "dialog",
	dialogTitle: "dialog-title",
	formPage: "form-page",
	split: "screen-split",
	panel: "side-panel",
	panelTitle: "side-panel-title",
	btn: {
		primary: "primary-button",
		secondary: "secondary-button",
		danger: "danger-button"
	}
}, i = (e, t, i, { compact: a = !1, type: o = "button" } = {}) => {
	let s = {
		type: o,
		textContent: t
	};
	return typeof i == "function" && (s.onclick = i), n("button", (r.btn[e] || r.btn.secondary) + (a ? " compact-button" : ""), s);
}, a = (e) => e?.id ?? e?.Id ?? e?.recordId ?? e?.RecordId ?? e?.values?.id ?? e?.values?.Id ?? e?.Values?.id ?? e?.Values?.Id ?? null;
function o(e, t) {
	let n = (e, t) => e && Object.prototype.hasOwnProperty.call(e, t);
	if (n(e?.values, t)) return e.values[t];
	if (n(e, t)) return e[t];
	let r = e?.values || e || {}, i = Object.keys(r).find((e) => e.toLowerCase() === String(t).toLowerCase());
	return i ? r[i] : null;
}
var s = (e) => e.fields.filter((e) => e.showInGrid !== !1), c = (e) => e.fields.filter((e) => e.showInForm !== !1 && !e.autoNumber), l = (e, t) => t == null ? "" : e.type === "date" && /^\d{4}-\d{2}-\d{2}T/.test(String(t)) ? String(t).slice(0, 10) : t, u = (e, t = "") => {
	let i;
	return i = e.type === "select" ? n("select", r.control, {}, n("option", "", {
		value: "",
		textContent: "Select"
	}), ...(e.options || []).map((e) => n("option", "", {
		value: e,
		textContent: e
	}))) : e.type === "textarea" ? n("textarea", r.control, { rows: 3 }) : n("input", r.control, { type: e.type || "text" }), i.required = !!e.required, i.name = e.name, e.maxLength && e.type !== "select" && (i.maxLength = e.maxLength), e.readOnly && (i.disabled = !0), i.value = l(e, t), i;
};
function d(e, t) {
	let n = e?.runtime, r = [
		e?.actions,
		n?.actions,
		e?.metadata?.actions,
		e,
		n
	];
	for (let e of r) if (e) {
		for (let n of t) if (typeof e[n] == "function") return e[n].bind(e);
	}
	return null;
}
function f(e) {
	return Array.isArray(e?.records) ? e.records : (console.warn("[template] context.records is not an array; showing no rows."), []);
}
function p(e) {
	let t = e?.actions, n = Array.isArray(e?.records) ? e.records : [], r = (e) => n.find((t) => String(a(t)) === String(e)) ?? { id: e }, i = d(e, [
		"create",
		"onCreate",
		"createRecord",
		"addRecord"
	]), o = d(e, [
		"update",
		"onUpdate",
		"updateRecord"
	]), s = d(e, [
		"delete",
		"remove",
		"onDelete",
		"deleteRecord"
	]);
	return typeof t?.saveRecord == "function" && (i || (i = (e) => t.saveRecord(null, e), i.reloads = !0), o || (o = (e, n) => t.saveRecord(r(e), n), o.reloads = !0)), typeof t?.deleteRecord == "function" && typeof t?.delete != "function" && typeof t?.remove != "function" && typeof t?.onDelete != "function" && (s = (e) => t.deleteRecord(e), s.reloads = !0, s.confirms = !0), {
		create: i,
		update: o,
		delete: s
	};
}
var m = (e) => d(e, [
	"refresh",
	"reload",
	"refetch",
	"onRefresh"
]), h = (e) => d(e, [
	"toast",
	"notify",
	"showToast"
]) || ((e) => console.log(e)), g = (e) => d(e, [
	"validate",
	"onValidate",
	"validateRecord"
]);
async function _(e, n, r) {
	if (typeof e != "function") return {};
	try {
		let i = await e(n, r);
		if (i == null || i === !0) return {};
		if (i === !1) return { _form: "Invalid data" };
		if (typeof i == "string") return { _form: i };
		if (Array.isArray(i)) return i.length ? { _form: i.join(", ") } : {};
		if (t(i)) {
			if (i.valid === !0) return {};
			let e = i;
			t(i.errors) ? e = i.errors : Array.isArray(i.errors) && (e = i.errors.length ? { _form: i.errors.join(", ") } : {});
			let n = {};
			return Object.entries(e).forEach(([e, t]) => {
				e !== "valid" && t && (n[e] = Array.isArray(t) ? t.join(", ") : String(t));
			}), !Object.keys(n).length && i.valid === !1 && (n._form = "Invalid data"), n;
		}
		return {};
	} catch (e) {
		return { _form: e?.message || "Validation failed" };
	}
}
function v(e, n = {}) {
	let r = n.toast || ((e) => console.log(e)), i = n.actions || {}, o = Array.isArray(n.records) ? [...n.records] : [], s = {}, c = !1, l = async (e) => {
		if (typeof n.refresh == "function") try {
			let e = await n.refresh();
			if (Array.isArray(e)) {
				o = e;
				return;
			}
		} catch (e) {
			console.warn("[template] refresh failed", e);
		}
		o = e(o);
	};
	return {
		get rows() {
			return o;
		},
		get errors() {
			return s;
		},
		toast: r,
		destroy() {
			c = !0;
		},
		async save(e, o) {
			let u = e == null, d = u ? i.create : i.update;
			if (!d) return console.warn(`[template] platform ${u ? "create" : "update"} action not provided.`), r("Save is not available"), !1;
			if (s = await _(n.validate, o, e), c) return !1;
			if (Object.keys(s).length) return r(Object.values(s)[0]), !1;
			try {
				let n = u ? await d(o) : await d(e, o);
				if (n === !1) return c || (s = {}), !1;
				if (c) return !0;
				let i = t(n) ? n : {};
				return await l((t) => u ? [...t, {
					...o,
					...i
				}] : t.map((t) => String(a(t)) === String(e) ? {
					...t,
					...o,
					...i
				} : t)), c || r("Saved"), !0;
			} catch (e) {
				return console.error("[template] save failed", e), s = { _form: e?.message || "Save failed" }, c || r(s._form), !1;
			}
		},
		async remove(e) {
			let t = i.delete;
			if (!t) return console.warn("[template] platform delete action not provided."), r("Delete is not available"), !1;
			if (!t.confirms && !confirm("Delete this record?")) return !1;
			try {
				let n = await t(e);
				return c ? !0 : t.reloads || n === !1 ? !1 : (await l((t) => t.filter((t) => String(a(t)) !== String(e))), c || r("Deleted"), !0);
			} catch (e) {
				return console.error("[template] delete failed", e), c || r(e?.message || "Delete failed"), !1;
			}
		}
	};
}
function y(t, { onAdd: c, onEdit: l, onDelete: u }) {
	let d = t.permissions || e, f = s(t), p = n("tbody", ""), m = n("p", r.empty, { textContent: "No records yet." }), h = n("table", r.table, {}, n("thead", "", {}, n("tr", "", {}, ...f.map((e) => n("th", "", { textContent: e.label })), n("th", "", { textContent: "Actions" }))), p), g = n("header", r.header, {}, n("h2", r.title, { textContent: t.title }), ...d.create ? [i("primary", "Add", c)] : []);
	return {
		main: n("section", r.screenCard, {}, g, n("div", r.tableWrap, {}, h), m),
		render: (e) => {
			p.replaceChildren(...e.map((e) => n("tr", "", {}, ...f.map((t) => n("td", "", { textContent: o(e, t.name) ?? "" })), n("td", r.actions, {}, ...d.edit ? [i("secondary", "Edit", () => l(e), { compact: !0 })] : [], ...d.delete ? [i("danger", "Delete", () => u(a(e)), { compact: !0 })] : [])))), m.hidden = e.length > 0, h.hidden = e.length === 0;
		}
	};
}
function b(e, { onSubmit: t, onCancel: a }) {
	let s = {}, d = c(e), f = n("form", r.form);
	d.forEach((e) => {
		let t = u(e);
		s[e.name] = t, t.addEventListener("input", () => t.setCustomValidity("")), f.append(n("div", r.field, {}, n("label", r.label, { textContent: e.label + (e.required ? " *" : "") }), t));
	});
	let p = n("p", r.formError, { hidden: !0 }), m = i("primary", "Save", null, { type: "submit" });
	f.append(p, n("div", r.formActions, {}, m, i("secondary", "Cancel", a)));
	let h = () => {
		p.hidden = !0, p.textContent = "", Object.values(s).forEach((e) => e.setCustomValidity(""));
	};
	return f.onsubmit = async (e) => {
		if (e.preventDefault(), !m.disabled) {
			m.disabled = !0;
			try {
				await t(Object.fromEntries(d.filter((e) => !e.readOnly).map((e) => [e.name, s[e.name].value])));
			} finally {
				m.disabled = !1;
			}
		}
	}, {
		form: f,
		fill: (e) => {
			h(), d.forEach((t) => s[t.name].value = e ? l(t, o(e, t.name)) : "");
		},
		focus: () => s[d[0]?.name]?.focus(),
		showErrors(e = {}) {
			h(), e._form && (p.textContent = e._form, p.hidden = !1);
			let t = null;
			d.forEach((n) => {
				let r = e[n.name];
				r && (s[n.name].setCustomValidity(r), t ??= s[n.name]);
			}), t?.reportValidity();
		}
	};
}
var x = {
	string: "text",
	text: "text",
	number: "number",
	int: "number",
	integer: "number",
	decimal: "number",
	date: "date",
	datetime: "date",
	email: "email",
	textarea: "textarea",
	multiemail: "textarea",
	select: "select",
	dropdown: "select",
	lookup: "select"
};
function S(e) {
	let t = e.name ?? e.fieldName ?? e.key ?? e.field, n = String(e.type ?? e.controlType ?? e.fieldType ?? "text").toLowerCase(), r = x[n] ?? "text", i = (e.options ?? e.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
	return r === "select" && i.length === 0 && (r = "text"), {
		name: t,
		label: e.label ?? e.displayName ?? e.title ?? t,
		type: r,
		required: !!(e.required ?? e.isRequired),
		options: i,
		showInGrid: e.showInGrid !== !1,
		showInForm: e.showInForm !== !1,
		readOnly: e.isReadOnly === !0 || n === "checkbox",
		autoNumber: n === "autonumber",
		displayOrder: e.displayOrder ?? 0,
		maxLength: e.maxLength > 0 ? e.maxLength : void 0,
		lookupCode: e.lookupCode ?? void 0
	};
}
function C(e) {
	let t = e?.metadata ?? e ?? {}, n = t.fields ?? t.columns ?? e?.fields ?? [];
	return {
		screenId: t.screenId ?? t.screenKey ?? t.screenName ?? t.entityName ?? t.id ?? "screen",
		title: t.title ?? t.screenTitle ?? t.screenName ?? t.displayName ?? t.entityName ?? "",
		fields: n.map(S).filter((e) => e.name).sort((e, t) => e.displayOrder - t.displayOrder)
	};
}
function w(t) {
	let n = t?.metadata ?? {}, r = t?.permissions ?? n.permissions ?? t?.runtime?.permissions ?? t?.allowedActions ?? n.allowedActions ?? null;
	if (r && !Array.isArray(r) && typeof r == "object") {
		let e = r.allowedActions ?? r.AllowedActions ?? r.actions ?? r.permissions;
		Array.isArray(e) && (r = e);
	}
	if (!r || typeof r != "object") return console.warn("[crud template] No permissions found in context; all actions disabled."), { ...e };
	let i = {};
	Array.isArray(r) ? r.forEach((e) => {
		if (typeof e == "string") i[e.trim().toLowerCase()] = !0;
		else if (e && typeof e == "object") {
			let t = e.actionCode ?? e.ActionCode ?? e.action ?? e.code, n = e.isAllowed ?? e.IsAllowed ?? !0;
			t && (i[String(t).trim().toLowerCase()] = n !== !1);
		}
	}) : Object.entries(r).forEach(([e, t]) => {
		typeof t == "boolean" && (i[e.toLowerCase()] = t);
	});
	let a = (e) => e.some((e) => i[e] === !0);
	return {
		create: a([
			"cancreate",
			"create",
			"canadd",
			"add",
			"insert"
		]),
		edit: a([
			"canedit",
			"edit",
			"canupdate",
			"update",
			"modify"
		]),
		delete: a([
			"candelete",
			"delete",
			"canremove",
			"remove"
		])
	};
}
function T(e) {
	return {
		records: f(e),
		actions: p(e),
		refresh: m(e),
		toast: h(e),
		validate: g(e)
	};
}
function E(t, n) {
	let r = null;
	return {
		contractVersion: 1,
		supportedScreenTypes: n,
		render(n) {
			r?.destroy();
			let i = document.createElement("div");
			i.className = "vc-host";
			let a = T(n), o = n?.readOnly === !0 ? { ...e } : w(n), s = {
				create: o.create && !!a.actions.create,
				edit: o.edit && !!a.actions.update,
				delete: o.delete && !!a.actions.delete
			};
			return o.create && !a.actions.create && console.warn("[template] create allowed but no platform create action."), o.edit && !a.actions.update && console.warn("[template] edit allowed but no platform update action."), o.delete && !a.actions.delete && console.warn("[template] delete allowed but no platform delete action."), r = t(i, {
				metadata: {
					...C(n),
					permissions: s
				},
				platform: a
			}), i;
		},
		destroy() {
			r?.destroy(), r = null;
		}
	};
}
//#endregion
//#region src/crud-page.js
function D(e, { metadata: t, platform: o }) {
	let s = v(t, o), c = null, l = y(t, {
		onAdd: () => m(null),
		onEdit: m,
		onDelete: async (e) => {
			await s.remove(e) && l.render(s.rows);
		}
	}), u = n("h2", r.title), d = b(t, {
		onSubmit: async (e) => {
			await s.save(c, e) ? (l.render(s.rows), h()) : d.showErrors(s.errors);
		},
		onCancel: () => h()
	}), f = i("secondary", "Back to list", () => h()), p = n("section", r.formPage, { hidden: !0 }, f, u, d.form);
	function m(e) {
		c = e ? a(e) : null, u.textContent = e ? "Edit record" : "New record", d.fill(e), l.main.hidden = !0, p.hidden = !1, d.focus();
	}
	function h() {
		c = null, p.hidden = !0, l.main.hidden = !1;
	}
	return e.replaceChildren(l.main, p), l.render(s.rows), { destroy: () => {
		s.destroy(), e.replaceChildren();
	} };
}
var O = E(D, ["CRUD-PAGE"]);
//#endregion
export { O as default };
