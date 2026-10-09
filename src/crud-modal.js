import { setup, el, buildList, buildForm } from "./common.js";

export default function mount(container, { metadata, runtime }) {
  const app = setup(metadata, runtime);
  let editingId = null;

  const list = buildList(metadata, {
    onAdd: () => open(null),
    onEdit: open,
    onDelete: (id) => {
      if (app.remove(id)) list.render(app.rows);
    },
  });

  const title = el("h3", "dialog-title");
  const f = buildForm(metadata, {
    onSubmit: (values) => {
      app.save(editingId, values);
      list.render(app.rows);
      dialog.close();
    },
    onCancel: () => dialog.close(),
  });
  const dialog = el("dialog", "dialog", {}, title, f.form);
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
