//#region src/purchase-tabs.js
var e = 1, t = {
	PAGE: "PURCHASE_PAGE",
	TABS: "PURCHASE_TABS",
	TAB: "PURCHASE_TAB",
	ENTRY: "PURCHASE_ENTRY",
	LIST: "PURCHASE_LIST",
	DETAILS: "PURCHASE_DETAILS"
}, n = 0;
function r(e, t = "", n = "") {
	let r = document.createElement(e);
	return t && (r.className = t), n != null && (r.textContent = String(n)), r;
}
function i(e, t, n = !1) {
	let i = r("button", "", e);
	return i.type = "button", i.disabled = n, t && i.addEventListener("click", t), i;
}
function a(e, t) {
	return e.getChildren(t).filter((e) => e.isVisible !== !1);
}
function o(e, t, n = "") {
	return e?.properties?.[t] ?? n;
}
function s(e) {
	return e?.id ?? e?.Id ?? e?.recordId ?? e?.RecordId ?? e?.values?.id ?? e?.values?.Id ?? e?.Values?.id ?? e?.Values?.Id ?? null;
}
function c(e) {
	let t = e?.values ?? e?.Values;
	return t && typeof t == "object" && !Array.isArray(t) ? t : e && typeof e == "object" ? e : {};
}
function l(e) {
	return Array.isArray(e) ? e.map((e) => ({
		id: s(e),
		values: c(e)
	})) : [];
}
function u(e, t) {
	if (!e || !t) return;
	if (Object.prototype.hasOwnProperty.call(e, t)) return e[t];
	let n = Object.keys(e).find((e) => e.toLowerCase() === String(t).toLowerCase());
	return n ? e[n] : void 0;
}
function d(e) {
	if (e == null || e === "") return "—";
	if (typeof e == "boolean") return e ? "Yes" : "No";
	if (typeof e == "object") try {
		return JSON.stringify(e);
	} catch {
		return "";
	}
	return String(e);
}
function f(e) {
	return Array.isArray(e) ? e.filter((e) => {
		let t = e?.name ?? e?.fieldName ?? e?.field_name;
		return t && String(t).toLowerCase() !== "id";
	}).map((e) => {
		let t = String(e.name ?? e.fieldName ?? e.field_name);
		return {
			name: t,
			label: String(e.label ?? e.displayName ?? e.display_name ?? t),
			type: String(e.type ?? e.dataType ?? e.data_type ?? e.controlType ?? "text").toLowerCase(),
			required: e.required === !0 || e.isRequired === !0,
			readOnly: e.readOnly === !0 || e.isReadOnly === !0,
			showInForm: e.showInForm !== !1,
			showInGrid: e.showInGrid !== !1,
			maxLength: e.maxLength ?? null
		};
	}) : [];
}
function p(e) {
	let t = e.type;
	return /bool|checkbox/.test(t) ? "checkbox" : /datetime|timestamp/.test(t) ? "datetime-local" : /date/.test(t) ? "date" : /(int|decimal|numeric|number|float|double|money|currency)/.test(t) ? "number" : /email/.test(t) ? "email" : "text";
}
function m(e, t) {
	if (t == null) return "";
	let n = String(t);
	return e === "date" ? n.slice(0, 10) : e === "datetime-local" ? n.replace(" ", "T").slice(0, 16) : n;
}
function h(e, t, n, r, i) {
	let a = new CustomEvent("gb:template-action", {
		bubbles: !0,
		composed: !0,
		cancelable: !1,
		detail: {
			action: t,
			entityName: n.entityName,
			recordId: n.recordId ?? null,
			values: n.values ?? null,
			onSuccess: r,
			onError: i
		}
	});
	e.dispatchEvent(a);
}
function g(e, t) {
	let r = e.data?.permissions || {};
	return {
		uid: "purchase-" + ++n,
		root: t,
		entityName: e.screen?.entityName,
		fields: f(e.data?.fields),
		records: l(e.data?.records),
		permissions: {
			canRead: r.canRead !== !1,
			canCreate: r.canCreate === !0,
			canUpdate: r.canUpdate === !0,
			canDelete: r.canDelete === !0
		},
		selected: null,
		editing: null,
		activeTab: 0,
		busy: !1,
		disposed: !1,
		notice: null,
		tabTypes: [],
		notify(e, t = "info") {
			this.disposed || (this.notice = {
				message: e,
				type: t
			}, this.renderNotice?.());
		},
		request(e, n, r, i) {
			this.busy || this.disposed || (this.busy = !0, this.renderBusy?.(), h(t, e, {
				entityName: this.entityName,
				recordId: n,
				values: r
			}, (e) => {
				this.disposed || (this.busy = !1, this.renderBusy?.(), e?.records && (this.records = l(e.records)), typeof i == "function" && i(e), this.notify(e?.message || "Purchase action completed.", "success"));
			}, (e) => {
				this.disposed || (this.busy = !1, this.renderBusy?.(), this.notify(e?.message || "Purchase action failed.", "error"));
			}));
		},
		showTab(e) {
			let t = this.tabTypes.findIndex((t) => t.includes(e));
			t >= 0 && this.activateTab?.(t);
		}
	};
}
function _(e, n) {
	e.properties;
	let a = r("section"), s = r("div");
	a.appendChild(s);
	function c() {
		s.replaceChildren();
		let a = n.editing, l = !a;
		s.appendChild(r("h3", "", l ? o(e, "heading", "New Purchase") : o(e, "editHeading", "Edit Purchase")));
		let d = o(e, "description");
		if (d && s.appendChild(r("p", "", d)), !n.fields.length) {
			s.appendChild(r("p", "", "No fields configured in entity metadata."));
			return;
		}
		if (l && !n.permissions.canCreate) {
			s.appendChild(r("p", "", "Create permission is not available."));
			return;
		}
		if (!l && !n.permissions.canUpdate) {
			s.appendChild(r("p", "", "Update permission is not available."));
			return;
		}
		let f = r("form"), h = [];
		n.fields.filter((e) => e.showInForm).forEach((e, t) => {
			let i = r("div"), o = n.uid + "-field-" + t, s = p(e), c = r("label", "", e.label);
			c.htmlFor = o;
			let l = r("input");
			l.type = s, l.id = o, l.name = e.name, e.required && (l.required = !0), e.readOnly && (l.readOnly = !0), e.maxLength && s !== "number" && (l.maxLength = Number(e.maxLength)), s === "number" && (l.step = "any");
			let d = a ? u(a.values, e.name) : void 0;
			s === "checkbox" ? l.checked = d === !0 : l.value = m(s, d), i.appendChild(c), i.appendChild(l), f.appendChild(i), h.push({
				field: e,
				input: l
			});
		});
		let g = r("button", "", l ? o(e, "saveLabel", "Save Purchase") : o(e, "updateLabel", "Update Purchase"));
		g.type = "submit", g.disabled = n.busy;
		let _ = i(o(e, "clearLabel", "Clear"), () => {
			n.editing = null, c();
		}, n.busy);
		f.appendChild(g), f.appendChild(_), f.addEventListener("submit", (r) => {
			if (r.preventDefault(), n.busy) return;
			let i = {};
			h.forEach(({ field: e, input: t }) => {
				if (e.readOnly) return;
				if (t.type === "checkbox") {
					i[e.name] = t.checked;
					return;
				}
				let n = t.value;
				n === "" ? l || (i[e.name] = null) : i[e.name] = t.type === "number" ? Number(n) : n;
			});
			let s = l ? "create" : "update";
			n.request(s, a?.id ?? null, i, () => {
				n.editing = null, o(e, "afterSave", "open-list") === "open-list" && n.showTab(t.LIST);
			});
		}), s.appendChild(f);
	}
	return n.renderEntry = c, c(), a;
}
function v(e, n) {
	let a = r("section"), s = r("h3", "", o(e, "heading", "Purchase List"));
	if (a.appendChild(s), !n.permissions.canRead) return a.appendChild(r("p", "", "Read permission is not available.")), a;
	let c = r("input");
	c.type = "search", c.placeholder = o(e, "searchPlaceholder", "Search purchases..."), c.setAttribute("aria-label", "Search purchases"), a.appendChild(c);
	let l = r("div");
	a.appendChild(l);
	let f = i(o(e, "newLabel", "New Purchase"), () => {
		n.editing = null, n.showTab(t.ENTRY);
	}, !n.permissions.canCreate);
	a.appendChild(f);
	let p = Math.max(1, Number(o(e, "pageSize", 10)) || 10), m = Math.max(1, Number(o(e, "maxColumns", 6)) || 6), h = 0, g = "";
	function _() {
		l.replaceChildren();
		let e = n.fields.filter((e) => e.showInGrid).slice(0, m), a = n.records.filter((t) => !g || e.some((e) => d(u(t.values, e.name)).toLowerCase().includes(g))), o = Math.max(1, Math.ceil(a.length / p));
		h = Math.min(h, o - 1);
		let s = a.slice(h * p, (h + 1) * p), c = r("table"), f = r("thead"), v = r("tr");
		e.forEach((e) => {
			v.appendChild(r("th", "", e.label));
		}), v.appendChild(r("th", "", "Actions")), f.appendChild(v);
		let y = r("tbody");
		if (!s.length) {
			let t = r("tr"), n = r("td", "", "No purchase records found.");
			n.colSpan = e.length + 1, t.appendChild(n), y.appendChild(t);
		}
		s.forEach((a) => {
			let o = r("tr");
			e.forEach((e) => {
				o.appendChild(r("td", "", d(u(a.values, e.name))));
			});
			let s = r("td");
			s.appendChild(i("View", () => {
				n.selected = a, n.showTab(t.DETAILS);
			})), n.permissions.canUpdate && a.id !== null && s.appendChild(i("Edit", () => {
				n.editing = a, n.showTab(t.ENTRY), n.renderEntry?.();
			})), n.permissions.canDelete && a.id !== null && s.appendChild(i("Delete", () => {
				globalThis.confirm("Delete this purchase?") && n.request("delete", a.id, null);
			})), o.appendChild(s), y.appendChild(o);
		}), c.appendChild(f), c.appendChild(y), l.appendChild(c);
		let b = r("div");
		b.appendChild(i("Previous", () => {
			h--, _();
		}, h === 0)), b.appendChild(r("span", "", `Page ${h + 1} of ${o} (${a.length} records)`)), b.appendChild(i("Next", () => {
			h++, _();
		}, h >= o - 1)), l.appendChild(b);
	}
	return c.addEventListener("input", () => {
		g = c.value.toLowerCase(), h = 0, _();
	}), n.renderList = _, n.onRecordsChanged = _, _(), a;
}
function y(e, n) {
	let a = r("section");
	a.appendChild(r("h3", "", o(e, "heading", "Purchase Details")));
	let s = r("div");
	a.appendChild(s);
	function c() {
		if (s.replaceChildren(), !n.permissions.canRead) {
			s.appendChild(r("p", "", "Read permission is not available."));
			return;
		}
		let a = n.selected;
		if (!a) {
			s.appendChild(r("p", "", o(e, "emptyText", "Select a purchase from the Purchase List."))), s.appendChild(i("Open Purchase List", () => n.showTab(t.LIST)));
			return;
		}
		let c = r("dl");
		n.fields.forEach((t) => {
			let n = u(a.values, t.name);
			if (o(e, "hideEmpty", !1) === !0 && (n == null || n === "")) return;
			let i = r("dt", "", t.label), s = r("dd", "", d(n));
			c.appendChild(i), c.appendChild(s);
		}), s.appendChild(c), s.appendChild(i("Back to List", () => n.showTab(t.LIST))), n.permissions.canUpdate && s.appendChild(i("Edit Purchase", () => {
			n.editing = a, n.showTab(t.ENTRY), n.renderEntry?.();
		}));
	}
	return n.renderDetails = c, c(), a;
}
var b = {
	PURCHASE_ENTRY: _,
	PURCHASE_LIST: v,
	PURCHASE_DETAILS: y
};
function x(e, n, s) {
	let c = a(n, e.key).filter((e) => e.componentType === t.TAB), l = r("div");
	if (!c.length) return l.appendChild(r("p", "", "No tabs configured.")), l;
	let u = r("nav");
	u.setAttribute("role", "tablist");
	let d = [], f = [], p = [];
	c.forEach((e) => {
		let t = a(n, e.key);
		p.push(t.map((e) => e.componentType)), t.forEach((e) => {
			b[e.componentType] && (s.present = s.present || /* @__PURE__ */ new Set(), s.present.add(e.componentType));
		});
	});
	function m(e) {
		e < 0 || e >= c.length || (s.activeTab = e, d.forEach((t, n) => {
			t.setAttribute("aria-selected", n === e ? "true" : "false"), t.tabIndex = n === e ? 0 : -1;
		}), f.forEach((t, n) => {
			t.hidden = n !== e;
		}));
	}
	return s.activateTab = m, s.tabTypes = p, c.forEach((e, t) => {
		let c = i(o(e, "label", "Tab " + (t + 1)), () => m(t));
		c.setAttribute("role", "tab"), c.setAttribute("aria-selected", "false");
		let p = r("section");
		p.setAttribute("role", "tabpanel"), p.hidden = !0, a(n, e.key).forEach((e) => {
			let t = b[e.componentType];
			t && p.appendChild(t(e, s));
		}), d.push(c), f.push(p), u.appendChild(c), l.appendChild(p);
	}), l.insertBefore(u, l.firstChild), m(Math.min(c.length - 1, Math.max(0, Number(o(e, "activeIndex", 0)) || 0))), l;
}
function S(e) {
	let n = r("section"), i = g(e, n), s = r("div");
	return s.hidden = !0, s.setAttribute("role", "status"), i.renderNotice = () => {
		i.notice ? (s.hidden = !1, s.textContent = i.notice.message, s.setAttribute("data-kind", i.notice.type)) : (s.hidden = !0, s.textContent = "");
	}, i.renderBusy = () => {
		n.setAttribute("aria-busy", String(i.busy));
	}, n.appendChild(s), e.roots.filter((e) => e.isVisible !== !1).forEach((s) => {
		if (s.componentType !== t.PAGE) return;
		let c = o(s, "title", "Purchase Management");
		n.appendChild(r("h2", "", c)), a(e, s.key).filter((e) => e.componentType === t.TABS).forEach((t) => {
			n.appendChild(x(t, e, i));
		});
	}), e.mode === "preview" && i.notify("Preview mode: Purchase actions are disabled until platform integration.", "info"), {
		element: n,
		dispose() {
			i.disposed = !0, n.replaceChildren();
		}
	};
}
var C = {
	contractVersion: 1,
	render: S
};
//#endregion
export { e as contractVersion, C as default, S as render };
