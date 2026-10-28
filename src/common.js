export const NONE_ALLOWED = { create: false, edit: false, delete: false };

export const localStore = {
  list: (key) => JSON.parse(localStorage.getItem(key) || "[]"),
  save: (key, rows) => localStorage.setItem(key, JSON.stringify(rows)),
};
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
export function buildList(metadata, { onAdd, onEdit, onDelete }) {
  const perms = metadata.permissions || NONE_ALLOWED;
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
    ...(perms.create ? [addBtn] : []),
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
            ...(perms.edit
              ? [
                  el("button", "btn-link", {
                    type: "button",
                    textContent: "Edit",
                    onclick: () => onEdit(r),
                  }),
                ]
              : []),
            ...(perms.delete
              ? [
                  el("button", "btn-danger", {
                    type: "button",
                    textContent: "Delete",
                    onclick: () => onDelete(r.id),
                  }),
                ]
              : []),
          ),
        ),
      ),
    );
    empty.hidden = rows.length > 0;
    table.hidden = rows.length === 0;
  };
  return { main, render };
}
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

// ============================================================
// CORE APP ADAPTER (pluginloader contract v1)
// mount(container, {metadata, runtime})  ->  { contractVersion, supportedScreenTypes, render, destroy }
// ============================================================
const TYPE_MAP = {
  string: "text",
  text: "text",
  number: "number",
  int: "number",
  integer: "number",
  decimal: "number",
  date: "date",
  datetime: "date",
  textarea: "textarea",
  select: "select",
  dropdown: "select",
  lookup: "select",
};

function normalizeField(f) {
  const name = f.name ?? f.fieldName ?? f.key ?? f.field;
  const type =
    TYPE_MAP[String(f.type ?? f.fieldType ?? "text").toLowerCase()] ?? "text";
  const options = (f.options ?? f.values ?? []).map((o) =>
    typeof o === "object" && o !== null ? (o.value ?? o.label) : o,
  );
  return {
    name,
    label: f.label ?? f.displayName ?? f.title ?? name,
    type,
    required: !!(f.required ?? f.isRequired),
    options,
  };
}

// Core app context -> template metadata.
// Unga context shape vera maari irundha, inga mattum maathunga.
function normalize(context) {
  const meta = context?.metadata ?? context ?? {};
  const rawFields = meta.fields ?? meta.columns ?? context?.fields ?? [];
  return {
    screenId:
      meta.screenId ?? meta.screenKey ?? meta.screenName ?? meta.id ?? "screen",
    title: meta.title ?? meta.screenTitle ?? meta.screenName ?? "",
    fields: rawFields.map(normalizeField).filter((f) => f.name),
  };
}

// Core app permissions -> { create, edit, delete }
//
// Backend-la permission = ActionCode (Create / Read / Update / Delete / Approve),
// oru ResourceName-ku. Template inga support panra shapes:
//   1. ["Create", "Update"]                              (ActionCode list)
//   2. [{ actionCode: "Create" }, ...]                   (PermissionDefinition list)
//   3. [{ actionCode: "Delete", isAllowed: false }, ...] (RoleAccessAction maari)
//   4. { canCreate: true, canEdit: true, canDelete: false }
//   5. { allowedActions: [...] }                         (AdminNavigationItem maari)
// Core app context.permissions (illana metadata.permissions / allowedActions) kudukkanum.
// Permission kudukkalaina Add / Edit / Delete edhuvum kaattaadhu (console-la warning varum).
function readPermissions(context) {
  const meta = context?.metadata ?? {};
  let src =
    context?.permissions ??
    meta.permissions ??
    context?.runtime?.permissions ??
    context?.allowedActions ??
    meta.allowedActions ??
    null;

  // { allowedActions: [...] } / { actions: [...] } wrapper
  if (src && !Array.isArray(src) && typeof src === "object") {
    const inner =
      src.allowedActions ??
      src.AllowedActions ??
      src.actions ??
      src.permissions;
    if (Array.isArray(inner)) src = inner;
  }

  if (!src || typeof src !== "object") {
    console.warn(
      "[crud template] permissions kidaikkala, Add/Edit/Delete hide aagudhu.",
    );
    return { ...NONE_ALLOWED };
  }

  const flags = {};
  if (Array.isArray(src)) {
    src.forEach((p) => {
      if (typeof p === "string") {
        flags[p.trim().toLowerCase()] = true;
      } else if (p && typeof p === "object") {
        const code = p.actionCode ?? p.ActionCode ?? p.action ?? p.code;
        const allowed = p.isAllowed ?? p.IsAllowed ?? true;
        if (code) flags[String(code).trim().toLowerCase()] = allowed !== false;
      }
    });
  } else {
    Object.entries(src).forEach(([k, v]) => {
      if (typeof v === "boolean") flags[k.toLowerCase()] = v;
    });
  }

  const pick = (names) => names.some((n) => flags[n] === true);
  return {
    create: pick(["cancreate", "create", "canadd", "add", "insert"]),
    edit: pick(["canedit", "edit", "canupdate", "update", "modify"]),
    delete: pick(["candelete", "delete", "canremove", "remove"]),
  };
}

function pickRuntime(context) {
  const rt = context?.runtime ?? {};
  const out = {};
  if (
    typeof rt.storage?.list === "function" &&
    typeof rt.storage?.save === "function"
  )
    out.storage = rt.storage;
  if (typeof rt.toast === "function") out.toast = rt.toast;
  return out;
}

export function createRenderer(mount, supportedScreenTypes) {
  let instance = null;
  return {
    contractVersion: 1,
    supportedScreenTypes,
    render(context) {
      instance?.destroy();
      const container = document.createElement("div");
      container.className = "vc-host";
      instance = mount(container, {
        metadata: {
          ...normalize(context),
          permissions: readPermissions(context),
        },
        runtime: pickRuntime(context),
      });
      return container;
    },
    destroy() {
      instance?.destroy();
      instance = null;
    },
  };
}
