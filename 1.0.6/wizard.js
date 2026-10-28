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
}, t = (e, t, n = {}, ...r) => {
	let i = document.createElement(e);
	return t && (i.className = t.split(" ").map((e) => e.startsWith("vc-") ? e : "vc-" + e).join(" ")), Object.assign(i, n), i.append(...r), i;
};
function n(t) {
	let n = t.name ?? t.fieldName ?? t.key ?? t.field, r = e[String(t.type ?? t.fieldType ?? "text").toLowerCase()] ?? "text", i = (t.options ?? t.values ?? []).map((e) => typeof e == "object" && e ? e.value ?? e.label : e);
	return {
		name: n,
		label: t.label ?? t.displayName ?? t.title ?? n,
		type: r,
		options: i
	};
}
function r(e) {
	let t = e?.metadata ?? e ?? {}, r = t.screenId ?? t.screenKey ?? t.screenName ?? t.id ?? "screen", i = t.title ?? t.screenTitle ?? t.screenName ?? "", a = t.steps ?? e?.steps;
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
		fields: (e.fields ?? e.columns ?? []).map(n).filter((e) => e.name)
	})), {
		screenId: r,
		title: i,
		steps: a
	};
}
function i(e, n) {
	let r;
	return r = e.type === "select" ? t("select", "input", {}, t("option", "option", {
		value: "",
		textContent: "Select"
	}), ...e.options.map((e) => t("option", "option", {
		value: e,
		textContent: e
	}))) : e.type === "textarea" ? t("textarea", "input", { rows: 3 }) : t("input", "input", { type: e.type || "text" }), r.name = e.name, r.value = n ?? "", r;
}
var a = null, o = {
	contractVersion: 1,
	supportedScreenTypes: ["WIZARD"],
	render(e) {
		let n = r(e), o = e?.runtime ?? {}, s = typeof o.storage?.list == "function" && typeof o.storage?.save == "function" ? o.storage : null, c = typeof o.toast == "function" ? o.toast : (e) => console.log(e);
		if (a = t("div", "host"), a.append(t("h2", "title", { textContent: n.title })), !n.steps.length) return a.append(t("p", "empty", { textContent: "No steps configured." })), a;
		let l = t("ol", "stepper"), u = t("div", "step-body");
		a.append(l, u);
		let d = {}, f = 0, p = !1, m = [], h = () => m.forEach(({ name: e, input: t }) => d[e] = t.value);
		function g() {
			let e = { ...d };
			if (typeof o.onFinish == "function") o.onFinish(e);
			else if (s) {
				let t = `crud:${n.screenId}`, r = s.list(t);
				s.save(t, [...Array.isArray(r) ? r : [], {
					id: Date.now(),
					...e
				}]);
			} else console.warn("[wizard] runtime.storage / runtime.onFinish not provided by core app; data will not be saved.");
			c("Saved"), p = !0, y();
		}
		function _(e) {
			if (h(), e > 0 && f === n.steps.length - 1) return g();
			f += e, y();
		}
		function v() {
			l.replaceChildren(...n.steps.map((e, n) => {
				let r = p || n < f, i = t("li", "step" + (!p && n === f ? " vc-step-active" : r ? " vc-step-done" : ""), {}, t("span", "step-num", { textContent: r ? "✓" : String(n + 1) }), t("span", "step-label", { textContent: e.title }));
				return !p && n < f && (i.onclick = () => {
					h(), f = n, y();
				}), i;
			}));
		}
		function y() {
			if (v(), m = [], p) {
				u.replaceChildren(t("div", "done", {}, t("p", "step-desc", { textContent: "Saved successfully." }), t("button", "btn", {
					type: "button",
					textContent: "Start new",
					onclick: () => {
						d = {}, f = 0, p = !1, y();
					}
				})));
				return;
			}
			let e = n.steps[f], r = f === n.steps.length - 1, a = t("form", "form");
			a.style.display = "flex", a.style.flexDirection = "column", e.fields.forEach((e) => {
				let n = i(e, d[e.name]);
				m.push({
					name: e.name,
					input: n
				}), a.append(t("label", "field", {}, t("span", "label", { textContent: e.label }), n));
			}), a.append(t("div", "actions", {}, ...f > 0 ? [t("button", "btn-secondary", {
				type: "button",
				textContent: "Back",
				onclick: () => _(-1)
			})] : [], t("button", "btn", {
				type: "submit",
				textContent: r ? "Finish" : "Next"
			}))), a.onsubmit = (e) => {
				e.preventDefault(), _(1);
			}, u.replaceChildren(t("h3", "step-heading", { textContent: e.title }), ...e.description ? [t("p", "step-desc", { textContent: e.description })] : [], a), m[0]?.input.focus();
		}
		return y(), a;
	},
	destroy() {
		a?.replaceChildren(), a = null;
	}
};
//#endregion
export { o as default };
