//#region src/common.js
var e = {
	create: !1,
	edit: !1,
	delete: !1
}, t = (e, t, n = {}, ...r) => {
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
	btn: {
		primary: "primary-button",
		secondary: "secondary-button",
		danger: "danger-button"
	}
}, r = (e, r = "") => {
	let i;
	return i = e.type === "select" ? t("select", n.control, {}, t("option", "", {
		value: "",
		textContent: "Select"
	}), ...e.options.map((e) => t("option", "", {
		value: e,
		textContent: e
	}))) : e.type === "textarea" ? t("textarea", n.control, { rows: 3 }) : t("input", n.control, { type: e.type || "text" }), i.required = !!e.required, i.name = e.name, i.value = r, i;
};
function i(e, t = {}) {
	let n = t.storage, r = t.toast || ((e) => console.log(e)), i = `crud:${e.screenId}`;
	n || console.warn("[crud template] runtime.storage not provided by core app; data will not be saved.");
	let a = n ? n.list(i) : [], o = (e) => {
		a = e, n?.save(i, a);
	};
	return {
		get rows() {
			return a;
		},
		toast: r,
		save(e, t) {
			o(e == null ? [...a, {
				id: Date.now(),
				...t
			}] : a.map((n) => n.id === e ? {
				...n,
				...t
			} : n)), r("Saved");
		},
		remove(e) {
			return confirm("Delete this record?") ? (o(a.filter((t) => t.id !== e)), r("Deleted"), !0) : !1;
		}
	};
}
var a = {
	string: "text",
	text: "text",
	number: "number",
	int: "number",
	integer: "number",
	decimal: "number",
	date: "date",
	datetime: "date",
	textarea: "textarea",
	select: "select",
	dropdown: "select",
	lookup: "select"
};
function o(e) {
	let t = e.name ?? e.fieldName ?? e.key ?? e.field, n = a[String(e.type ?? e.fieldType ?? "text").toLowerCase()] ?? "text", r = (e.options ?? e.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
	return {
		name: t,
		label: e.label ?? e.displayName ?? e.title ?? t,
		type: n,
		required: !!(e.required ?? e.isRequired),
		options: r
	};
}
function s(e) {
	let t = e?.metadata ?? e ?? {}, n = t.fields ?? t.columns ?? e?.fields ?? [];
	return {
		screenId: t.screenId ?? t.screenKey ?? t.screenName ?? t.id ?? "screen",
		title: t.title ?? t.screenTitle ?? t.screenName ?? "",
		fields: n.map(o).filter((e) => e.name)
	};
}
function c(t) {
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
function l(e) {
	let t = e?.runtime ?? {}, n = {};
	return typeof t.storage?.list == "function" && typeof t.storage?.save == "function" && (n.storage = t.storage), typeof t.toast == "function" && (n.toast = t.toast), n;
}
function u(e, t) {
	let n = null;
	return {
		contractVersion: 1,
		supportedScreenTypes: t,
		render(t) {
			n?.destroy();
			let r = document.createElement("div");
			return r.className = "vc-host", n = e(r, {
				metadata: {
					...s(t),
					permissions: c(t)
				},
				runtime: l(t)
			}), r;
		},
		destroy() {
			n?.destroy(), n = null;
		}
	};
}
//#endregion
//#region src/crud-inline.js
function d(n, { metadata: a, runtime: o }) {
	let s = i(a, o), c = a.permissions || e, l = null, u = (e, n, r) => t("button", e, {
		type: "button",
		textContent: n,
		onclick: r
	}), d = t("tbody", "tbody"), f = t("p", "empty", { textContent: "No records yet." }), p = t("table", "table", {}, t("thead", "thead", {}, t("tr", "tr", {}, ...a.fields.map((e) => t("th", "th", { textContent: e.label })), t("th", "th"))), d), m = t("header", "header", {}, t("h2", "title", { textContent: a.title }), ...c.create ? [u("btn", "Add", () => {
		l = "new", v();
	})] : []);
	m.style.display = "flex", m.style.justifyContent = "space-between";
	let h = t("section", "main", {}, m, p, f);
	function g(e) {
		return t("tr", "tr", {}, ...a.fields.map((n) => t("td", "td", { textContent: e[n.name] ?? "" })), t("td", "td", {}, ...c.edit ? [u("btn-link", "Edit", () => {
			l = e.id, v();
		})] : [], ...c.delete ? [u("btn-danger", "Delete", () => {
			s.remove(e.id) && v();
		})] : []));
	}
	function _(e) {
		let n = a.fields.map((t) => r(t, e[t.name] ?? "")), i = () => {
			if (!n.every((e) => e.reportValidity())) return;
			let e = Object.fromEntries(a.fields.map((e, t) => [e.name, n[t].value]));
			s.save(l === "new" ? null : l, e), l = null, v();
		};
		return t("tr", "tr vc-editing", {}, ...n.map((e) => t("td", "td", {}, e)), t("td", "td", {}, u("btn", "Save", i), u("btn-secondary", "Cancel", () => {
			l = null, v();
		})));
	}
	function v() {
		d.replaceChildren(...l === "new" ? [_({})] : [], ...s.rows.map((e) => l === e.id ? _(e) : g(e)));
		let e = s.rows.length > 0 || l === "new";
		p.hidden = !e, f.hidden = e;
	}
	return n.replaceChildren(h), v(), { destroy: () => n.replaceChildren() };
}
var f = u(d, ["CRUD-INLINE"]);
//#endregion
export { f as default };
