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
var o = (e) => (e?.fields || []).filter((e) => e.showInGrid !== !1), s = (e) => (e?.fields || []).filter((e) => e.showInForm !== !1 && !e.autoNumber), c = (e, t) => t == null ? "" : e.type === "date" && /^\d{4}-\d{2}-\d{2}T/.test(String(t)) ? String(t).slice(0, 10) : t, l = (e, r = "") => {
	let i;
	return i = e.type === "select" ? t("select", n.control, {}, t("option", "", {
		value: "",
		textContent: "Select"
	}), ...(e.options || []).map((e) => t("option", "", {
		value: e,
		textContent: e
	}))) : e.type === "textarea" ? t("textarea", n.control, { rows: 3 }) : t("input", n.control, { type: e.type || "text" }), i.required = !!e.required, i.name = e.name, e.maxLength && e.type !== "select" && (i.maxLength = e.maxLength), e.readOnly && (i.disabled = !0), i.value = c(e, r), i;
};
function u(e, { onAdd: s, onEdit: c, onDelete: l } = {}) {
	let u = o(e), d = t("table", n.table), f = t("thead"), p = t("tr");
	u.forEach((e) => {
		p.append(t("th", "", { textContent: e.label || e.name }));
	}), p.append(t("th", "", { textContent: "Actions" })), f.append(p);
	let m = t("tbody");
	d.append(f, m);
	let h = t("div", n.tableWrap, {}, d), g = r("primary", "Add", () => s?.()), _ = t("div", n.header, {}, t("h2", n.title, { textContent: e.title || "Records" }), g), v = t("div", n.screenCard, {}, _, h);
	function y(e = []) {
		if (m.replaceChildren(), !Array.isArray(e) || e.length === 0) {
			let e = t("tr"), r = t("td", n.empty, { textContent: "No records found" });
			r.colSpan = u.length + 1, e.append(r), m.append(e);
		} else e.forEach((e) => {
			let o = t("tr");
			u.forEach((n) => {
				let r = a(e, n.name);
				o.append(t("td", "", { textContent: r == null ? "" : String(r) }));
			});
			let s = t("td", n.actions), d = r("secondary", "Edit", () => c?.(e), { compact: !0 }), f = r("danger", "Delete", () => l?.(i(e)), { compact: !0 });
			s.append(d, f), o.append(s), m.append(o);
		});
	}
	return {
		main: v,
		render: y
	};
}
function d(e, { onSubmit: i, onCancel: o } = {}) {
	let u = s(e), d = {}, f = t("form", n.form);
	u.forEach((e) => {
		let r = t("label", n.label, { textContent: e.label || e.name }), i = l(e);
		d[e.name] = i;
		let a = t("div", n.field, {}, r, i);
		f.append(a);
	});
	let p = r("primary", "Save", null, { type: "submit" }), m = r("secondary", "Cancel", () => o?.()), h = t("div", n.formActions, {}, p, m);
	f.append(h), f.addEventListener("submit", async (e) => {
		e.preventDefault();
		let t = {};
		u.forEach((e) => {
			let n = d[e.name];
			n && (t[e.name] = n.value);
		}), typeof i == "function" && await i(t);
	});
	function g(e = null) {
		u.forEach((t) => {
			let n = d[t.name];
			n && (n.value = c(t, e ? a(e, t.name) : ""));
		});
	}
	function _() {
		let e = u.find((e) => !e.readOnly);
		e && d[e.name] && d[e.name].focus();
	}
	return {
		form: f,
		fill: g,
		focus: _
	};
}
function f(e) {
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
function p(e) {
	return Array.isArray(e?.records) ? e.records : (console.warn("[template] context.records is not an array."), []);
}
var m = {
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
function h(e) {
	let t = e.name ?? e.fieldName ?? e.key ?? e.field, n = String(e.type ?? e.controlType ?? e.fieldType ?? "text").toLowerCase(), r = m[n] || "text", i = (e.options ?? e.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
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
function g(e) {
	let t = e?.metadata ?? e ?? {}, n = t.fields ?? t.columns ?? e?.fields ?? [];
	return {
		screenId: t.screenId ?? t.screenKey ?? t.screenName ?? t.entityName ?? t.id ?? "screen",
		title: t.title ?? t.screenTitle ?? t.screenName ?? t.displayName ?? t.entityName ?? "",
		fields: n.map(h).filter((e) => e.name).sort((e, t) => e.displayOrder - t.displayOrder)
	};
}
function _(t) {
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
function v(e) {
	return {
		records: p(e),
		actions: f(e),
		toast: typeof e?.toast == "function" ? e.toast : () => {}
	};
}
function y(t, n) {
	let r = null;
	return {
		contractVersion: 1,
		supportedScreenTypes: n,
		render(n) {
			r?.destroy && r.destroy();
			let i = document.createElement("div");
			i.className = "vc-host";
			let a = g(n), o = v(n), s = n?.readOnly === !0 ? { ...e } : _(n), c = {
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
//#region src/crud-modal.js
function b(e, { metadata: r, platform: a }) {
	let o = null, s = a.actions || {}, c = a.toast || (() => {}), l = u(r, {
		onAdd: () => h(null),
		onEdit: (e) => h(e),
		onDelete: async (e) => {
			if (typeof s.delete != "function") c("Delete is not available");
			else try {
				await s.delete(e);
			} catch (e) {
				console.error("[crud-modal] Delete action failed:", e);
			}
		}
	}), f = t("h3", n.dialogTitle, { textContent: "New record" }), p = d(r, {
		onSubmit: async (e) => {
			let t = o == null ? s.create : s.update;
			if (typeof t != "function") c("Save is not available");
			else try {
				o == null ? await t(e) : await t(o, e);
			} catch (e) {
				console.error("[crud-modal] Save action failed:", e);
			}
		},
		onCancel: () => g()
	}), m = t("dialog", n.dialog, {}, f, p.form);
	m.onclose = () => {
		o = null;
	};
	function h(e = null) {
		o = e ? i(e) : null, f.textContent = e ? "Edit record" : "New record", p.fill(e), m.open || m.showModal(), p.focus();
	}
	function g() {
		m.open && m.close();
	}
	return e.replaceChildren(l.main, m), l.render(a.records || []), { destroy() {
		m.open && m.close(), e.replaceChildren();
	} };
}
var x = y(b, ["CRUD-MODAL"]);
//#endregion
export { x as default };
