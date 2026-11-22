import React, { useMemo, useState } from 'react';
import { Badge, Popup, SearchBar } from 'antd-mobile';
import { CheckOutline, CloseOutline, DownOutline, LocationOutline, SearchOutline } from 'antd-mobile-icons';

import type { LocationRow } from './use-workspace-locations';

// Same type names as the web's Locations screen.
const TYPE_LABELS: Record<string, string> = {
  country: 'Country',
  group: 'Zone',
  city: 'City',
  mehfil: 'Mehfil',
};

interface Props {
  locations: LocationRow[];
  selectedId: string;
  onChange: (locationId: string) => void;
  /** Unread notifications per location id; locations without any are omitted. */
  unreadByLocation: Map<string, number>;
}

/**
 * The Workspaces tab's location bar (styled like a section heading) and the
 * bottom sheet that picks the location: a searchable, indented tree.
 */
export const LocationPicker = ({ locations, selectedId, onChange, unreadByLocation }: Props) => {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const selected = locations.find(location => location.id === selectedId);
  const parentPath = selected ? selected.path.split(' › ').slice(0, -1).join(' › ') : '';

  // Like the web's Locations screen: keep the rows whose name matches, with
  // their descendants (a matching city still lists its mehfils) and their
  // ancestors (a match always shows where it sits), still as an indented tree.
  const rows = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return locations;
    const keep = new Set<string>();
    const stack: LocationRow[] = [];
    let matchedDepth: number | null = null;
    locations.forEach(location => {
      stack.length = location.depth;
      if (matchedDepth !== null && location.depth <= matchedDepth) matchedDepth = null;
      const matches = location.name.toLowerCase().includes(text);
      if (matches && matchedDepth === null) matchedDepth = location.depth;
      if (matches || matchedDepth !== null) {
        keep.add(location.id);
        if (matches) stack.forEach(ancestor => keep.add(ancestor.id));
      }
      stack[location.depth] = location;
    });
    return locations.filter(location => keep.has(location.id));
  }, [locations, query]);

  const close = () => {
    setVisible(false);
    setSearchOpen(false);
    setQuery('');
  };

  const toggleSearch = () => {
    setSearchOpen(open => !open);
    setQuery('');
  };

  return (
    <>
      <button type="button" className="collapsible-section-header location-bar" onClick={() => setVisible(true)}>
        <LocationOutline className="location-bar-icon" />
        <span className="location-bar-text">
          <span className="location-bar-name">{selected?.name ?? 'Select location'}</span>
          {parentPath ? <span className="location-bar-parent">{parentPath}</span> : null}
        </span>
        <DownOutline />
      </button>
      <Popup
        visible={visible}
        onMaskClick={close}
        onClose={close}
        position="bottom"
        bodyClassName={searchOpen ? 'location-popup location-popup-searching' : 'location-popup'}
      >
        <div className="location-popup-header">
          <span className="location-popup-title">Select location</span>
          <button
            type="button"
            aria-label={searchOpen ? 'Close search' : 'Search locations'}
            className="location-popup-search-button"
            onClick={toggleSearch}
          >
            {searchOpen ? <CloseOutline /> : <SearchOutline />}
          </button>
        </div>
        {searchOpen && (
          <div className="location-popup-search">
            <SearchBar placeholder="Search locations" value={query} onChange={setQuery} />
          </div>
        )}
        <div className="location-popup-list">
          {rows.map(location => {
            const active = location.id === selectedId;
            const unread = unreadByLocation.get(location.id);
            return (
              <button
                key={location.id}
                type="button"
                disabled={!location.selectable}
                className={`location-row${active ? ' location-row-active' : ''}`}
                style={{ paddingLeft: 16 + location.depth * 20 }}
                onClick={() => {
                  onChange(location.id);
                  close();
                }}
              >
                <span className="location-row-text">
                  <span className="location-row-title">
                    <span className="location-row-name">{location.name}</span>
                    {active ? <CheckOutline className="location-row-check" /> : null}
                  </span>
                </span>
                {TYPE_LABELS[location.type] ? (
                  <span className={`location-type-pill location-type-${location.type}`}>
                    {TYPE_LABELS[location.type]}
                  </span>
                ) : null}
                {unread ? <Badge className="workspaces-badge" content={unread} /> : null}
              </button>
            );
          })}
          {rows.length === 0 ? <div className="location-popup-empty">No matching locations.</div> : null}
        </div>
      </Popup>
    </>
  );
};
