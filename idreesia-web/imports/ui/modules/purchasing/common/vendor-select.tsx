import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Select } from 'antd';

import { PAGED_PURCHASING_VENDORS } from '../vendors/gql';

interface VendorSelectProps {
  value?: string | null;
  onChange?: (vendorId: string | undefined) => void;
  disabled?: boolean;
  /** Also offer inactive vendors (for filters, not for new documents). */
  includeInactive?: boolean;
  /** The vendor already chosen, so its name shows before the list loads. */
  selected?: { _id?: string | null; name?: string | null } | null;
  placeholder?: string;
  allowClear?: boolean;
  style?: React.CSSProperties;
}

/** A searchable vendor picker backed by the vendor list. */
const VendorSelect = ({
  value,
  onChange,
  disabled,
  includeInactive = false,
  selected,
  placeholder = 'Select a vendor',
  allowClear = true,
  style,
}: VendorSelectProps) => {
  const [search, setSearch] = useState('');
  const { data, loading } = useQuery(PAGED_PURCHASING_VENDORS, {
    variables: {
      search: search || undefined,
      isActive: includeInactive ? undefined : true,
      pageIndex: 0,
      pageSize: 50,
    },
    fetchPolicy: 'cache-and-network',
  });

  const options = (data?.pagedPurchasingVendors?.data ?? [])
    .filter((v): v is NonNullable<typeof v> & { _id: string } => v?._id != null)
    .map((v) => ({ value: v._id, label: v.name ?? '' }));
  if (selected?._id && !options.some((o) => o.value === selected._id)) {
    options.unshift({ value: selected._id, label: selected.name ?? '' });
  }

  return (
    <Select
      showSearch
      allowClear={allowClear}
      filterOption={false}
      value={value ?? undefined}
      options={options}
      loading={loading}
      disabled={disabled}
      placeholder={placeholder}
      style={{ minWidth: 240, ...style }}
      onSearch={setSearch}
      onChange={(next) => onChange?.(next)}
    />
  );
};

export default VendorSelect;
