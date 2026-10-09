import { setup, el, makeInput } from "./common.js";

export default function mount(container, { metadata, runtime }) {
  const app = setup(metadata, runtime);
  let editing = null; // null | "new" | row id

  const btn = (cls, text, fn) =>
    el("button", cls, { type: "button", textContent: text, onclick: fn });

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
    btn("btn", "Add", () => {
      editing = "new";
      render();
    }),
  );
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  const root = el("section", "main", {}, header, table, empty);

  function viewRow(r) {
    return el(
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
        btn("btn-link", "Edit", () => {
          editing = r.id;
          render();
        }),
        btn("btn-danger", "Delete", () => {
          if (app.remove(r.id)) render();
        }),
      ),
    );
  }

  function editRow(r) {
    const inputs = metadata.fields.map((f) => makeInput(f, r[f.name] ?? ""));
    const save = () => {
      if (!inputs.every((i) => i.reportValidity())) return;
      const values = Object.fromEntries(
        metadata.fields.map((f, i) => [f.name, inputs[i].value]),
      );
      app.save(editing === "new" ? null : editing, values);
      editing = null;
      render();
    };
    return el(
      "tr",
      "tr vc-editing",
      {},
      ...inputs.map((i) => el("td", "td", {}, i)),
      el(
        "td",
        "td",
        {},
        btn("btn", "Save", save),
        btn("btn-secondary", "Cancel", () => {
          editing = null;
          render();
        }),
      ),
    );
  }

  function render() {
    tbody.replaceChildren(
      ...(editing === "new" ? [editRow({})] : []),
      ...app.rows.map((r) => (editing === r.id ? editRow(r) : viewRow(r))),
    );
    const showTable = app.rows.length > 0 || editing === "new";
    table.hidden = !showTable;
    empty.hidden = showTable;
  }

  container.replaceChildren(root);
  render();
  return { destroy: () => container.replaceChildren() };
}
