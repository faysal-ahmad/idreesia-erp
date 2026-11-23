import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Select } from 'antd';

import PAGED_USERS from '../users/gql/paged-users';

interface UserFilterSelectProps {
  value?: string;
  onChange?: (userId: string | undefined, label?: string) => void;
}

/** A searchable user picker; the search matches the user or display name. */
const UserFilterSelect = ({ value, onChange }: UserFilterSelectProps) => {
  const [search, setSearch] = useState('');
  const { data, loading } = useQuery(PAGED_USERS, {
    variables: {
      filter: {
        name: search || undefined,
        showLocked: 'true',
        showUnlocked: 'true',
        showActive: 'true',
        showInactive: 'true',
        pageIndex: '0',
        pageSize: '50',
      },
    },
  });

  const options = (data?.pagedUsers?.data ?? [])
    .filter((user): user is NonNullable<typeof user> & { _id: string } => user?._id != null)
    .map((user) => ({
      value: user._id,
      label: user.displayName ? `${user.displayName} (${user.username})` : (user.username ?? ''),
    }));

  return (
    <Select
      showSearch
      allowClear
      filterOption={false}
      loading={loading}
      placeholder="All users"
      value={value}
      options={options}
      style={{ width: '100%' }}
      onSearch={setSearch}
      onChange={(next) => onChange?.(next, options.find((option) => option.value === next)?.label)}
    />
  );
};

export default UserFilterSelect;
