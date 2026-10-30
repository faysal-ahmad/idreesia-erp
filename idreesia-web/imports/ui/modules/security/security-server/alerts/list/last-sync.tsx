import React from 'react';
import { Tooltip, Typography } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

import { formatDateTime } from '../../common/format';

const { Text } = Typography;

// The security server checks in about once a minute (after every alert push
// run), so a few missed check-ins mean it is down or can't reach the ERP.
const STALE_AFTER_MINUTES = 5;

interface Props {
  // Epoch millis, as GraphQL returns dates; null before the first check-in.
  lastSyncedAt: string | null | undefined;
}

/** When the security server last got through to the ERP with its alerts. */
const LastSync = ({ lastSyncedAt }: Props) => {
  if (!lastSyncedAt) {
    return <Text type="secondary">Security server has not synced yet</Text>;
  }

  const minutesAgo = Math.floor(
    (Date.now() - Number(lastSyncedAt)) / 60_000
  );
  const label = `Last synced ${formatDateTime(lastSyncedAt)}`;
  if (minutesAgo < STALE_AFTER_MINUTES) {
    return <Text type="secondary">{label}</Text>;
  }

  return (
    <Tooltip
      title={`No contact from the security server for ${minutesAgo} minutes. Alerts raised since then haven't arrived yet.`}
    >
      <Text type="warning">
        <WarningOutlined /> {label}
      </Text>
    </Tooltip>
  );
};

export default LastSync;
