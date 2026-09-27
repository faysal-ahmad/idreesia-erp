import React, { useEffect, useState } from 'react';
import { Button, CheckList, Popup, SearchBar, Tabs } from 'antd-mobile';

export interface VisitorFilters {
  city?: string;
  tagId?: string;
}

interface Props {
  visible: boolean;
  value: VisitorFilters;
  cities: string[];
  tags: Array<{ _id: string; name: string }>;
  onApply: (value: VisitorFilters) => void;
  onClose: () => void;
}

/** Bottom sheet with the list's filters; changes apply together on "Apply". */
export const VisitorFiltersPopup = ({ visible, value, cities, tags, onApply, onClose }: Props) => {
  const [draft, setDraft] = useState<VisitorFilters>(value);
  const [citySearch, setCitySearch] = useState('');

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setCitySearch('');
    }
  }, [visible, value]);

  const matchingCities = citySearch
    ? cities.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()))
    : cities;

  // CheckList is multi-select by nature; these filters take one value, and
  // tapping the selected value again clears it.
  const single = (next: string[], current?: string) =>
    next.find(item => item !== current) ?? undefined;

  return (
    <Popup
      bodyClassName="filters-popup"
      destroyOnClose
      visible={visible}
      onClose={onClose}
      onMaskClick={onClose}
    >
      <Tabs className="filters-popup-tabs">
        <Tabs.Tab key="city" title={draft.city ? `City · ${draft.city}` : 'City'}>
          <SearchBar placeholder="Search cities" value={citySearch} onChange={setCitySearch} />
          <CheckList
            className="filters-popup-options"
            value={draft.city ? [draft.city] : []}
            onChange={next =>
              setDraft(d => ({ ...d, city: single(next as string[], d.city) }))
            }
          >
            {matchingCities.map(city => (
              <CheckList.Item key={city} value={city}>
                {city}
              </CheckList.Item>
            ))}
          </CheckList>
        </Tabs.Tab>
        <Tabs.Tab key="tag" title={draft.tagId ? 'Tag · 1' : 'Tag'}>
          <CheckList
            className="filters-popup-options"
            value={draft.tagId ? [draft.tagId] : []}
            onChange={next =>
              setDraft(d => ({ ...d, tagId: single(next as string[], d.tagId) }))
            }
          >
            {tags.map(tag => (
              <CheckList.Item key={tag._id} value={tag._id}>
                {tag.name}
              </CheckList.Item>
            ))}
          </CheckList>
        </Tabs.Tab>
      </Tabs>
      <div className="filters-popup-actions">
        <Button block fill="outline" onClick={() => setDraft({})}>
          Clear
        </Button>
        <Button block color="primary" onClick={() => onApply(draft)}>
          Apply
        </Button>
      </div>
    </Popup>
  );
};
