import React, { type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar } from 'antd';

const NameDivStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

const RouterLink = Link as any;

export function getNameWithImageRenderer(
  id: string,
  imageId: string | undefined,
  name: React.ReactNode,
  path: string,
  iconToUse?: React.ReactNode
) {
  if (imageId) {
    const url = getDownloadUrl(imageId);
    return (
      <div style={NameDivStyle}>
        <Avatar shape="square" size="large" src={url} />
        &nbsp;
        <RouterLink to={path}>{name}</RouterLink>
      </div>
    );
  }

  return (
    <div style={NameDivStyle}>
      <Avatar
        shape="square"
        size="large"
        icon={iconToUse || <UserOutlined />}
      />
      &nbsp;
      <RouterLink to={path}>{name}</RouterLink>
    </div>
  );
}
