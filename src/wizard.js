const TYPE_MAP = {
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
  lookup: "select",
};

// class name = "vc-" + cls
const h = (tag, cls, props = {}, ...kids) => {
  const n = document.createElement(tag);
  if (cls)
    n.className = cls
      .split(" ")
      .map((c) => (c.startsWith("vc-") ? c : "vc-" + c))
      .join(" ");
  Object.assign(n, props);
  n.append(...kids);
  return n;
};

// ---------- core app context -> template format ----------
function normalizeField(f) {
  const name = f.name ?? f.fieldName ?? f.key ?? f.field;
  const type =
    TYPE_MAP[String(f.type ?? f.fieldType ?? "text").toLowerCase()] ?? "text";
  const options = (f.options ?? f.values ?? []).map((o) =>
    typeof o === "object" && o !== null ? (o.value ?? o.label) : o,
  );
  return {
    name,
    label: f.label ?? f.displayName ?? f.title ?? name,
    type,
    options,
  };
}

function normalize(context) {
  const meta = context?.metadata ?? context ?? {};
  const screenId =
    meta.screenId ?? meta.screenKey ?? meta.screenName ?? meta.id ?? "screen";
  const title = meta.title ?? meta.screenTitle ?? meta.screenName ?? "";

  let steps = meta.steps ?? context?.steps;
  if (!Array.isArray(steps)) {
    const flat = meta.fields ?? meta.columns ?? context?.fields ?? [];
    steps = flat.length ? [{ title: title || "Details", fields: flat }] : [];
  }

  steps = steps.map((st, i) => ({
    id: st.id ?? `step-${i + 1}`,
    title: st.title ?? st.name ?? st.displayName ?? `Step ${i + 1}`,
    description: st.description ?? "",
    fields: (st.fields ?? st.columns ?? [])
      .map(normalizeField)
      .filter((f) => f.name),
  }));

  return { screenId, title, steps };
}

function makeInput(f, value) {
  let i;
  if (f.type === "select") {
    i = h(
      "select",
      "input",
      {},
      h("option", "option", { value: "", textContent: "Select" }),
      ...f.options.map((o) =>
        h("option", "option", { value: o, textContent: o }),
      ),
    );
  } else if (f.type === "textarea") {
    i = h("textarea", "input", { rows: 3 });
  } else {
    i = h("input", "input", { type: f.type || "text" });
  }
  i.name = f.name;
  i.value = value ?? "";
  return i;
}

let host = null;

export default {
  contractVersion: 1,
  supportedScreenTypes: ["WIZARD"],

  render(context) {
    const cfg = normalize(context);
    const rt = context?.runtime ?? {};
    // Storage comes only from the core app (no localStorage fallback)
    const store =
      typeof rt.storage?.list === "function" &&
      typeof rt.storage?.save === "function"
        ? rt.storage
        : null;
    const toast =
      typeof rt.toast === "function" ? rt.toast : (m) => console.log(m);

    host = h("div", "host");
    host.append(h("h2", "title", { textContent: cfg.title }));

    if (!cfg.steps.length) {
      host.append(h("p", "empty", { textContent: "No steps configured." }));
      return host;
    }

    const stepper = h("ol", "stepper");
    const body = h("div", "step-body");
    host.append(stepper, body);

    let values = {};
    let index = 0;
    let finished = false;
    let inputs = [];

    const collect = () =>
      inputs.forEach(({ name, input }) => (values[name] = input.value));

    function finish() {
      const record = { ...values };
      if (typeof rt.onFinish === "function") {
        rt.onFinish(record);
      } else if (store) {
        const key = `crud:${cfg.screenId}`;
        const rows = store.list(key);
        store.save(key, [
          ...(Array.isArray(rows) ? rows : []),
          { id: Date.now(), ...record },
        ]);
      } else {
        console.warn(
          "[wizard] runtime.storage / runtime.onFinish not provided by core app; data will not be saved.",
        );
      }
      toast("Saved");
      finished = true;
      draw();
    }

    function go(dir) {
      collect();
      if (dir > 0 && index === cfg.steps.length - 1) return finish();
      index += dir;
      draw();
    }

    function drawStepper() {
      stepper.replaceChildren(
        ...cfg.steps.map((st, i) => {
          const done = finished || i < index;
          const cls =
            "step" +
            (!finished && i === index
              ? " vc-step-active"
              : done
                ? " vc-step-done"
                : "");
          const li = h(
            "li",
            cls,
            {},
            h("span", "step-num", { textContent: done ? "✓" : String(i + 1) }),
            h("span", "step-label", { textContent: st.title }),
          );
          if (!finished && i < index) {
            li.onclick = () => {
              collect();
              index = i;
              draw();
            };
          }
          return li;
        }),
      );
    }

    function draw() {
      drawStepper();
      inputs = [];

      if (finished) {
        body.replaceChildren(
          h(
            "div",
            "done",
            {},
            h("p", "step-desc", { textContent: "Saved successfully." }),
            h("button", "btn", {
              type: "button",
              textContent: "Start new",
              onclick: () => {
                values = {};
                index = 0;
                finished = false;
                draw();
              },
            }),
          ),
        );
        return;
      }

      const step = cfg.steps[index];
      const last = index === cfg.steps.length - 1;
      const form = h("form", "form");
      form.style.display = "flex";
      form.style.flexDirection = "column";

      step.fields.forEach((f) => {
        const input = makeInput(f, values[f.name]);
        inputs.push({ name: f.name, input });
        form.append(
          h(
            "label",
            "field",
            {},
            h("span", "label", { textContent: f.label }),
            input,
          ),
        );
      });

      form.append(
        h(
          "div",
          "actions",
          {},
          ...(index > 0
            ? [
                h("button", "btn-secondary", {
                  type: "button",
                  textContent: "Back",
                  onclick: () => go(-1),
                }),
              ]
            : []),
          h("button", "btn", {
            type: "submit",
            textContent: last ? "Finish" : "Next",
          }),
        ),
      );
      form.onsubmit = (e) => {
        e.preventDefault();
        go(1);
      };

      body.replaceChildren(
        h("h3", "step-heading", { textContent: step.title }),
        ...(step.description
          ? [h("p", "step-desc", { textContent: step.description })]
          : []),
        form,
      );
      inputs[0]?.input.focus();
    }

    draw();
    return host;
  },

  destroy() {
    host?.replaceChildren();
    host = null;
  },
};
