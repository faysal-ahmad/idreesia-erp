import type { TypedDocumentNode } from '@apollo/client';

import type { PageParams } from '/imports/ui/modules/hr-karkuns/karkuns/list/list-filter';

/** A person as every picker search returns them (PickerPersonType). */
export interface PickerPerson {
  _id: string;
  name?: string | null;
  parentName?: string | null;
  cnicNumber?: string | null;
  contactNumber1?: string | null;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  hasUserAccount?: boolean | null;
}

/** A page of a picker search (PagedPickerPersonType). */
export interface PickerPersonPage {
  data?: ReadonlyArray<PickerPerson | null> | null;
  totalResults?: number | null;
}

/** What the person typed in the picker's filter. */
export interface PersonPickerFilter {
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
}

/** Partial filter/paging updates, the same shape the HR karkuns list uses. */
export type PersonPickerPageParams = PageParams;

/**
 * Where a picker gets its people from: one of the paged…Karkuns queries, which
 * decides on the server who may be listed. The picker adds the filter and
 * paging variables; `variables` holds the scope the caller fixes (locationId,
 * committeeId, ...).
 */
export interface PersonSearchSource<TData = any> {
  query: TypedDocumentNode<TData, any>;
  /** Reads the page out of the query result. */
  select(data: TData): PickerPersonPage | null | undefined;
  variables?: Record<string, unknown>;
  /** Who the query lists, shown in the drawer's info tooltip. */
  description?: string;
}

/** The value a picker field holds in a form. */
export interface PickedPerson {
  _id: string;
  name?: string | null;
}
