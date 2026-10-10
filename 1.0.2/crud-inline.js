//#region src/common.js
var e = {
	create: !1,
	edit: !1,
	delete: !1
}, t = {
	list: (e) => JSON.parse(localStorage.getItem(e) || "[]"),
	save: (e, t) => localStorage.setItem(e, JSON.stringify(t))
}, n = (e, t, n = {}, ...r) => {
	let i = document.createElement(e);
	return i.className = "vc-" + t, Object.assign(i, n), i.append(...r), i;
}, r = (e, t = "") => {
	let r;
	return r = e.type === "select" ? n("select", "input", {}, n("option", "option", {
		value: "",
		textContent: "Select"
	}), ...e.options.map((e) => n("option", "option", {
		value: e,
		textContent: e
	}))) : e.type === "textarea" ? n("textarea", "input", { rows: 3 }) : n("input", "input", { type: e.type || "text" }), r.required = !!e.required, r.name = e.name, r.value = t, r;
};
function i(e, n = {}) {
	let r = n.storage || t, i = n.toast || ((e) => console.log(e)), a = `crud:${e.screenId}`, o = r.list(a), s = (e) => {
		o = e, r.save(a, o);
	};
	return {
		get rows() {
			return o;
		},
		toast: i,
		save(e, t) {
			s(e == null ? [...o, {
				id: Date.now(),
				...t
			}] : o.map((n) => n.id === e ? {
				...n,
				...t
			} : n)), i("Saved");
		},
		remove(e) {
			return confirm("Delete this record?") ? (s(o.filter((t) => t.id !== e)), i("Deleted"), !0) : !1;
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
	let n = t?.permissions ?? t?.metadata?.permissions ?? t?.runtime?.permissions ?? null;
	if (!n || typeof n != "object") return console.warn("[crud template] permissions kidaikkala, Add/Edit/Delete hide aagudhu."), { ...e };
	let r = {};
	Array.isArray(n) ? n.forEach((e) => r[String(e).toLowerCase()] = !0) : Object.entries(n).forEach(([e, t]) => {
		typeof t == "boolean" && (r[e.toLowerCase()] = t);
	});
	let i = (e) => e.some((e) => r[e] === !0);
	return {
		create: i([
			"cancreate",
			"create",
			"canadd",
			"add",
			"insert"
		]),
		edit: i([
			"canedit",
			"edit",
			"canupdate",
			"update",
			"modify"
		]),
		delete: i([
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
function d(t, { metadata: a, runtime: o }) {
	let s = i(a, o), c = a.permissions || e, l = null, u = (e, t, r) => n("button", e, {
		type: "button",
		textContent: t,
		onclick: r
	}), d = n("tbody", "tbody"), f = n("p", "empty", { textContent: "No records yet." }), p = n("table", "table", {}, n("thead", "thead", {}, n("tr", "tr", {}, ...a.fields.map((e) => n("th", "th", { textContent: e.label })), n("th", "th"))), d), m = n("header", "header", {}, n("h2", "title", { textContent: a.title }), ...c.create ? [u("btn", "Add", () => {
		l = "new", v();
	})] : []);
	m.style.display = "flex", m.style.justifyContent = "space-between";
	let h = n("section", "main", {}, m, p, f);
	function g(e) {
		return n("tr", "tr", {}, ...a.fields.map((t) => n("td", "td", { textContent: e[t.name] ?? "" })), n("td", "td", {}, ...c.edit ? [u("btn-link", "Edit", () => {
			l = e.id, v();
		})] : [], ...c.delete ? [u("btn-danger", "Delete", () => {
			s.remove(e.id) && v();
		})] : []));
	}
	function _(e) {
		let t = a.fields.map((t) => r(t, e[t.name] ?? "")), i = () => {
			if (!t.every((e) => e.reportValidity())) return;
			let e = Object.fromEntries(a.fields.map((e, n) => [e.name, t[n].value]));
			s.save(l === "new" ? null : l, e), l = null, v();
		};
		return n("tr", "tr vc-editing", {}, ...t.map((e) => n("td", "td", {}, e)), n("td", "td", {}, u("btn", "Save", i), u("btn-secondary", "Cancel", () => {
			l = null, v();
		})));
	}
	function v() {
		d.replaceChildren(...l === "new" ? [_({})] : [], ...s.rows.map((e) => l === e.id ? _(e) : g(e)));
		let e = s.rows.length > 0 || l === "new";
		p.hidden = !e, f.hidden = e;
	}
	return t.replaceChildren(h), v(), { destroy: () => t.replaceChildren() };
}
var f = u(d, ["CRUD-INLINE"]);
//#endregion
export { f as default };
