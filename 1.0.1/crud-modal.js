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
var o = {
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
function s(e) {
	let t = e.name ?? e.fieldName ?? e.key ?? e.field, n = o[String(e.type ?? e.fieldType ?? "text").toLowerCase()] ?? "text", r = (e.options ?? e.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
	return {
		name: t,
		label: e.label ?? e.displayName ?? e.title ?? t,
		type: n,
		required: !!(e.required ?? e.isRequired),
		options: r
	};
}
function c(e) {
	let t = e?.metadata ?? e ?? {}, n = t.fields ?? t.columns ?? e?.fields ?? [];
	return {
		screenId: t.screenId ?? t.screenKey ?? t.screenName ?? t.id ?? "screen",
		title: t.title ?? t.screenTitle ?? t.screenName ?? "",
		fields: n.map(s).filter((e) => e.name)
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
				metadata: c(t),
				runtime: l(t)
			}), r;
		},
		destroy() {
			n?.destroy(), n = null;
		}
	};
}
//#endregion
//#region src/crud-modal.js
function d(e, { metadata: n, runtime: o }) {
	let s = r(n, o), c = null, l = i(n, {
		onAdd: () => p(null),
		onEdit: p,
		onDelete: (e) => {
			s.remove(e) && l.render(s.rows);
		}
	}), u = t("h3", "dialog-title"), d = a(n, {
		onSubmit: (e) => {
			s.save(c, e), l.render(s.rows), f.close();
		},
		onCancel: () => f.close()
	}), f = t("dialog", "dialog", {}, u, d.form);
	f.onclose = () => {
		c = null;
	};
	function p(e) {
		c = e ? e.id : null, u.textContent = e ? "Edit record" : "New record", d.fill(e), f.showModal(), d.focus();
	}
	return e.replaceChildren(l.main, f), l.render(s.rows), { destroy: () => {
		f.open && f.close(), e.replaceChildren();
	} };
}
var f = u(d, ["CRUD-MODAL"]);
//#endregion
export { f as default };
