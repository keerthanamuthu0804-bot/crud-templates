// ============================================================
// common.js
// Template helpers + core app adapter (pluginloader contract v1)
//
// CSS rule: templates never hardcode CSS. All class names come
// from CLS below, which maps to the core app's style.css.
// ============================================================

export const NONE_ALLOWED = { create: false, edit: false, delete: false };

// ============================================================
// DOM HELPER
// el(tag, className, props, ...children)
// ============================================================

export const el = (tag, cls, props = {}, ...kids) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  Object.assign(n, props);
  n.append(...kids);
  return n;
};

// ============================================================
// CORE CSS CLASS MAPPING (single connection to style.css)
// ============================================================

export const CLS = {
  screenCard: "screen-card",
  header: "screen-header",
  title: "screen-title",
  tableWrap: "table-container",
  table: "data-table",
  actions: "table-actions",
  empty: "empty-state",
  form: "dynamic-form",
  field: "form-field",
  label: "form-label",
  control: "form-control",
  formActions: "form-actions",
  btn: {
    primary: "primary-button",
    secondary: "secondary-button",
    danger: "danger-button",
  },
};

export const btn = (
  variant,
  text,
  fn,
  { compact = false, type = "button" } = {},
) => {
  const props = { type, textContent: text };
  if (typeof fn === "function") props.onclick = fn;
  return el(
    "button",
    (CLS.btn[variant] || CLS.btn.secondary) +
      (compact ? " compact-button" : ""),
    props,
  );
};

// ============================================================
// INPUT
// ============================================================

export const makeInput = (f, value = "") => {
  let i;
  if (f.type === "select") {
    i = el(
      "select",
      CLS.control,
      {},
      el("option", "", { value: "", textContent: "Select" }),
      ...f.options.map((o) => el("option", "", { value: o, textContent: o })),
    );
  } else if (f.type === "textarea") {
    i = el("textarea", CLS.control, { rows: 3 });
  } else {
    i = el("input", CLS.control, { type: f.type || "text" });
  }
  i.required = !!f.required;
  i.name = f.name;
  i.value = value;
  return i;
};

// ============================================================
// SETUP (rows + save/remove)
// Storage comes only from the core app (runtime.storage).
// ============================================================

export function setup(metadata, runtime = {}) {
  const store = runtime.storage;
  const toast = runtime.toast || ((m) => console.log(m));
  const key = `crud:${metadata.screenId}`;

  if (!store) {
    console.warn(
      "[crud template] runtime.storage not provided by core app; data will not be saved.",
    );
  }

  let rows = store ? store.list(key) : [];
  const persist = (next) => {
    rows = next;
    store?.save(key, rows);
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

// ============================================================
// LIST BUILDER
// ============================================================

export function buildList(metadata, { onAdd, onEdit, onDelete }) {
  const perms = metadata.permissions || NONE_ALLOWED;

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
    ...(perms.create ? [btn("primary", "Add", onAdd)] : []),
  );

  const main = el(
    "section",
    CLS.screenCard,
    {},
    header,
    el("div", CLS.tableWrap, {}, table),
    empty,
  );

  const render = (rows) => {
    tbody.replaceChildren(
      ...rows.map((r) =>
        el(
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
              ? [btn("secondary", "Edit", () => onEdit(r), { compact: true })]
              : []),
            ...(perms.delete
              ? [
                  btn("danger", "Delete", () => onDelete(r.id), {
                    compact: true,
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

// ============================================================
// FORM BUILDER
// ============================================================

export function buildForm(metadata, { onSubmit, onCancel }) {
  const inputs = {};
  const form = el("form", CLS.form);

  metadata.fields.forEach((f) => {
    const i = makeInput(f);
    inputs[f.name] = i;
    form.append(
      el(
        "div",
        CLS.field,
        {},
        el("label", CLS.label, {
          textContent: f.label + (f.required ? " *" : ""),
        }),
        i,
      ),
    );
  });

  form.append(
    el(
      "div",
      CLS.formActions,
      {},
      btn("primary", "Save", null, { type: "submit" }),
      btn("secondary", "Cancel", onCancel),
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
// mount(container, {metadata, runtime})
//   -> { contractVersion, supportedScreenTypes, render, destroy }
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

// Core app context -> template metadata
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
// Backend permission = ActionCode (Create / Read / Update / Delete / Approve).
// Supported shapes:
//   1. ["Create", "Update"]                              (ActionCode list)
//   2. [{ actionCode: "Create" }, ...]                   (PermissionDefinition list)
//   3. [{ actionCode: "Delete", isAllowed: false }, ...] (RoleAccessAction style)
//   4. { canCreate: true, canEdit: true, canDelete: false }
//   5. { allowedActions: [...] }                         (AdminNavigationItem style)
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
      "[crud template] No permissions found in context; all actions disabled.",
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
