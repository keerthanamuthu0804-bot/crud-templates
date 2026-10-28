import {
  setup,
  el,
  btn,
  buildList,
  buildForm,
  createRenderer,
  CLS,
} from "./common.js";

function mount(container, { metadata, platform }) {
  const app = setup(metadata, platform);
  let editingId = null;

  const list = buildList(metadata, {
    onAdd: () => open(null),
    onEdit: open,
    onDelete: async (id) => {
      if (await app.remove(id)) list.render(app.rows);
    },
  });

  const title = el("h2", CLS.title);
  const f = buildForm(metadata, {
    // go back to the list only after the platform confirmed the save
    onSubmit: async (values) => {
      if (await app.save(editingId, values)) {
        list.render(app.rows);
        close();
      }
    },
    onCancel: () => close(),
  });
  const back = btn("secondary", "Back to list", () => close());
  const formView = el(
    "section",
    CLS.formPage,
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
