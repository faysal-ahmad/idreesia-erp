import React, { useState } from 'react';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Select } from 'antd';

interface RecordSelectProps {
  value?: string | null;
  onChange?: (id: string | undefined) => void;
  query: TypedDocumentNode<any, any>;
  dataKey: string;
  // Extra query variables, e.g. a status or vendor.
  variables?: Record<string, unknown>;
  // Which rows can be picked.
  filterRow?: (row: any) => boolean;
  labelOf: (row: any) => string;
  // The record already chosen, so its label shows before the list loads.
  selected?: { _id?: string | null } | null;
  placeholder: string;
  disabled?: boolean;
  allowClear?: boolean;
  style?: React.CSSProperties;
}

/** A searchable picker over a paged purchasing list (requisitions, orders...). */
const RecordSelect = ({
  value,
  onChange,
  query,
  dataKey,
  variables,
  filterRow,
  labelOf,
  selected,
  placeholder,
  disabled,
  allowClear = true,
  style,
}: RecordSelectProps) => {
  const [search, setSearch] = useState('');
  const { data, loading } = useQuery(query, {
    variables: { search: search || undefined, pageIndex: 0, pageSize: 50, ...variables },
    fetchPolicy: 'cache-and-network',
  });

  const rows = ((data?.[dataKey]?.data ?? []) as any[]).filter(
    (row) => row?._id != null && (!filterRow || filterRow(row))
  );
  const options = rows.map((row) => ({ value: row._id as string, label: labelOf(row) }));
  if (selected?._id && !options.some((o) => o.value === selected._id)) {
    options.unshift({ value: selected._id, label: labelOf(selected) });
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
      style={{ minWidth: 280, ...style }}
      onSearch={setSearch}
      onChange={(next) => onChange?.(next)}
    />
  );
};

export default RecordSelect;
