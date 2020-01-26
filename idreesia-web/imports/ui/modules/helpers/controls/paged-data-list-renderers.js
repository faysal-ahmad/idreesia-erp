import React from 'react';
import { Link } from 'react-router-dom';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar } from '/imports/ui/controls';

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

export function getNameWithImageRenderer(
  id,
  imageId,
  name,
  path,
  iconToUse = 'user'
) {
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
      <Avatar shape="square" size="large" icon={iconToUse} />
      &nbsp;
      <Link to={path}>{name}</Link>
    </div>
  );
}
