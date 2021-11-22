import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UserOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from 'antd';

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

const PersonName = ({ person, onPersonNameClicked, showLargeImage }) => {
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
  let avatarNode = (
    <Avatar
      shape="square"
      size="large"
      style={
        showLargeImage
          ? { height: '80px', width: '80px', fontSize: '60px' }
          : {}
      }
      icon={<UserOutlined />}
    />
  );
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

  if (person.image) {
    avatarNode = (
      <img
        src={`data:image/jpeg;base64,${person.image.data}`}
        style={
          showLargeImage
            ? { height: '80px', width: '80px', borderRadius: '10%' }
            : { height: '40px', width: '40px', borderRadius: '10%' }
        }
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
  showLargeImage: PropTypes.bool,
  onPersonNameClicked: PropTypes.func,
  person: PropTypes.shape({
    name: PropTypes.string.isRequired,
    imageId: PropTypes.string,
    image: PropTypes.object,
  }),
};

PersonName.defaultProps = {
  showLargeImage: false,
  onPersonNameClicked: noop,
};

export default PersonName;
