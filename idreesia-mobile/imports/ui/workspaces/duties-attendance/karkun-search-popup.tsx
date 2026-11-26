import React, { useEffect, useState } from 'react';
import { Avatar, List, Popup, SearchBar, Tag } from 'antd-mobile';
import { toDeviceUrl } from '/imports/startup/backend';

import { PagedList } from '../../components';
import { usePagedQuery } from '../../hooks';
import { MOBILE_DA_KARKUN_SEARCH } from './gql';

export interface PickedKarkun {
  _id: string;
  name: string;
}

interface Props {
  visible: boolean;
  locationId: string;
  title: string;
  /** Karkuns already on the list; their row shows `selectedLabel` and can't be tapped. */
  selectedIds: string[];
  selectedLabel: string;
  onPick: (karkun: PickedKarkun) => void;
  onClose: () => void;
}

const SearchList = ({ locationId, selectedIds, selectedLabel, onPick }: Omit<Props, 'visible' | 'title' | 'onClose'>) => {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  // Search on the server, once typing pauses.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 350);
    return () => clearTimeout(timer);
  }, [text]);

  // All digits is a phone number; anything else a name.
  const isPhone = /^\d+$/.test(query);
  const paged = usePagedQuery(MOBILE_DA_KARKUN_SEARCH, {
    filter: { locationId, name: isPhone ? undefined : query || undefined, phoneNumber: isPhone ? query : undefined },
    toVariables: (filter, paging) => ({ ...filter, ...paging }),
    getPage: data => data.pagedWorkspaceDaKarkuns,
    getKey: karkun => karkun._id,
  });

  return (
    <>
      <div className="list-toolbar da-karkun-search">
        <SearchBar placeholder="Search by name or phone number" value={text} onChange={setText} />
      </div>
      <PagedList
        emptyTitle="No people found"
        getKey={karkun => karkun._id ?? ''}
        itemsLabel="people"
        paged={paged}
        renderItem={karkun => {
          const selected = selectedIds.includes(karkun._id ?? '');
          return (
            <List.Item
              arrowIcon={false}
              clickable={!selected}
              description={[karkun.parentName, karkun.contactNumber1].filter(Boolean).join(' · ') || undefined}
              extra={selected ? <Tag fill="outline">{selectedLabel}</Tag> : undefined}
              prefix={<Avatar src={toDeviceUrl(karkun.imageThumbnailUrl ?? karkun.imageUrl) ?? ''} />}
              onClick={() => {
                if (!selected && karkun._id) onPick({ _id: karkun._id, name: karkun.name ?? 'This person' });
              }}
            >
              {karkun.name}
            </List.Item>
          );
        }}
      />
    </>
  );
};

/** A tall bottom sheet that searches the people the workspace can choose from. */
export const KarkunSearchPopup = ({ visible, title, onClose, ...rest }: Props) => (
  <Popup destroyOnClose bodyClassName="da-karkun-popup" position="bottom" visible={visible} onMaskClick={onClose}>
    <div className="da-popup-header">
      <span className="da-popup-title">{title}</span>
      <button className="da-popup-done" type="button" onClick={onClose}>
        Done
      </button>
    </div>
    <div className="da-karkun-body">
      <SearchList {...rest} />
    </div>
  </Popup>
);
