export const localStore = {
  list: (key) => JSON.parse(localStorage.getItem(key) || "[]"),
  save: (key, rows) => localStorage.setItem(key, JSON.stringify(rows)),
};

// The core app can be styled using \"vc-\" + cls
export const el = (tag, cls, props = {}, ...kids) => {
  const n = document.createElement(tag);
  n.className = "vc-" + cls;
  Object.assign(n, props);
  n.append(...kids);
  return n;
};

export const makeInput = (f, value = "") => {
  let i;
  if (f.type === "select") {
    i = el(
      "select",
      "input",
      {},
      el("option", "option", { value: "", textContent: "Select" }),
      ...f.options.map((o) =>
        el("option", "option", { value: o, textContent: o }),
      ),
    );
  } else if (f.type === "textarea") {
    i = el("textarea", "input", { rows: 3 });
  } else {
    i = el("input", "input", { type: f.type || "text" });
  }
  i.required = !!f.required;
  i.name = f.name;
  i.value = value;
  return i;
};

// Data and storage handling (uses localStorage by default, or runtime.storage if provided).
export function setup(metadata, runtime = {}) {
  const store = runtime.storage || localStore;
  const toast = runtime.toast || ((m) => console.log(m));
  const key = `crud:${metadata.screenId}`;
  let rows = store.list(key);
  const persist = (next) => {
    rows = next;
    store.save(key, rows);
  };

  return {
    get rows() {
      return rows;
    },
    toast,
    save(id, values) {
      persist(
        id != null
          ? rows.map((r) => (r.id === id ? { ...r, ...values } : r))
          : [...rows, { id: Date.now(), ...values }],
      );
      toast("Saved");
    },
    remove(id) {
      if (!confirm("Delete this record?")) return false;
      persist(rows.filter((r) => r.id !== id));
      toast("Deleted");
      return true;
    },
  };
}

// Table + Add button
export function buildList(metadata, { onAdd, onEdit, onDelete }) {
  const addBtn = el("button", "btn", {
    type: "button",
    textContent: "Add",
    onclick: onAdd,
  });
  const tbody = el("tbody", "tbody");
  const empty = el("p", "empty", { textContent: "No records yet." });
  const table = el(
    "table",
    "table",
    {},
    el(
      "thead",
      "thead",
      {},
      el(
        "tr",
        "tr",
        {},
        ...metadata.fields.map((f) => el("th", "th", { textContent: f.label })),
        el("th", "th"),
      ),
    ),
    tbody,
  );
  const header = el(
    "header",
    "header",
    {},
    el("h2", "title", { textContent: metadata.title }),
    addBtn,
  );
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  const main = el("section", "main", {}, header, table, empty);

  const render = (rows) => {
    tbody.replaceChildren(
      ...rows.map((r) =>
        el(
          "tr",
          "tr",
          {},
          ...metadata.fields.map((f) =>
            el("td", "td", { textContent: r[f.name] ?? "" }),
          ),
          el(
            "td",
            "td",
            {},
            el("button", "btn-link", {
              type: "button",
              textContent: "Edit",
              onclick: () => onEdit(r),
            }),
            el("button", "btn-danger", {
              type: "button",
              textContent: "Delete",
              onclick: () => onDelete(r.id),
            }),
          ),
        ),
      ),
    );
    empty.hidden = rows.length > 0;
    table.hidden = rows.length === 0;
  };
  return { main, render };
}

// Form (side panel / modal / page ellathukum same)
export function buildForm(metadata, { onSubmit, onCancel }) {
  const inputs = {};
  const form = el("form", "form");
  form.style.display = "flex";
  form.style.flexDirection = "column";

  metadata.fields.forEach((f) => {
    const i = makeInput(f);
    inputs[f.name] = i;
    form.append(
      el(
        "label",
        "field",
        {},
        el("span", "label", {
          textContent: f.label + (f.required ? " *" : ""),
        }),
        i,
      ),
    );
  });
  form.append(
    el(
      "div",
      "actions",
      {},
      el("button", "btn", { type: "submit", textContent: "Save" }),
      el("button", "btn-secondary", {
        type: "button",
        textContent: "Cancel",
        onclick: onCancel,
      }),
    ),
  );

  form.onsubmit = (e) => {
    e.preventDefault();
    onSubmit(
      Object.fromEntries(
        metadata.fields.map((f) => [f.name, inputs[f.name].value]),
      ),
    );
  };
  return {
    form,
    fill: (row) =>
      metadata.fields.forEach(
        (f) => (inputs[f.name].value = row ? (row[f.name] ?? "") : ""),
      ),
    focus: () => inputs[metadata.fields[0].name].focus(),
  };
}
