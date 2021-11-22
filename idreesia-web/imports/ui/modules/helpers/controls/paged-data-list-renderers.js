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

export function getNameWithImageRenderer(id, imageId, name, path, iconToUse) {
  if (imageId) {
    const url = getDownloadUrl(imageId);
    return (
      <div style={NameDivStyle}>
        <Avatar shape="square" size="large" src={url} />
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
