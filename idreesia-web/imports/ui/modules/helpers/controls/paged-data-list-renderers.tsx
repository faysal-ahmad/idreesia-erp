import React, { type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

import { Avatar } from 'antd';

const NameDivStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

export function getNameWithImageRenderer(
  id: string,
  imageUrl: string | null | undefined,
  name: React.ReactNode,
  path: string,
  iconToUse?: React.ReactNode
) {
  if (imageUrl) {
    return (
      <div style={NameDivStyle}>
        <Avatar shape="square" size="large" src={imageUrl} />
        &nbsp;
        <Link to={path}>{name}</Link>
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
      <Link to={path}>{name}</Link>
    </div>
  );
}
