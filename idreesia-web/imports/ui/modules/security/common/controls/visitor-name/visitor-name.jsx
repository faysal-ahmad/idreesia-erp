import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from '/imports/ui/controls';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

const ContainerDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

const TextDivStyle = {
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'flex-start',
  width: '100%',
};

const VisitorName = ({ visitor, additionalInfo, onVisitorNameClicked }) => {
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
    <Link to={`${paths.visitorRegistrationPath}/${visitor._id}`}>
      {visitor.name}
    </Link>
  );

  const additionalInfoNode = additionalInfo ? (
    <span>{additionalInfo}</span>
  ) : null;

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
      <div style={ContainerDivStyle}>
        {avatarNode}
        &nbsp;&nbsp;
        <div style={TextDivStyle}>
          {nameNode}
          {additionalInfoNode}
        </div>
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
  additionalInfo: PropTypes.string,
  onVisitorNameClicked: PropTypes.func,
};

export default VisitorName;
