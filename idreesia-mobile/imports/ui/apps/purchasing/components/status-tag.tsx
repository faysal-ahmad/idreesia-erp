import React from 'react';
import { Tag } from 'antd-mobile';

import { statusColor, statusLabel } from '../format';

export const StatusTag = ({ status }: { status?: string | null }) =>
  status ? (
    <Tag color={statusColor(status)} fill="outline">
      {statusLabel(status)}
    </Tag>
  ) : null;
