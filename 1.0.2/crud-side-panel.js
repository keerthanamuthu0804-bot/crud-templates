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
function a(t, { onAdd: r, onEdit: i, onDelete: a }) {
	let o = t.permissions || e, s = n("button", "btn", {
		type: "button",
		textContent: "Add",
		onclick: r
	}), c = n("tbody", "tbody"), l = n("p", "empty", { textContent: "No records yet." }), u = n("table", "table", {}, n("thead", "thead", {}, n("tr", "tr", {}, ...t.fields.map((e) => n("th", "th", { textContent: e.label })), n("th", "th"))), c), d = n("header", "header", {}, n("h2", "title", { textContent: t.title }), ...o.create ? [s] : []);
	return d.style.display = "flex", d.style.justifyContent = "space-between", {
		main: n("section", "main", {}, d, u, l),
		render: (e) => {
			c.replaceChildren(...e.map((e) => n("tr", "tr", {}, ...t.fields.map((t) => n("td", "td", { textContent: e[t.name] ?? "" })), n("td", "td", {}, ...o.edit ? [n("button", "btn-link", {
				type: "button",
				textContent: "Edit",
				onclick: () => i(e)
			})] : [], ...o.delete ? [n("button", "btn-danger", {
				type: "button",
				textContent: "Delete",
				onclick: () => a(e.id)
			})] : [])))), l.hidden = e.length > 0, u.hidden = e.length === 0;
		}
	};
}
function o(e, { onSubmit: t, onCancel: i }) {
	let a = {}, o = n("form", "form");
	return o.style.display = "flex", o.style.flexDirection = "column", e.fields.forEach((e) => {
		let t = r(e);
		a[e.name] = t, o.append(n("label", "field", {}, n("span", "label", { textContent: e.label + (e.required ? " *" : "") }), t));
	}), o.append(n("div", "actions", {}, n("button", "btn", {
		type: "submit",
		textContent: "Save"
	}), n("button", "btn-secondary", {
		type: "button",
		textContent: "Cancel",
		onclick: i
	}))), o.onsubmit = (n) => {
		n.preventDefault(), t(Object.fromEntries(e.fields.map((e) => [e.name, a[e.name].value])));
	}, {
		form: o,
		fill: (t) => e.fields.forEach((e) => a[e.name].value = t ? t[e.name] ?? "" : ""),
		focus: () => a[e.fields[0].name].focus()
	};
}
var s = {
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
function c(e) {
	let t = e.name ?? e.fieldName ?? e.key ?? e.field, n = s[String(e.type ?? e.fieldType ?? "text").toLowerCase()] ?? "text", r = (e.options ?? e.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
	return {
		name: t,
		label: e.label ?? e.displayName ?? e.title ?? t,
		type: n,
		required: !!(e.required ?? e.isRequired),
		options: r
	};
}
function l(e) {
	let t = e?.metadata ?? e ?? {}, n = t.fields ?? t.columns ?? e?.fields ?? [];
	return {
		screenId: t.screenId ?? t.screenKey ?? t.screenName ?? t.id ?? "screen",
		title: t.title ?? t.screenTitle ?? t.screenName ?? "",
		fields: n.map(c).filter((e) => e.name)
	};
}
function u(t) {
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
function d(e) {
	let t = e?.runtime ?? {}, n = {};
	return typeof t.storage?.list == "function" && typeof t.storage?.save == "function" && (n.storage = t.storage), typeof t.toast == "function" && (n.toast = t.toast), n;
}
function f(e, t) {
	let n = null;
	return {
		contractVersion: 1,
		supportedScreenTypes: t,
		render(t) {
			n?.destroy();
			let r = document.createElement("div");
			return r.className = "vc-host", n = e(r, {
				metadata: {
					...l(t),
					permissions: u(t)
				},
				runtime: d(t)
			}), r;
		},
		destroy() {
			n?.destroy(), n = null;
		}
	};
}
//#endregion
//#region src/crud-side-panel.js
function p(e, { metadata: t, runtime: r }) {
	let s = i(t, r), c = null, l = a(t, {
		onAdd: () => m(null),
		onEdit: m,
		onDelete: (e) => {
			s.remove(e) && (l.render(s.rows), e === c && h());
		}
	}), u = n("h3", "panel-title"), d = o(t, {
		onSubmit: (e) => {
			s.save(c, e), l.render(s.rows), h();
		},
		onCancel: h
	}), f = n("aside", "panel", { hidden: !0 }, u, d.form), p = n("div", "root", {}, l.main, f);
	p.style.display = "flex", p.style.alignItems = "flex-start", l.main.style.flex = "1", f.style.width = "340px";
	function m(e) {
		c = e ? e.id : null, u.textContent = e ? "Edit record" : "New record", d.fill(e), f.hidden = !1, d.focus();
	}
	function h() {
		f.hidden = !0, c = null;
	}
	return e.replaceChildren(p), l.render(s.rows), { destroy: () => e.replaceChildren() };
}
var m = f(p, ["CRUD-SIDE-PANEL"]);
//#endregion
export { m as default };
