export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "decimal"
  | "boolean"
  | "select"
  | "relation"
  | "file"
  | "date";

export interface StaticOption {
  value: string;
  label: string;
}

export interface ResourceField {
  /** Must match the Laravel Form Request's field name exactly. */
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  helpText?: string;
  /** For type "select": a fixed list of choices. */
  options?: StaticOption[];
  /** For type "relation": which resource to pull options from, and which field to show. */
  relation?: { configKey: string; labelField: string };
  /** For type "file": the input's `accept` attribute. */
  accept?: string;
  /** For type "file": the record field holding the current file's URL, for a preview. */
  currentUrlField?: string;
}

export interface ResourceColumn {
  /** Dot-path into the record, e.g. "category.name". */
  key: string;
  label: string;
  type?: "text" | "boolean" | "image" | "price" | "date";
}

export interface ResourceConfig {
  /** Used in the admin app's own URLs (/[key], /[key]/new, /[key]/[record]). */
  key: string;
  label: string;
  singularLabel: string;
  /** API URI segment under /api/, e.g. "products" -> /api/products. */
  endpoint: string;
  paginated: boolean;
  /** Rows per page in the admin list (default 20). */
  pageSize?: number;
  /** Which record field identifies it in the API path (route model binding key). */
  recordKey: "id" | "slug";
  columns: ResourceColumn[];
  fields: ResourceField[];
  /** This resource has a `status` toggle and a public index that hides disabled rows by default. */
  supportsInactiveToggle?: boolean;
  /** Query param the API expects to opt into seeing inactive/draft rows — defaults to "include_inactive". */
  inactiveParam?: string;
  /**
   * Enables a "filter by <relation>" dropdown in the list toolbar. `field`
   * is the dot-path to the embedded relation object on each row (e.g.
   * "category"); options are derived from the rows actually returned, so
   * no extra request is needed. `labelField` defaults to "name".
   */
  relationFilter?: { field: string; label: string; labelField?: string };
  /**
   * Adds a one-click star toggle in the row actions, flipping a boolean
   * field via PUT without opening the edit form. `field` must also be a
   * boolean field in `fields`/`columns` so the edit form stays in sync.
   * `queryParam` is the API's filter query param for counting how many are
   * currently on (defaults to `field`); `max` caps how many can be on at
   * once — turning one on past the cap is rejected with an error.
   */
  featuredToggle?: { field: string; queryParam?: string; max?: number; onLabel: string; offLabel: string };
}
