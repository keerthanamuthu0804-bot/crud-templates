import { setup, el, buildList, buildForm, createRenderer } from "./common.js";

function mount(container, { metadata, runtime }) {
  const app = setup(metadata, runtime);
  let editingId = null;

  const list = buildList(metadata, {
    onAdd: () => open(null),
    onEdit: open,
    onDelete: (id) => {
      if (app.remove(id)) list.render(app.rows);
    },
  });

  const title = el("h2", "title");
  const f = buildForm(metadata, {
    onSubmit: (values) => {
      app.save(editingId, values);
      list.render(app.rows);
      close();
    },
    onCancel: close,
  });
  const back = el("button", "btn-link", {
    type: "button",
    textContent: "Back to list",
    onclick: close,
  });
  const formView = el(
    "section",
    "form-page",
    { hidden: true },
    back,
    title,
    f.form,
  );

  function open(row) {
    editingId = row ? row.id : null;
    title.textContent = row ? "Edit record" : "New record";
    f.fill(row);
    list.main.hidden = true;
    formView.hidden = false;
    f.focus();
  }
  function close() {
    editingId = null;
    formView.hidden = true;
    list.main.hidden = false;
  }

  container.replaceChildren(list.main, formView);
  list.render(app.rows);
  return { destroy: () => container.replaceChildren() };
}

export default createRenderer(mount, ["CRUD-PAGE"]);
