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
//#endregion
//#region src/crud-inline.js
function i(e, { metadata: i, runtime: a }) {
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
//#endregion
export { i as default };
