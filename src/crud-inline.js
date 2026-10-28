import {
  setup,
  el,
  btn,
  makeInput,
  createRenderer,
  CLS,
  NONE_ALLOWED,
} from "./common.js";

function mount(container, { metadata, platform }) {
  const app = setup(metadata, platform);
  const perms = metadata.permissions || NONE_ALLOWED;
  let editing = null; // null | "new" | record id
  let busy = false;

  const tbody = el("tbody", "");
  const empty = el("p", CLS.empty, { textContent: "No records yet." });
  const table = el(
    "table",
    CLS.table,
    {},
    el(
      "thead",
      "",
      {},
      el(
        "tr",
        "",
        {},
        ...metadata.fields.map((f) => el("th", "", { textContent: f.label })),
        el("th", "", { textContent: "Actions" }),
      ),
    ),
    tbody,
  );
  const header = el(
    "header",
    CLS.header,
    {},
    el("h2", CLS.title, { textContent: metadata.title }),
    ...(perms.create
      ? [
          btn("primary", "Add", () => {
            editing = "new";
            render();
          }),
        ]
      : []),
  );
  const root = el(
    "section",
    CLS.screenCard,
    {},
    header,
    el("div", CLS.tableWrap, {}, table),
    empty,
  );

  function viewRow(r) {
    return el(
      "tr",
      "",
      {},
      ...metadata.fields.map((f) =>
        el("td", "", { textContent: r[f.name] ?? "" }),
      ),
      el(
        "td",
        CLS.actions,
        {},
        ...(perms.edit
          ? [
              btn(
                "secondary",
                "Edit",
                () => {
                  editing = r.id;
                  render();
                },
                { compact: true },
              ),
            ]
          : []),
        ...(perms.delete
          ? [
              btn(
                "danger",
                "Delete",
                async () => {
                  if (busy) return;
                  busy = true;
                  const ok = await app.remove(r.id);
                  busy = false;
                  if (ok) render();
                },
                { compact: true },
              ),
            ]
          : []),
      ),
    );
  }

  function editRow(r) {
    const inputs = metadata.fields.map((f) => makeInput(f, r[f.name] ?? ""));
    const save = async () => {
      if (busy || !inputs.every((i) => i.reportValidity())) return;
      busy = true;
      const values = Object.fromEntries(
        metadata.fields.map((f, i) => [f.name, inputs[i].value]),
      );
      const ok = await app.save(editing === "new" ? null : editing, values);
      busy = false;
      if (ok) editing = null;
      render();
    };
    return el(
      "tr",
      CLS.editingRow,
      {},
      ...inputs.map((i) => el("td", "", {}, i)),
      el(
        "td",
        CLS.actions,
        {},
        btn("primary", "Save", save, { compact: true }),
        btn(
          "secondary",
          "Cancel",
          () => {
            editing = null;
            render();
          },
          { compact: true },
        ),
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

export default createRenderer(mount, ["CRUD-INLINE"]);
