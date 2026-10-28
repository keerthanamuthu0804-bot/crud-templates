//#region src/common.js
var e = {
	create: !1,
	edit: !1,
	delete: !1
}, t = {
	panelTitle: "panel-title",
	panel: "side-panel",
	split: "screen-split"
}, n = {
	list: (e) => JSON.parse(localStorage.getItem(e) || "[]"),
	save: (e, t) => localStorage.setItem(e, JSON.stringify(t))
}, r = (e, t, n = {}, ...r) => {
	let i = document.createElement(e);
	return i.className = "vc-" + t, Object.assign(i, n), i.append(...r), i;
}, i = (e, t = "") => {
	let n;
	return n = e.type === "select" ? r("select", "input", {}, r("option", "option", {
		value: "",
		textContent: "Select"
	}), ...e.options.map((e) => r("option", "option", {
		value: e,
		textContent: e
	}))) : e.type === "textarea" ? r("textarea", "input", { rows: 3 }) : r("input", "input", { type: e.type || "text" }), n.required = !!e.required, n.name = e.name, n.value = t, n;
};
function a(e, t = {}) {
	let r = t.storage || n, i = t.toast || ((e) => console.log(e)), a = `crud:${e.screenId}`, o = r.list(a), s = (e) => {
		o = e, r.save(a, o);
	};
	return {
		get rows() {
			return o;
		},
		toast: i,
		save(e, t) {
			return s(e == null ? [...o, {
				id: Date.now(),
				...t
			}] : o.map((n) => n.id === e ? {
				...n,
				...t
			} : n)), i("Saved"), !0;
		},
		remove(e) {
			return confirm("Delete this record?") ? (s(o.filter((t) => t.id !== e)), i("Deleted"), !0) : !1;
		}
	};
}
function o(t, { onAdd: n, onEdit: i, onDelete: a }) {
	let o = t.permissions || e, s = r("button", "btn", {
		type: "button",
		textContent: "Add",
		onclick: n
	}), c = r("tbody", "tbody"), l = r("p", "empty", { textContent: "No records yet." }), u = r("table", "table", {}, r("thead", "thead", {}, r("tr", "tr", {}, ...t.fields.map((e) => r("th", "th", { textContent: e.label })), r("th", "th"))), c), d = r("header", "header", {}, r("h2", "title", { textContent: t.title }), ...o.create ? [s] : []);
	return d.style.display = "flex", d.style.justifyContent = "space-between", {
		main: r("section", "main", {}, d, u, l),
		render: (e) => {
			c.replaceChildren(...e.map((e) => r("tr", "tr", {}, ...t.fields.map((t) => r("td", "td", { textContent: e[t.name] ?? "" })), r("td", "td", {}, ...o.edit ? [r("button", "btn-link", {
				type: "button",
				textContent: "Edit",
				onclick: () => i(e)
			})] : [], ...o.delete ? [r("button", "btn-danger", {
				type: "button",
				textContent: "Delete",
				onclick: () => a(e.id)
			})] : [])))), l.hidden = e.length > 0, u.hidden = e.length === 0;
		}
	};
}
function s(e, { onSubmit: t, onCancel: n }) {
	let a = {}, o = r("form", "form");
	return o.style.display = "flex", o.style.flexDirection = "column", e.fields.forEach((e) => {
		let t = i(e);
		a[e.name] = t, o.append(r("label", "field", {}, r("span", "label", { textContent: e.label + (e.required ? " *" : "") }), t));
	}), o.append(r("div", "actions", {}, r("button", "btn", {
		type: "submit",
		textContent: "Save"
	}), r("button", "btn-secondary", {
		type: "button",
		textContent: "Cancel",
		onclick: n
	}))), o.onsubmit = (n) => {
		n.preventDefault(), t(Object.fromEntries(e.fields.map((e) => [e.name, a[e.name].value])));
	}, {
		form: o,
		fill: (t) => e.fields.forEach((e) => a[e.name].value = t ? t[e.name] ?? "" : ""),
		focus: () => a[e.fields[0].name]?.focus()
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
	if (!r || typeof r != "object") return console.warn("[crud template] permissions kidaikkala, Add/Edit/Delete hide aagudhu."), { ...e };
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
//#region src/crud-side-panel.js
function m(e, { metadata: n, runtime: i }) {
	let c = a(n, i), l = null, u = o(n, {
		onAdd: () => h(null),
		onEdit: h,
		onDelete: async (e) => {
			c.remove(e) && (u.render(c.rows), e === l && g());
		}
	}), d = r("h3", t.panelTitle), f = s(n, {
		onSubmit: async (e) => {
			await c.save(l, e) && (u.render(c.rows), g());
		},
		onCancel: () => g()
	}), p = r("aside", t.panel, { hidden: !0 }, d, f.form), m = r("div", t.split, {}, u.main, p);
	function h(e) {
		l = e ? e.id : null, d.textContent = e ? "Edit record" : "New record", f.fill(e), p.hidden = !1, f.focus();
	}
	function g() {
		p.hidden = !0, l = null;
	}
	return e.replaceChildren(m), u.render(c.rows), { destroy: () => e.replaceChildren() };
}
var h = p(m, ["CRUD-SIDE-PANEL"]);
//#endregion
export { h as default };
