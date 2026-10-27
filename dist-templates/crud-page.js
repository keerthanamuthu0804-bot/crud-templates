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
}, r = (e, r, i, { compact: a = !1, type: o = "button" } = {}) => {
	let s = {
		type: o,
		textContent: r
	};
	return typeof i == "function" && (s.onclick = i), t("button", (n.btn[e] || n.btn.secondary) + (a ? " compact-button" : ""), s);
}, i = (e, r = "") => {
	let i;
	return i = e.type === "select" ? t("select", n.control, {}, t("option", "", {
		value: "",
		textContent: "Select"
	}), ...e.options.map((e) => t("option", "", {
		value: e,
		textContent: e
	}))) : e.type === "textarea" ? t("textarea", n.control, { rows: 3 }) : t("input", n.control, { type: e.type || "text" }), i.required = !!e.required, i.name = e.name, i.value = r, i;
};
function a(e, t = {}) {
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
function o(i, { onAdd: a, onEdit: o, onDelete: s }) {
	let c = i.permissions || e, l = t("tbody", ""), u = t("p", n.empty, { textContent: "No records yet." }), d = t("table", n.table, {}, t("thead", "", {}, t("tr", "", {}, ...i.fields.map((e) => t("th", "", { textContent: e.label })), t("th", "", { textContent: "Actions" }))), l), f = t("header", n.header, {}, t("h2", n.title, { textContent: i.title }), ...c.create ? [r("primary", "Add", a)] : []);
	return {
		main: t("section", n.screenCard, {}, f, t("div", n.tableWrap, {}, d), u),
		render: (e) => {
			l.replaceChildren(...e.map((e) => t("tr", "", {}, ...i.fields.map((n) => t("td", "", { textContent: e[n.name] ?? "" })), t("td", n.actions, {}, ...c.edit ? [r("secondary", "Edit", () => o(e), { compact: !0 })] : [], ...c.delete ? [r("danger", "Delete", () => s(e.id), { compact: !0 })] : [])))), u.hidden = e.length > 0, d.hidden = e.length === 0;
		}
	};
}
function s(e, { onSubmit: a, onCancel: o }) {
	let s = {}, c = t("form", n.form);
	return e.fields.forEach((e) => {
		let r = i(e);
		s[e.name] = r, c.append(t("div", n.field, {}, t("label", n.label, { textContent: e.label + (e.required ? " *" : "") }), r));
	}), c.append(t("div", n.formActions, {}, r("primary", "Save", null, { type: "submit" }), r("secondary", "Cancel", o))), c.onsubmit = (t) => {
		t.preventDefault(), a(Object.fromEntries(e.fields.map((e) => [e.name, s[e.name].value])));
	}, {
		form: c,
		fill: (t) => e.fields.forEach((e) => s[e.name].value = t ? t[e.name] ?? "" : ""),
		focus: () => s[e.fields[0].name].focus()
	};
}
var c = {
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
function l(e) {
	let t = e.name ?? e.fieldName ?? e.key ?? e.field, n = c[String(e.type ?? e.fieldType ?? "text").toLowerCase()] ?? "text", r = (e.options ?? e.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
	return {
		name: t,
		label: e.label ?? e.displayName ?? e.title ?? t,
		type: n,
		required: !!(e.required ?? e.isRequired),
		options: r
	};
}
function u(e) {
	let t = e?.metadata ?? e ?? {}, n = t.fields ?? t.columns ?? e?.fields ?? [];
	return {
		screenId: t.screenId ?? t.screenKey ?? t.screenName ?? t.id ?? "screen",
		title: t.title ?? t.screenTitle ?? t.screenName ?? "",
		fields: n.map(l).filter((e) => e.name)
	};
}
function d(t) {
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
function f(e) {
	let t = e?.runtime ?? {}, n = {};
	return typeof t.storage?.list == "function" && typeof t.storage?.save == "function" && (n.storage = t.storage), typeof t.toast == "function" && (n.toast = t.toast), n;
}
function p(e, t) {
	let n = null;
	return {
		contractVersion: 1,
		supportedScreenTypes: t,
		render(t) {
			n?.destroy();
			let r = document.createElement("div");
			return r.className = "vc-host", n = e(r, {
				metadata: {
					...u(t),
					permissions: d(t)
				},
				runtime: f(t)
			}), r;
		},
		destroy() {
			n?.destroy(), n = null;
		}
	};
}
//#endregion
//#region src/crud-page.js
function m(e, { metadata: n, runtime: r }) {
	let i = a(n, r), c = null, l = o(n, {
		onAdd: () => p(null),
		onEdit: p,
		onDelete: (e) => {
			i.remove(e) && l.render(i.rows);
		}
	}), u = t("h2", "title"), d = s(n, {
		onSubmit: (e) => {
			i.save(c, e), l.render(i.rows), m();
		},
		onCancel: m
	}), f = t("section", "form-page", { hidden: !0 }, t("button", "btn-link", {
		type: "button",
		textContent: "Back to list",
		onclick: m
	}), u, d.form);
	function p(e) {
		c = e ? e.id : null, u.textContent = e ? "Edit record" : "New record", d.fill(e), l.main.hidden = !0, f.hidden = !1, d.focus();
	}
	function m() {
		c = null, f.hidden = !0, l.main.hidden = !1;
	}
	return e.replaceChildren(l.main, f), l.render(i.rows), { destroy: () => e.replaceChildren() };
}
var h = p(m, ["CRUD-PAGE"]);
//#endregion
export { h as default };
