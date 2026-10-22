//#region src/wizard.js
var e = {
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
}, t = {
	list: (e) => JSON.parse(localStorage.getItem(e) || "[]"),
	save: (e, t) => localStorage.setItem(e, JSON.stringify(t))
}, n = (e, t, n = {}, ...r) => {
	let i = document.createElement(e);
	return t && (i.className = t.split(" ").map((e) => e.startsWith("vc-") ? e : "vc-" + e).join(" ")), Object.assign(i, n), i.append(...r), i;
};
function r(t) {
	let n = t.name ?? t.fieldName ?? t.key ?? t.field, r = e[String(t.type ?? t.fieldType ?? "text").toLowerCase()] ?? "text", i = (t.options ?? t.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
	return {
		name: n,
		label: t.label ?? t.displayName ?? t.title ?? n,
		type: r,
		options: i
	};
}
function i(e) {
	let t = e?.metadata ?? e ?? {}, n = t.screenId ?? t.screenKey ?? t.screenName ?? t.id ?? "screen", i = t.title ?? t.screenTitle ?? t.screenName ?? "", a = t.steps ?? e?.steps;
	if (!Array.isArray(a)) {
		let n = t.fields ?? t.columns ?? e?.fields ?? [];
		a = n.length ? [{
			title: i || "Details",
			fields: n
		}] : [];
	}
	return a = a.map((e, t) => ({
		id: e.id ?? `step-${t + 1}`,
		title: e.title ?? e.name ?? e.displayName ?? `Step ${t + 1}`,
		description: e.description ?? "",
		fields: (e.fields ?? e.columns ?? []).map(r).filter((e) => e.name)
	})), {
		screenId: n,
		title: i,
		steps: a
	};
}
function a(e, t) {
	let r;
	return r = e.type === "select" ? n("select", "input", {}, n("option", "option", {
		value: "",
		textContent: "Select"
	}), ...e.options.map((e) => n("option", "option", {
		value: e,
		textContent: e
	}))) : e.type === "textarea" ? n("textarea", "input", { rows: 3 }) : n("input", "input", { type: e.type || "text" }), r.name = e.name, r.value = t ?? "", r;
}
var o = null, s = {
	contractVersion: 1,
	supportedScreenTypes: ["WIZARD"],
	render(e) {
		let r = i(e), s = e?.runtime ?? {}, c = typeof s.storage?.list == "function" && typeof s.storage?.save == "function" ? s.storage : t, l = typeof s.toast == "function" ? s.toast : (e) => console.log(e);
		if (o = n("div", "host"), o.append(n("h2", "title", { textContent: r.title })), !r.steps.length) return o.append(n("p", "empty", { textContent: "No steps configured." })), o;
		let u = n("ol", "stepper"), d = n("div", "step-body");
		o.append(u, d);
		let f = {}, p = 0, m = !1, h = [], g = () => h.forEach(({ name: e, input: t }) => f[e] = t.value);
		function _() {
			let e = { ...f };
			if (typeof s.onFinish == "function") s.onFinish(e);
			else {
				let t = `crud:${r.screenId}`, n = c.list(t);
				c.save(t, [...Array.isArray(n) ? n : [], {
					id: Date.now(),
					...e
				}]);
			}
			l("Saved"), m = !0, b();
		}
		function v(e) {
			if (g(), e > 0 && p === r.steps.length - 1) return _();
			p += e, b();
		}
		function y() {
			u.replaceChildren(...r.steps.map((e, t) => {
				let r = m || t < p, i = n("li", "step" + (!m && t === p ? " vc-step-active" : r ? " vc-step-done" : ""), {}, n("span", "step-num", { textContent: r ? "✓" : String(t + 1) }), n("span", "step-label", { textContent: e.title }));
				return !m && t < p && (i.onclick = () => {
					g(), p = t, b();
				}), i;
			}));
		}
		function b() {
			if (y(), h = [], m) {
				d.replaceChildren(n("div", "done", {}, n("p", "step-desc", { textContent: "Saved successfully." }), n("button", "btn", {
					type: "button",
					textContent: "Start new",
					onclick: () => {
						f = {}, p = 0, m = !1, b();
					}
				})));
				return;
			}
			let e = r.steps[p], t = p === r.steps.length - 1, i = n("form", "form");
			i.style.display = "flex", i.style.flexDirection = "column", e.fields.forEach((e) => {
				let t = a(e, f[e.name]);
				h.push({
					name: e.name,
					input: t
				}), i.append(n("label", "field", {}, n("span", "label", { textContent: e.label }), t));
			}), i.append(n("div", "actions", {}, ...p > 0 ? [n("button", "btn-secondary", {
				type: "button",
				textContent: "Back",
				onclick: () => v(-1)
			})] : [], n("button", "btn", {
				type: "submit",
				textContent: t ? "Finish" : "Next"
			}))), i.onsubmit = (e) => {
				e.preventDefault(), v(1);
			}, d.replaceChildren(n("h3", "step-heading", { textContent: e.title }), ...e.description ? [n("p", "step-desc", { textContent: e.description })] : [], i), h[0]?.input.focus();
		}
		return b(), o;
	},
	destroy() {
		o?.replaceChildren(), o = null;
	}
};
//#endregion
export { s as default };
