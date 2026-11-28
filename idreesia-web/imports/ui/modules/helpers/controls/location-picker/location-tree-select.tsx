import React, { useMemo, type CSSProperties } from 'react';
import { Tag, TreeSelect } from 'antd';

import {
  ORG_LOCATION_TYPE_COLORS,
  ORG_LOCATION_TYPE_LABELS,
} from '/imports/ui/modules/admin/org-locations/org-location-types';

import { buildLocationTree } from './build-location-tree';
import type { ExtraLocationOption, PickerLocation } from './types';

export interface LocationTreeSelectProps {
  /** The locations to show; their ancestors should be included for context. */
  locations: PickerLocation[];
  /** Location types that can be picked; others are shown but not selectable. */
  selectableTypes?: string[];
  /** A finer rule than selectableTypes, e.g. only locations with a workspace. */
  isSelectable?(location: PickerLocation): boolean;
  /** Entries shown after the tree, e.g. "No Location". */
  extraOptions?: ExtraLocationOption[];
  value?: string | null;
  onChange?(locationId: string, location: PickerLocation | undefined): void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  style?: CSSProperties;
}

/**
 * A searchable tree of organization locations, each row tagged with its type.
 * Presentational: the caller passes the locations (see useReferenceLocations)
 * and says which can be picked.
 */
const LocationTreeSelect = ({
  locations,
  selectableTypes,
  isSelectable,
  extraOptions,
  value,
  onChange,
  placeholder = 'Select location',
  disabled,
  loading,
  allowClear,
  style,
}: LocationTreeSelectProps) => {
  const treeData = useMemo(
    () =>
      buildLocationTree(
        locations,
        location =>
          (!selectableTypes ||
            selectableTypes.includes(location.type as string)) &&
          (!isSelectable || isSelectable(location)),
        extraOptions
      ),
    [locations, selectableTypes, isSelectable, extraOptions]
  );
  const byId = useMemo(
    () => new Map(locations.map(location => [location._id, location])),
    [locations]
  );

  return (
    <TreeSelect
      style={{ width: '100%', ...style }}
      placeholder={placeholder}
      value={value ?? undefined}
      treeData={treeData}
      onChange={(id: string) => onChange?.(id, byId.get(id))}
      disabled={disabled}
      loading={loading}
      allowClear={allowClear}
      treeDefaultExpandAll
      // The dropdown may be wider than the field, so deep locations fit.
      popupMatchSelectWidth={false}
      // antd caps the list at 256px by default; use the screen space the
      // dropdown has below the selector instead.
      listHeight={Math.max(256, window.innerHeight - 220)}
      styles={{ popup: { root: { minWidth: 360, maxWidth: '90vw' } } }}
      showSearch
      treeNodeFilterProp="title"
      // The type pill sits at the right of each row; the title stays plain
      // text for the search and the selected value.
      treeTitleRender={treeNode => {
        const node = treeNode as { title?: unknown; locationType?: string };
        const type = node.locationType as
          | keyof typeof ORG_LOCATION_TYPE_LABELS
          | undefined;
        return (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span>{node.title as string}</span>
            {type && ORG_LOCATION_TYPE_LABELS[type] ? (
              <Tag color={ORG_LOCATION_TYPE_COLORS[type]} style={{ marginInlineEnd: 0 }}>
                {ORG_LOCATION_TYPE_LABELS[type]}
              </Tag>
            ) : null}
          </span>
        );
      }}
    />
  );
};

export default LocationTreeSelect;
