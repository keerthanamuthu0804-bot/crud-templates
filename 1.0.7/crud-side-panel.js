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
}, a = (e, t = "") => {
	let i;
	return i = e.type === "select" ? n("select", r.control, {}, n("option", "", {
		value: "",
		textContent: "Select"
	}), ...e.options.map((e) => n("option", "", {
		value: e,
		textContent: e
	}))) : e.type === "textarea" ? n("textarea", r.control, { rows: 3 }) : n("input", r.control, { type: e.type || "text" }), i.required = !!e.required, i.name = e.name, i.value = t, i;
};
function o(e, t) {
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
function s(e) {
	return Array.isArray(e?.records) ? e.records : (console.warn("[template] context.records is not an array; showing no rows."), []);
}
function c(e) {
	return {
		create: o(e, [
			"create",
			"onCreate",
			"createRecord",
			"addRecord"
		]),
		update: o(e, [
			"update",
			"onUpdate",
			"updateRecord"
		]),
		delete: o(e, [
			"delete",
			"remove",
			"onDelete",
			"deleteRecord"
		])
	};
}
var l = (e) => o(e, [
	"refresh",
	"reload",
	"refetch",
	"onRefresh"
]), u = (e) => o(e, [
	"toast",
	"notify",
	"showToast"
]) || ((e) => console.log(e)), d = (e) => o(e, [
	"validate",
	"onValidate",
	"validateRecord"
]);
async function f(e, n, r) {
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
function p(e, n = {}) {
	let r = n.toast || ((e) => console.log(e)), i = n.actions || {}, a = Array.isArray(n.records) ? [...n.records] : [], o = {}, s = !1, c = async (e) => {
		if (typeof n.refresh == "function") try {
			let e = await n.refresh();
			if (Array.isArray(e)) {
				a = e;
				return;
			}
		} catch (e) {
			console.warn("[template] refresh failed", e);
		}
		a = e(a);
	};
	return {
		get rows() {
			return a;
		},
		get errors() {
			return o;
		},
		toast: r,
		destroy() {
			s = !0;
		},
		async save(e, a) {
			let l = e == null, u = l ? i.create : i.update;
			if (!u) return console.warn(`[template] platform ${l ? "create" : "update"} action not provided.`), r("Save is not available"), !1;
			if (o = await f(n.validate, a, e), s) return !1;
			if (Object.keys(o).length) return r(Object.values(o)[0]), !1;
			try {
				let n = l ? await u(a) : await u(e, a);
				if (s) return !0;
				let i = t(n) ? n : {};
				return await c((t) => l ? [...t, {
					...a,
					...i
				}] : t.map((t) => t.id === e ? {
					...t,
					...a,
					...i
				} : t)), s || r("Saved"), !0;
			} catch (e) {
				return console.error("[template] save failed", e), o = { _form: e?.message || "Save failed" }, s || r(o._form), !1;
			}
		},
		async remove(e) {
			if (!i.delete) return console.warn("[template] platform delete action not provided."), r("Delete is not available"), !1;
			if (!confirm("Delete this record?")) return !1;
			try {
				return await i.delete(e), s || (await c((t) => t.filter((t) => t.id !== e)), s) || r("Deleted"), !0;
			} catch (e) {
				return console.error("[template] delete failed", e), s || r(e?.message || "Delete failed"), !1;
			}
		}
	};
}
function m(t, { onAdd: a, onEdit: o, onDelete: s }) {
	let c = t.permissions || e, l = n("tbody", ""), u = n("p", r.empty, { textContent: "No records yet." }), d = n("table", r.table, {}, n("thead", "", {}, n("tr", "", {}, ...t.fields.map((e) => n("th", "", { textContent: e.label })), n("th", "", { textContent: "Actions" }))), l), f = n("header", r.header, {}, n("h2", r.title, { textContent: t.title }), ...c.create ? [i("primary", "Add", a)] : []);
	return {
		main: n("section", r.screenCard, {}, f, n("div", r.tableWrap, {}, d), u),
		render: (e) => {
			l.replaceChildren(...e.map((e) => n("tr", "", {}, ...t.fields.map((t) => n("td", "", { textContent: e[t.name] ?? "" })), n("td", r.actions, {}, ...c.edit ? [i("secondary", "Edit", () => o(e), { compact: !0 })] : [], ...c.delete ? [i("danger", "Delete", () => s(e.id), { compact: !0 })] : [])))), u.hidden = e.length > 0, d.hidden = e.length === 0;
		}
	};
}
function h(e, { onSubmit: t, onCancel: o }) {
	let s = {}, c = n("form", r.form);
	e.fields.forEach((e) => {
		let t = a(e);
		s[e.name] = t, t.addEventListener("input", () => t.setCustomValidity("")), c.append(n("div", r.field, {}, n("label", r.label, { textContent: e.label + (e.required ? " *" : "") }), t));
	});
	let l = n("p", r.formError, { hidden: !0 }), u = i("primary", "Save", null, { type: "submit" });
	c.append(l, n("div", r.formActions, {}, u, i("secondary", "Cancel", o)));
	let d = () => {
		l.hidden = !0, l.textContent = "", Object.values(s).forEach((e) => e.setCustomValidity(""));
	};
	return c.onsubmit = async (n) => {
		if (n.preventDefault(), !u.disabled) {
			u.disabled = !0;
			try {
				await t(Object.fromEntries(e.fields.map((e) => [e.name, s[e.name].value])));
			} finally {
				u.disabled = !1;
			}
		}
	}, {
		form: c,
		fill: (t) => {
			d(), e.fields.forEach((e) => s[e.name].value = t ? t[e.name] ?? "" : "");
		},
		focus: () => s[e.fields[0]?.name]?.focus(),
		showErrors(t = {}) {
			d(), t._form && (l.textContent = t._form, l.hidden = !1);
			let n = null;
			e.fields.forEach((e) => {
				let r = t[e.name];
				r && (s[e.name].setCustomValidity(r), n ??= s[e.name]);
			}), n?.reportValidity();
		}
	};
}
var g = {
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
function _(e) {
	let t = e.name ?? e.fieldName ?? e.key ?? e.field, n = g[String(e.type ?? e.fieldType ?? "text").toLowerCase()] ?? "text", r = (e.options ?? e.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
	return {
		name: t,
		label: e.label ?? e.displayName ?? e.title ?? t,
		type: n,
		required: !!(e.required ?? e.isRequired),
		options: r
	};
}
function v(e) {
	let t = e?.metadata ?? e ?? {}, n = t.fields ?? t.columns ?? e?.fields ?? [];
	return {
		screenId: t.screenId ?? t.screenKey ?? t.screenName ?? t.id ?? "screen",
		title: t.title ?? t.screenTitle ?? t.screenName ?? "",
		fields: n.map(_).filter((e) => e.name)
	};
}
function y(t) {
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
function b(e) {
	return {
		records: s(e),
		actions: c(e),
		refresh: l(e),
		toast: u(e),
		validate: d(e)
	};
}
function x(e, t) {
	let n = null;
	return {
		contractVersion: 1,
		supportedScreenTypes: t,
		render(t) {
			n?.destroy();
			let r = document.createElement("div");
			r.className = "vc-host";
			let i = b(t), a = y(t), o = {
				create: a.create && !!i.actions.create,
				edit: a.edit && !!i.actions.update,
				delete: a.delete && !!i.actions.delete
			};
			return a.create && !i.actions.create && console.warn("[template] create allowed but no platform create action."), a.edit && !i.actions.update && console.warn("[template] edit allowed but no platform update action."), a.delete && !i.actions.delete && console.warn("[template] delete allowed but no platform delete action."), n = e(r, {
				metadata: {
					...v(t),
					permissions: o
				},
				platform: i
			}), r;
		},
		destroy() {
			n?.destroy(), n = null;
		}
	};
}
//#endregion
//#region src/crud-side-panel.js
function S(e, { metadata: t, platform: i }) {
	let a = p(t, i), o = null, s = m(t, {
		onAdd: () => f(null),
		onEdit: f,
		onDelete: async (e) => {
			await a.remove(e) && (s.render(a.rows), e === o && g());
		}
	}), c = n("h3", r.panelTitle), l = h(t, {
		onSubmit: async (e) => {
			await a.save(o, e) ? (s.render(a.rows), g()) : l.showErrors(a.errors);
		},
		onCancel: () => g()
	}), u = n("aside", r.panel, { hidden: !0 }, c, l.form), d = n("div", r.split, {}, s.main, u);
	function f(e) {
		o = e ? e.id : null, c.textContent = e ? "Edit record" : "New record", l.fill(e), u.hidden = !1, l.focus();
	}
	function g() {
		u.hidden = !0, o = null;
	}
	return e.replaceChildren(d), s.render(a.rows), { destroy: () => {
		a.destroy(), e.replaceChildren();
	} };
}
var C = x(S, ["CRUD-SIDE-PANEL"]);
//#endregion
export { C as default };
