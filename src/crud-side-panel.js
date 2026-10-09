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

  const title = el("h3", "panel-title");
  const f = buildForm(metadata, {
    onSubmit: (values) => {
      app.save(editingId, values);
      list.render(app.rows);
      close();
    },
    onCancel: close,
  });
  const panel = el("aside", "panel", { hidden: true }, title, f.form);

  const root = el("div", "root", {}, list.main, panel);
  root.style.display = "flex";
  root.style.alignItems = "flex-start";
  list.main.style.flex = "1";
  panel.style.width = "340px";

  function open(row) {
    editingId = row ? row.id : null;
    title.textContent = row ? "Edit record" : "New record";
    f.fill(row);
    panel.hidden = false;
    f.focus();
  }
  function close() {
    panel.hidden = true;
    editingId = null;
  }

  container.replaceChildren(root);
  list.render(app.rows);
  return { destroy: () => container.replaceChildren() };
}
