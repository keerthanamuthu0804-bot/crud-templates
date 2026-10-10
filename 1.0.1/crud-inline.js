//#region src/common.js
var e = {
	list: (e) => JSON.parse(localStorage.getItem(e) || "[]"),
	save: (e, t) => localStorage.setItem(e, JSON.stringify(t))
}, t = (e, t, n = {}, ...r) => {
	let i = document.createElement(e);
	return i.className = "vc-" + t, Object.assign(i, n), i.append(...r), i;
}, n = (e, n = "") => {
	let r;
	return r = e.type === "select" ? t("select", "input", {}, t("option", "option", {
		value: "",
		textContent: "Select"
	}), ...e.options.map((e) => t("option", "option", {
		value: e,
		textContent: e
	}))) : e.type === "textarea" ? t("textarea", "input", { rows: 3 }) : t("input", "input", { type: e.type || "text" }), r.required = !!e.required, r.name = e.name, r.value = n, r;
};
function r(t, n = {}) {
	let r = n.storage || e, i = n.toast || ((e) => console.log(e)), a = `crud:${t.screenId}`, o = r.list(a), s = (e) => {
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
var i = {
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
function a(e) {
	let t = e.name ?? e.fieldName ?? e.key ?? e.field, n = i[String(e.type ?? e.fieldType ?? "text").toLowerCase()] ?? "text", r = (e.options ?? e.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
	return {
		name: t,
		label: e.label ?? e.displayName ?? e.title ?? t,
		type: n,
		required: !!(e.required ?? e.isRequired),
		options: r
	};
}
function o(e) {
	let t = e?.metadata ?? e ?? {}, n = t.fields ?? t.columns ?? e?.fields ?? [];
	return {
		screenId: t.screenId ?? t.screenKey ?? t.screenName ?? t.id ?? "screen",
		title: t.title ?? t.screenTitle ?? t.screenName ?? "",
		fields: n.map(a).filter((e) => e.name)
	};
}
function s(e) {
	let t = e?.runtime ?? {}, n = {};
	return typeof t.storage?.list == "function" && typeof t.storage?.save == "function" && (n.storage = t.storage), typeof t.toast == "function" && (n.toast = t.toast), n;
}
function c(e, t) {
	let n = null;
	return {
		contractVersion: 1,
		supportedScreenTypes: t,
		render(t) {
			n?.destroy();
			let r = document.createElement("div");
			return r.className = "vc-host", n = e(r, {
				metadata: o(t),
				runtime: s(t)
			}), r;
		},
		destroy() {
			n?.destroy(), n = null;
		}
	};
}
//#endregion
//#region src/crud-inline.js
function l(e, { metadata: i, runtime: a }) {
	let o = r(i, a), s = null, c = (e, n, r) => t("button", e, {
		type: "button",
		textContent: n,
		onclick: r
	}), l = t("tbody", "tbody"), u = t("p", "empty", { textContent: "No records yet." }), d = t("table", "table", {}, t("thead", "thead", {}, t("tr", "tr", {}, ...i.fields.map((e) => t("th", "th", { textContent: e.label })), t("th", "th"))), l), f = t("header", "header", {}, t("h2", "title", { textContent: i.title }), c("btn", "Add", () => {
		s = "new", g();
	}));
	f.style.display = "flex", f.style.justifyContent = "space-between";
	let p = t("section", "main", {}, f, d, u);
	function m(e) {
		return t("tr", "tr", {}, ...i.fields.map((n) => t("td", "td", { textContent: e[n.name] ?? "" })), t("td", "td", {}, c("btn-link", "Edit", () => {
			s = e.id, g();
		}), c("btn-danger", "Delete", () => {
			o.remove(e.id) && g();
		})));
	}
	function h(e) {
		let r = i.fields.map((t) => n(t, e[t.name] ?? "")), a = () => {
			if (!r.every((e) => e.reportValidity())) return;
			let e = Object.fromEntries(i.fields.map((e, t) => [e.name, r[t].value]));
			o.save(s === "new" ? null : s, e), s = null, g();
		};
		return t("tr", "tr vc-editing", {}, ...r.map((e) => t("td", "td", {}, e)), t("td", "td", {}, c("btn", "Save", a), c("btn-secondary", "Cancel", () => {
			s = null, g();
		})));
	}
	function g() {
		l.replaceChildren(...s === "new" ? [h({})] : [], ...o.rows.map((e) => s === e.id ? h(e) : m(e)));
		let e = o.rows.length > 0 || s === "new";
		d.hidden = !e, u.hidden = e;
	}
	return e.replaceChildren(p), g(), { destroy: () => e.replaceChildren() };
}
var u = c(l, ["CRUD-INLINE"]);
//#endregion
export { u as default };
