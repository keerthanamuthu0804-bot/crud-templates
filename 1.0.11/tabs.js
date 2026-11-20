//#region src/tabs.js
var e = 1, t = {
	TABS: "TABS",
	TAB: "TAB"
}, n = 0;
function r(e, t = "") {
	let n = document.createElement(e);
	return t != null && (n.textContent = String(t)), n;
}
function i(e, t, n = "") {
	return e?.properties?.[t] ?? n;
}
function a(e, t) {
	return typeof e.getChildren == "function" ? e.getChildren(t).filter((e) => e.isVisible !== !1) : [];
}
function o(e, n) {
	let o = r("div"), s = r("nav");
	s.setAttribute("role", "tablist");
	let c = a(n, e.key).filter((e) => e.componentType === t.TAB);
	if (c.length === 0) return o.appendChild(r("p", "No tabs configured.")), o;
	let l = [], u = [];
	function d(e) {
		e < 0 || e >= c.length || l.forEach((t, n) => {
			let r = n === e;
			t.setAttribute("aria-selected", String(r)), t.tabIndex = r ? 0 : -1, u[n].hidden = !r;
		});
	}
	c.forEach((e, t) => {
		let n = r("button", i(e, "label", `Tab ${t + 1}`));
		n.type = "button", n.setAttribute("role", "tab"), n.setAttribute("aria-selected", "false"), n.tabIndex = -1, n.addEventListener("click", () => {
			d(t);
		});
		let a = r("section");
		a.setAttribute("role", "tabpanel"), a.hidden = !0;
		let c = i(e, "content", "");
		c && a.appendChild(r("div", c));
		let f = i(e, "description", "");
		f && a.appendChild(r("p", f)), l.push(n), u.push(a), s.appendChild(n), o.appendChild(a);
	}), o.insertBefore(s, o.firstChild);
	let f = Number(i(e, "activeIndex", 0));
	return d(Number.isInteger(f) ? Math.max(0, Math.min(f, c.length - 1)) : 0), l.forEach((e, t) => {
		e.addEventListener("keydown", (e) => {
			let n = t;
			if (e.key === "ArrowRight") n = (t + 1) % l.length;
			else if (e.key === "ArrowLeft") n = (t - 1 + l.length) % l.length;
			else if (e.key === "Home") n = 0;
			else if (e.key === "End") n = l.length - 1;
			else return;
			e.preventDefault(), d(n), l[n].focus();
		});
	}), o;
}
function s(e) {
	let i = r("section");
	return i.setAttribute("data-template-instance", "tabs-" + ++n), (e.roots || []).filter((e) => e.isVisible !== !1).forEach((n) => {
		n.componentType === t.TABS && i.appendChild(o(n, e));
	}), i.childNodes.length === 0 && i.appendChild(r("p", "No tab container configured.")), {
		element: i,
		dispose() {
			i.replaceChildren();
		}
	};
}
var c = {
	contractVersion: 1,
	render: s
};
//#endregion
export { e as contractVersion, c as default, s as render };
