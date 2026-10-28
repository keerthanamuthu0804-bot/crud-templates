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
      if (await app.remove(id)) {
        list.render(app.rows);
        if (id === editingId) close();
      }
    },
  });

  const title = el("h3", CLS.panelTitle);
  const f = buildForm(metadata, {
    // close the panel only after the platform confirmed the save
    onSubmit: async (values) => {
      if (await app.save(editingId, values)) {
        list.render(app.rows);
        close();
      }
    },
    onCancel: () => close(),
  });
  const panel = el("aside", CLS.panel, { hidden: true }, title, f.form);

  // layout comes from style.css (.screen-split / .side-panel)
  const root = el("div", CLS.split, {}, list.main, panel);

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

export default createRenderer(mount, ["CRUD-SIDE-PANEL"]);
