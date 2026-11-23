import React, { useEffect, useState } from 'react';
import { List, Popup, SearchBar } from 'antd-mobile';
import { useQuery } from '@apollo/client/react';

import { PageEmpty, PageError, PageLoading } from '../../../layout';
import { MOBILE_PURCHASING_PAGED_CATALOG_ITEMS } from '../gql';

export interface CatalogChoice {
  _id: string;
  name: string;
  unit: string;
  price?: number | null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (item: CatalogChoice) => void;
}

/** A searchable list of catalog items in a tall bottom sheet; the first 30 matches. */
export const CatalogPickerPopup = ({ visible, onClose, onPick }: Props) => {
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(text.trim()), 350);
    return () => clearTimeout(timer);
  }, [text]);

  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_PAGED_CATALOG_ITEMS, {
    variables: { search: search || undefined, isActive: true, pageIndex: 0, pageSize: 30 },
    skip: !visible,
  });
  const items = (data?.pagedPurchasingCatalogItems?.data ?? []).filter(
    (item): item is NonNullable<typeof item> & { _id: string } => !!item?._id
  );

  let body;
  if (loading && !data) body = <PageLoading />;
  else if (error && !data) body = <PageError error={error} onRetry={() => refetch()} />;
  else if (items.length === 0) body = <PageEmpty title="No catalog items found" />;
  else {
    body = (
      <List>
        {items.map(item => (
          <List.Item
            key={item._id}
            description={[item.unit, item.category, item.company].filter(Boolean).join(' · ')}
            onClick={() => {
              onPick({ _id: item._id, name: item.name ?? '', unit: item.unit ?? '' });
              onClose();
            }}
          >
            {item.name}
          </List.Item>
        ))}
      </List>
    );
  }

  return (
    <Popup
      bodyClassName="purchasing-picker-popup"
      destroyOnClose
      position="bottom"
      visible={visible}
      onClose={onClose}
      onMaskClick={onClose}
    >
      <div className="list-toolbar">
        <SearchBar clearable placeholder="Search the catalog" value={text} onChange={setText} />
      </div>
      <div className="purchasing-picker-body">{body}</div>
    </Popup>
  );
};
