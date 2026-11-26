/** A location as a location picker needs it (ReferenceOrgLocationType). */
export interface PickerLocation {
  _id: string;
  name?: string | null;
  type?: string | null;
  parentId?: string | null;
}

/** An extra entry shown after the tree, e.g. "No Location". */
export interface ExtraLocationOption {
  value: string;
  title: string;
}
