//#region src/tabs.js
var e = (e, t, n = {}, ...r) => {
	let i = document.createElement(e);
	return t && (i.className = t.split(" ").map((e) => e.startsWith("vc-") ? e : "vc-" + e).join(" ")), Object.assign(i, n), i.append(...r), i;
};
function t(e) {
	let t = e?.metadata ?? e ?? {}, n = (Array.isArray(t.tabs) ? t.tabs : []).map((e, t) => ({
		...e,
		id: String(e.id ?? `tab-${t + 1}`),
		title: e.title ?? e.name ?? e.displayName ?? `Tab ${t + 1}`
	}));
	return {
		title: t.title ?? t.screenTitle ?? t.screenName ?? "",
		tabs: n,
		defaultTab: t.defaultTab == null ? null : String(t.defaultTab)
	};
}
var n = null, r = {
	contractVersion: 1,
	supportedScreenTypes: ["TABS"],
	render(r) {
		let i = t(r), a = r?.runtime ?? {}, o = e("div", "host");
		if (o.append(e("h2", "title", { textContent: i.title })), n = o, !i.tabs.length) return o.append(e("p", "empty", { textContent: "No tabs configured." })), o;
		let s = e("div", "tabs", { role: "tablist" }), c = e("div", "tab-panels");
		o.append(s, c);
		let l = i.tabs.map((t) => ({
			tab: t,
			button: null,
			panel: e("div", "tab-panel", {
				role: "tabpanel",
				hidden: !0
			}),
			opened: !1
		}));
		l.forEach((e) => e.panel.dataset.tabId = e.tab.id);
		function u(e, t = !1) {
			l.forEach((t, n) => {
				let r = n === e;
				t.button.className = "vc-tab" + (r ? " vc-tab-active" : ""), t.button.setAttribute("aria-selected", String(r)), t.button.tabIndex = r ? 0 : -1, t.panel.hidden = !r;
			}), t && l[e].button.focus();
		}
		function d(e) {
			let t = l[e], n = {
				id: t.tab.id,
				index: e,
				tab: t.tab,
				panel: t.panel,
				firstTime: !t.opened
			};
			t.opened = !0, o.dispatchEvent(new CustomEvent("vc-tab-change", {
				bubbles: !0,
				detail: n
			})), typeof a.onTabChange == "function" && a.onTabChange(n);
		}
		function f(e, t = !1) {
			u(e, t), d(e);
		}
		l.forEach((t, n) => {
			t.button = e("button", "tab", {
				type: "button",
				role: "tab",
				textContent: t.tab.title,
				onclick: () => {
					t.panel.hidden && f(n);
				},
				onkeydown: (e) => {
					let t = {
						ArrowRight: 1,
						ArrowLeft: -1
					}[e.key];
					t && (e.preventDefault(), f((n + t + l.length) % l.length, !0));
				}
			}), s.append(t.button), c.append(t.panel);
		});
		let p = Math.max(0, l.findIndex((e) => e.tab.id === i.defaultTab));
		return u(p), queueMicrotask(() => d(p)), o;
	},
	destroy() {
		n?.replaceChildren(), n = null;
	}
};
//#endregion
export { r as default };
