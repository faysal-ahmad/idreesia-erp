import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from '/imports/ui/controls';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

const VisitorName = ({ visitor, onVisitorNameClicked }) => {
  const [showDialog, setShowDialog] = useState(false);
  if (!visitor) return null;

  const nameNode = onVisitorNameClicked ? (
    <div
      onClick={() => {
        onVisitorNameClicked(visitor);
      }}
    >
      {visitor.name}
    </div>
  ) : (
    <Link to={`${paths.karkunsPath}/${visitor._id}`}>{visitor.name}</Link>
  );

  let imageUrl;
  let avatarNode = <Avatar shape="square" size="large" icon="user" />;
  if (visitor.imageId) {
    imageUrl = getDownloadUrl(visitor.imageId);
    avatarNode = (
      <Avatar
        shape="square"
        size="large"
        src={imageUrl}
        onClick={() => {
          setShowDialog(true);
        }}
      />
    );
  }

  return (
    <>
      <div style={NameDivStyle}>
        {avatarNode}
        &nbsp;&nbsp;
        {nameNode}
      </div>
      <Modal
        title={visitor.name}
        visible={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        <img src={imageUrl} />
      </Modal>
    </>
  );
};

VisitorName.propTypes = {
  visitor: PropTypes.object,
  onVisitorNameClicked: PropTypes.func,
};

export default VisitorName;
