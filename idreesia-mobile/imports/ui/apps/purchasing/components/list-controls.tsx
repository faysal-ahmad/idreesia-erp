import React, { type ReactNode, useEffect, useState } from 'react';
import { Badge, Popup, SearchBar, Selector, Tag } from 'antd-mobile';
import { CloseOutline, FilterOutline } from 'antd-mobile-icons';

import { statusLabel } from '../format';

const SEARCH_DEBOUNCE_MS = 350;

export interface FilterChip {
  label: string;
  onClear: () => void;
}

interface Options {
  /** Status values the list can be narrowed to; leave out for a list with no status. */
  statuses?: string[];
  initialStatus?: string;
  placeholder: string;
  /** Other active filters (e.g. "Overdue"), shown as chips beside the status. */
  extraChips?: FilterChip[];
}

/**
 * The search box, status filter (a bottom Popup from a nav bar icon, with the
 * active filters as chips under the search bar) shared by Purchasing lists,
 * as described in docs/ui-design-guidelines/mobile-ui-design-guidelines.md.
 */
export const useListControls = ({ statuses, initialStatus, placeholder, extraChips = [] }: Options) => {
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(initialStatus);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(text.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const chips: FilterChip[] = [
    ...(status ? [{ label: statusLabel(status), onClear: () => setStatus(undefined) }] : []),
    ...extraChips,
  ];

  /** The filter icon, for the nav bar's `right` slot (inside .page-nav-actions). */
  const filterAction: ReactNode = (
    <Badge content={chips.length > 0 ? chips.length : null}>
      <FilterOutline aria-label="Filter" className="page-nav-action" onClick={() => setOpen(true)} />
    </Badge>
  );

  const toolbar = (
    <>
      <div className="list-toolbar">
        <SearchBar
          clearable
          placeholder={placeholder}
          value={text}
          onChange={setText}
          onClear={() => setSearch('')}
          onSearch={() => setSearch(text.trim())}
        />
        {chips.length > 0 && (
          <div className="purchasing-chips">
            {chips.map(chip => (
              <Tag key={chip.label} color="primary" fill="outline" round onClick={chip.onClear}>
                {chip.label} <CloseOutline />
              </Tag>
            ))}
          </div>
        )}
      </div>
      {statuses && (
        <Popup position="bottom" visible={open} onClose={() => setOpen(false)} onMaskClick={() => setOpen(false)}>
          <div className="purchasing-filter-popup">
            <h3 className="purchasing-section-title">Status</h3>
            <Selector
              columns={2}
              options={statuses.map(value => ({ label: statusLabel(value), value }))}
              value={status ? [status] : []}
              onChange={selected => {
                setStatus(selected[0]);
                setOpen(false);
              }}
            />
          </div>
        </Popup>
      )}
    </>
  );

  return { search: search || undefined, status, filterAction, toolbar };
};
