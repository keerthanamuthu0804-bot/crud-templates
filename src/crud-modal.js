import {
  setup,
  el,
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

  const title = el("h3", CLS.dialogTitle);
  const f = buildForm(metadata, {
    // close the dialog only after the platform confirmed the save
    onSubmit: async (values) => {
      if (await app.save(editingId, values)) {
        list.render(app.rows);
        dialog.close();
      }
    },
    onCancel: () => dialog.close(),
  });
  const dialog = el("dialog", CLS.dialog, {}, title, f.form);
  dialog.onclose = () => {
    editingId = null;
  };

  function open(row) {
    editingId = row ? row.id : null;
    title.textContent = row ? "Edit record" : "New record";
    f.fill(row);
    dialog.showModal();
    f.focus();
  }

  container.replaceChildren(list.main, dialog);
  list.render(app.rows);
  return {
    destroy: () => {
      if (dialog.open) dialog.close();
      container.replaceChildren();
    },
  };
}

export default createRenderer(mount, ["CRUD-MODAL"]);
