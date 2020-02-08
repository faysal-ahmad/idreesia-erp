import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from '/imports/ui/controls';

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

const PersonName = ({ person, onPersonNameClicked }) => {
  const [showDialog, setShowDialog] = useState(false);
  if (!person) return null;

  const nameNode = onPersonNameClicked ? (
    <div
      onClick={() => {
        onPersonNameClicked(person);
      }}
    >
      {person.name}
    </div>
  ) : (
    <span>{person.name}</span>
  );

  let imageUrl;
  let avatarNode = <Avatar shape="square" size="large" icon="user" />;
  if (person.imageId) {
    imageUrl = getDownloadUrl(person.imageId);
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
        title={person.name}
        visible={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        <img src={imageUrl} style={{ maxWidth: '470px' }} />
      </Modal>
    </>
  );
};

PersonName.propTypes = {
  onPersonNameClicked: PropTypes.func,
  person: PropTypes.shape({
    name: PropTypes.string.isRequired,
    imageId: PropTypes.string,
  }),
};

export default PersonName;
