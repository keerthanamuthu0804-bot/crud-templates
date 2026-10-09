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
function i(e, { onAdd: n, onEdit: r, onDelete: i }) {
	let a = t("button", "btn", {
		type: "button",
		textContent: "Add",
		onclick: n
	}), o = t("tbody", "tbody"), s = t("p", "empty", { textContent: "No records yet." }), c = t("table", "table", {}, t("thead", "thead", {}, t("tr", "tr", {}, ...e.fields.map((e) => t("th", "th", { textContent: e.label })), t("th", "th"))), o), l = t("header", "header", {}, t("h2", "title", { textContent: e.title }), a);
	return l.style.display = "flex", l.style.justifyContent = "space-between", {
		main: t("section", "main", {}, l, c, s),
		render: (n) => {
			o.replaceChildren(...n.map((n) => t("tr", "tr", {}, ...e.fields.map((e) => t("td", "td", { textContent: n[e.name] ?? "" })), t("td", "td", {}, t("button", "btn-link", {
				type: "button",
				textContent: "Edit",
				onclick: () => r(n)
			}), t("button", "btn-danger", {
				type: "button",
				textContent: "Delete",
				onclick: () => i(n.id)
			}))))), s.hidden = n.length > 0, c.hidden = n.length === 0;
		}
	};
}
function a(e, { onSubmit: r, onCancel: i }) {
	let a = {}, o = t("form", "form");
	return o.style.display = "flex", o.style.flexDirection = "column", e.fields.forEach((e) => {
		let r = n(e);
		a[e.name] = r, o.append(t("label", "field", {}, t("span", "label", { textContent: e.label + (e.required ? " *" : "") }), r));
	}), o.append(t("div", "actions", {}, t("button", "btn", {
		type: "submit",
		textContent: "Save"
	}), t("button", "btn-secondary", {
		type: "button",
		textContent: "Cancel",
		onclick: i
	}))), o.onsubmit = (t) => {
		t.preventDefault(), r(Object.fromEntries(e.fields.map((e) => [e.name, a[e.name].value])));
	}, {
		form: o,
		fill: (t) => e.fields.forEach((e) => a[e.name].value = t ? t[e.name] ?? "" : ""),
		focus: () => a[e.fields[0].name].focus()
	};
}
//#endregion
//#region src/crud-side-panel.js
function o(e, { metadata: n, runtime: o }) {
	let s = r(n, o), c = null, l = i(n, {
		onAdd: () => m(null),
		onEdit: m,
		onDelete: (e) => {
			s.remove(e) && l.render(s.rows);
		}
	}), u = t("h3", "panel-title"), d = a(n, {
		onSubmit: (e) => {
			s.save(c, e), l.render(s.rows), h();
		},
		onCancel: h
	}), f = t("aside", "panel", { hidden: !0 }, u, d.form), p = t("div", "root", {}, l.main, f);
	p.style.display = "flex", p.style.alignItems = "flex-start", l.main.style.flex = "1", f.style.width = "340px";
	function m(e) {
		c = e ? e.id : null, u.textContent = e ? "Edit record" : "New record", d.fill(e), f.hidden = !1, d.focus();
	}
	function h() {
		f.hidden = !0, c = null;
	}
	return e.replaceChildren(p), l.render(s.rows), { destroy: () => e.replaceChildren() };
}
//#endregion
export { o as default };
