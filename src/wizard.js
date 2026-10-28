import { normalizeField, readActions, readToast } from "./common.js";

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
// steps <- metadata.steps = [{ id, title, description, fields: [...] }]
// (without steps, metadata.fields becomes a single step)
function normalize(context) {
  const meta = context?.metadata ?? context ?? {};
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

  return { title, steps };
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
  i.required = !!f.required; // browser validates on "Next" / "Finish"
  i.value = value ?? "";
  return i;
}

let host = null;

export default {
  contractVersion: 1,
  supportedScreenTypes: ["WIZARD"],

  render(context) {
    const cfg = normalize(context);
    const toast = readToast(context);
    // Saving goes through the platform create action only.
    // "onFinish" is accepted as an alias for create.
    const actions = readActions(context);
    const create =
      actions.create ?? context?.runtime?.onFinish ?? context?.onFinish ?? null;

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
    let saving = false;
    let error = "";
    let inputs = [];

    const collect = () =>
      inputs.forEach(({ name, input }) => (values[name] = input.value));

    // success is shown only after the platform confirms the save
    async function finish() {
      if (saving) return;
      if (typeof create !== "function") {
        console.warn("[wizard] platform create action not provided.");
        error = "Saving is not available.";
        draw();
        return;
      }
      saving = true;
      error = "";
      draw();
      try {
        await create({ ...values });
        toast("Saved");
        finished = true;
      } catch (e) {
        console.error("[wizard] save failed", e);
        error = e?.message || "Save failed. Please try again.";
      }
      saving = false;
      draw();
    }

    function go(dir) {
      collect();
      error = "";
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
          if (!finished && !saving && i < index) {
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
                error = "";
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
        input.disabled = saving;
        inputs.push({ name: f.name, input });
        form.append(
          h(
            "label",
            "field",
            {},
            h("span", "label", {
              textContent: f.label + (f.required ? " *" : ""),
            }),
            input,
          ),
        );
      });

      if (error) form.append(h("p", "error", { textContent: error }));

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
                  disabled: saving,
                  onclick: () => go(-1),
                }),
              ]
            : []),
          h("button", "btn", {
            type: "submit",
            disabled: saving,
            textContent: saving ? "Saving..." : last ? "Finish" : "Next",
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
      if (!saving) inputs[0]?.input.focus();
    }

    draw();
    return host;
  },

  destroy() {
    host?.replaceChildren();
    host = null;
  },
};
