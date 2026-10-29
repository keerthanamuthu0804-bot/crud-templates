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
var s = (e) => e.fields.filter((e) => e.showInGrid !== !1), c = (e, t) => t == null ? "" : e.type === "date" && /^\d{4}-\d{2}-\d{2}T/.test(String(t)) ? String(t).slice(0, 10) : t, l = (e, t = "") => {
	let i;
	return i = e.type === "select" ? n("select", r.control, {}, n("option", "", {
		value: "",
		textContent: "Select"
	}), ...(e.options || []).map((e) => n("option", "", {
		value: e,
		textContent: e
	}))) : e.type === "textarea" ? n("textarea", r.control, { rows: 3 }) : n("input", r.control, { type: e.type || "text" }), i.required = !!e.required, i.name = e.name, e.maxLength && e.type !== "select" && (i.maxLength = e.maxLength), e.readOnly && (i.disabled = !0), i.value = c(e, t), i;
};
function u(e, t) {
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
function d(e) {
	return Array.isArray(e?.records) ? e.records : (console.warn("[template] context.records is not an array; showing no rows."), []);
}
function f(e) {
	let t = e?.actions, n = Array.isArray(e?.records) ? e.records : [], r = (e) => n.find((t) => String(a(t)) === String(e)) ?? { id: e }, i = u(e, [
		"create",
		"onCreate",
		"createRecord",
		"addRecord"
	]), o = u(e, [
		"update",
		"onUpdate",
		"updateRecord"
	]), s = u(e, [
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
var p = (e) => u(e, [
	"refresh",
	"reload",
	"refetch",
	"onRefresh"
]), m = (e) => u(e, [
	"toast",
	"notify",
	"showToast"
]) || ((e) => console.log(e)), h = (e) => u(e, [
	"validate",
	"onValidate",
	"validateRecord"
]);
async function g(e, n, r) {
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
function _(e, n = {}) {
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
			if (s = await g(n.validate, o, e), c) return !1;
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
var v = {
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
function y(e) {
	let t = e.name ?? e.fieldName ?? e.key ?? e.field, n = String(e.type ?? e.controlType ?? e.fieldType ?? "text").toLowerCase(), r = v[n] ?? "text", i = (e.options ?? e.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
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
function b(e) {
	let t = e?.metadata ?? e ?? {}, n = t.fields ?? t.columns ?? e?.fields ?? [];
	return {
		screenId: t.screenId ?? t.screenKey ?? t.screenName ?? t.entityName ?? t.id ?? "screen",
		title: t.title ?? t.screenTitle ?? t.screenName ?? t.displayName ?? t.entityName ?? "",
		fields: n.map(y).filter((e) => e.name).sort((e, t) => e.displayOrder - t.displayOrder)
	};
}
function x(t) {
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
function S(e) {
	return {
		records: d(e),
		actions: f(e),
		refresh: p(e),
		toast: m(e),
		validate: h(e)
	};
}
function C(t, n) {
	let r = null;
	return {
		contractVersion: 1,
		supportedScreenTypes: n,
		render(n) {
			r?.destroy();
			let i = document.createElement("div");
			i.className = "vc-host";
			let a = S(n), o = n?.readOnly === !0 ? { ...e } : x(n), s = {
				create: o.create && !!a.actions.create,
				edit: o.edit && !!a.actions.update,
				delete: o.delete && !!a.actions.delete
			};
			return o.create && !a.actions.create && console.warn("[template] create allowed but no platform create action."), o.edit && !a.actions.update && console.warn("[template] edit allowed but no platform update action."), o.delete && !a.actions.delete && console.warn("[template] delete allowed but no platform delete action."), r = t(i, {
				metadata: {
					...b(n),
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
//#region src/crud-inline.js
function w(t, { metadata: c, platform: u }) {
	let d = _(c, u), f = c.permissions || e, p = s(c), m = null, h = !1, g = (e) => e.showInForm && !e.readOnly && !e.autoNumber, v = n("tbody", ""), y = n("p", r.empty, { textContent: "No records yet." }), b = n("table", r.table, {}, n("thead", "", {}, n("tr", "", {}, ...p.map((e) => n("th", "", { textContent: e.label })), n("th", "", { textContent: "Actions" }))), v), x = n("header", r.header, {}, n("h2", r.title, { textContent: c.title }), ...f.create ? [i("primary", "Add", () => {
		m = "new", T();
	})] : []), S = n("section", r.screenCard, {}, x, n("div", r.tableWrap, {}, b), y);
	function C(e) {
		let t = a(e);
		return n("tr", "", {}, ...p.map((t) => n("td", "", { textContent: o(e, t.name) ?? "" })), n("td", r.actions, {}, ...f.edit ? [i("secondary", "Edit", () => {
			m = String(t), T();
		}, { compact: !0 })] : [], ...f.delete ? [i("danger", "Delete", async () => {
			if (h) return;
			h = !0;
			let e = await d.remove(t);
			h = !1, e && T();
		}, { compact: !0 })] : []));
	}
	function w(e) {
		let t = p.map((t) => {
			let r = o(e, t.name) ?? "";
			if (!g(t)) return {
				f: t,
				input: null,
				td: n("td", "", { textContent: r })
			};
			let i = l(t, r);
			return i.addEventListener("input", () => i.setCustomValidity("")), {
				f: t,
				input: i,
				td: n("td", "", {}, i)
			};
		}), a = t.filter((e) => e.input).map((e) => e.input), s = i("primary", "Save", () => c(), { compact: !0 }), c = async () => {
			if (h || !a.every((e) => e.reportValidity())) return;
			h = !0, s.disabled = !0;
			let e = Object.fromEntries(t.filter((e) => e.input).map((e) => [e.f.name, e.input.value])), n = await d.save(m === "new" ? null : m, e);
			if (h = !1, s.disabled = !1, n) {
				m = null, T();
				return;
			}
			let r = d.errors;
			t.forEach((e) => e.input?.setCustomValidity(r[e.f.name] || "")), r._form && a.every((e) => e.validity.valid) && a[0]?.setCustomValidity(r._form), a.find((e) => !e.validity.valid)?.reportValidity();
		};
		return n("tr", r.editingRow, {}, ...t.map((e) => e.td), n("td", r.actions, {}, s, i("secondary", "Cancel", () => {
			m = null, T();
		}, { compact: !0 })));
	}
	function T() {
		v.replaceChildren(...m === "new" ? [w({})] : [], ...d.rows.map((e) => m !== null && m === String(a(e)) ? w(e) : C(e)));
		let e = d.rows.length > 0 || m === "new";
		b.hidden = !e, y.hidden = e;
	}
	return t.replaceChildren(S), T(), { destroy: () => {
		d.destroy(), t.replaceChildren();
	} };
}
var T = C(w, ["CRUD-INLINE"]);
//#endregion
export { T as default };
