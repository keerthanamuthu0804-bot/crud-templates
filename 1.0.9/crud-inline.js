//#region src/common.js
var e = {
	create: !1,
	edit: !1,
	delete: !1
}, t = (e, t = "", n = {}, ...r) => {
	let i = document.createElement(e);
	return t && (i.className = t), Object.assign(i, n), i.append(...r), i;
}, n = {
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
}, r = (e, r, i, { compact: a = !1, type: o = "button" } = {}) => {
	let s = {
		type: o,
		textContent: r
	};
	return typeof i == "function" && (s.onclick = i), t("button", (n.btn[e] || n.btn.secondary) + (a ? " compact-button" : ""), s);
}, i = (e) => e?.id ?? e?.Id ?? e?.recordId ?? e?.RecordId ?? e?.values?.id ?? e?.values?.Id ?? e?.Values?.id ?? e?.Values?.Id ?? null;
function a(e, t) {
	let n = (e, t) => e && Object.prototype.hasOwnProperty.call(e, t);
	if (n(e?.values, t)) return e.values[t];
	if (n(e, t)) return e[t];
	let r = e?.values || e || {}, i = Object.keys(r).find((e) => e.toLowerCase() === String(t).toLowerCase());
	return i ? r[i] : null;
}
var o = (e) => (e?.fields || []).filter((e) => e.showInGrid !== !1);
function s(e) {
	let t = e?.actions || {}, n = typeof t.openForm == "function" ? t.openForm.bind(t) : null, r = typeof t.saveRecord == "function" ? t.saveRecord.bind(t) : null, i = typeof t.deleteRecord == "function" ? t.deleteRecord.bind(t) : null;
	return {
		openForm: n,
		saveRecord: r,
		deleteRecord: i,
		refresh: typeof t.refresh == "function" ? t.refresh.bind(t) : null,
		create: r ? (e) => r(null, e) : null,
		update: r ? (e, t) => r({ id: e }, t) : null,
		delete: i
	};
}
function c(e) {
	return Array.isArray(e?.records) ? e.records : (console.warn("[template] context.records is not an array."), []);
}
var l = {
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
function u(e) {
	let t = e.name ?? e.fieldName ?? e.key ?? e.field, n = String(e.type ?? e.controlType ?? e.fieldType ?? "text").toLowerCase(), r = l[n] || "text", i = (e.options ?? e.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
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
function d(e) {
	let t = e?.metadata ?? e ?? {}, n = t.fields ?? t.columns ?? e?.fields ?? [];
	return {
		screenId: t.screenId ?? t.screenKey ?? t.screenName ?? t.entityName ?? t.id ?? "screen",
		title: t.title ?? t.screenTitle ?? t.screenName ?? t.displayName ?? t.entityName ?? "",
		fields: n.map(u).filter((e) => e.name).sort((e, t) => e.displayOrder - t.displayOrder)
	};
}
function f(t) {
	let n = t?.metadata ?? {}, r = t?.permissions ?? n.permissions ?? t?.runtime?.permissions ?? t?.allowedActions ?? n.allowedActions ?? null;
	if (r && !Array.isArray(r) && typeof r == "object") {
		let e = r.allowedActions ?? r.AllowedActions ?? r.actions ?? r.permissions;
		Array.isArray(e) && (r = e);
	}
	if (!r || typeof r != "object") return console.warn("[template] No permissions found. Actions disabled."), { ...e };
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
function p(e) {
	return {
		records: c(e),
		actions: s(e),
		toast: typeof e?.toast == "function" ? e.toast : () => {}
	};
}
function m(t, n) {
	let r = null;
	return {
		contractVersion: 1,
		supportedScreenTypes: n,
		render(n) {
			r?.destroy && r.destroy();
			let i = document.createElement("div");
			i.className = "vc-host";
			let a = d(n), o = p(n), s = n?.readOnly === !0 ? { ...e } : f(n), c = {
				create: s.create && !!o.actions.create,
				edit: s.edit && !!o.actions.update,
				delete: s.delete && !!o.actions.delete
			};
			return s.create && !o.actions.create && console.warn("[template] Core create/save action missing."), s.edit && !o.actions.update && console.warn("[template] Core update/save action missing."), s.delete && !o.actions.delete && console.warn("[template] Core delete action missing."), r = t(i, {
				metadata: {
					...a,
					permissions: c
				},
				platform: o
			}), i;
		},
		destroy() {
			r?.destroy && r.destroy(), r = null;
		}
	};
}
//#endregion
//#region src/crud-inline.js
function h(s, { metadata: c, platform: l }) {
	let u = c.permissions || e, d = o(c), f = l.actions || {}, p = t("tbody", ""), m = t("p", n.empty, { textContent: "No records yet." }), h = t("table", n.table, {}, t("thead", "", {}, t("tr", "", {}, ...d.map((e) => t("th", "", { textContent: e.label })), t("th", "", { textContent: "Actions" }))), p), g = t("header", n.header, {}, t("h2", n.title, { textContent: c.title }), ...u.create ? [r("primary", "Add", () => {
		f.openForm?.(null);
	})] : []), _ = t("section", n.screenCard, {}, g, t("div", n.tableWrap, {}, h), m);
	function v(e) {
		let o = i(e), s = [];
		return u.edit && s.push(r("secondary", "Edit", () => {
			f.openForm?.(e);
		}, { compact: !0 })), u.delete && s.push(r("danger", "Delete", () => {
			f.deleteRecord?.(o);
		}, { compact: !0 })), t("tr", "", {}, ...d.map((n) => t("td", "", { textContent: a(e, n.name) ?? "" })), t("td", n.actions, {}, ...s));
	}
	function y() {
		let e = Array.isArray(l.records) ? l.records : [];
		p.replaceChildren(...e.map((e) => v(e)));
		let t = e.length > 0;
		h.hidden = !t, m.hidden = t;
	}
	return s.replaceChildren(_), y(), { destroy() {
		s.replaceChildren();
	} };
}
var g = m(h, ["CRUD-INLINE"]);
//#endregion
export { g as default };
