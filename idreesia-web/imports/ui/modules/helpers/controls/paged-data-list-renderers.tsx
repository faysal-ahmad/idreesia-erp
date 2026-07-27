import React from 'react';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar } from 'antd';

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

const RouterLink = Link as any;
const AntAvatar = Avatar as any;
const AntUserOutlined = UserOutlined as any;

export function getNameWithImageRenderer(id: string, imageId: string | undefined, name: React.ReactNode, path: string, iconToUse?: React.ReactNode) {
  if (imageId) {
    const url = getDownloadUrl(imageId);
    return (
      <div style={NameDivStyle as any}>
        <AntAvatar shape="square" size="large" src={url} />
        &nbsp;
        <RouterLink to={path}>{name}</RouterLink>
      </div>
    );
  }

  return (
    <div style={NameDivStyle as any}>
      <AntAvatar
        shape="square"
        size="large"
        icon={iconToUse || <AntUserOutlined />}
      />
      &nbsp;
      <RouterLink to={path}>{name}</RouterLink>
    </div>
  );
}
