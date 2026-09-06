import React, { useState, type CSSProperties } from 'react';
import { UserOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from 'antd';
import ImageVectorStatusBadge from '../image-vector-status-badge/image-vector-status-badge';

interface Person {
  _id?: string | null;
  name?: string | null;
  imageId?: string | null;
  imageVectorStatus?: string | null;
  image?: { data?: string };
}

interface Props {
  person?: Person | null;
  onPersonNameClicked?(person: Person): void;
  showLargeImage?: boolean;
}

const NameDivStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

const PersonName = ({
  person,
  onPersonNameClicked = noop,
  showLargeImage = false,
}: Props) => {
  const [showDialog, setShowDialog] = useState(false);
  if (!person || !person._id || !person.name) return null;

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

  const avatarSizeStyle: CSSProperties = showLargeImage
    ? { height: '80px', width: '80px', fontSize: '60px' }
    : {};

  const imageSizeStyle: CSSProperties = showLargeImage
    ? { height: '80px', width: '80px', borderRadius: '10%' }
    : { height: '40px', width: '40px', borderRadius: '10%' };

  let imageUrl: string | undefined;
  let avatarNode = (
    <Avatar
      shape="square"
      size="large"
      style={avatarSizeStyle}
      icon={<UserOutlined />}
    />
  );
  if (person.imageId) {
    imageUrl = getDownloadUrl(person.imageId) ?? undefined;
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
        style={imageSizeStyle}
        alt={person.name}
      />
    );
  }

  return (
    <>
      <div style={NameDivStyle}>
        <ImageVectorStatusBadge status={person.imageVectorStatus}>
          {avatarNode}
        </ImageVectorStatusBadge>
        &nbsp;&nbsp;
        {nameNode}
      </div>
      <Modal
        title={person.name}
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        {imageUrl ? <img src={imageUrl} style={{ maxWidth: '470px' }} alt={person.name} /> : null}
      </Modal>
    </>
  );
};

export default PersonName;
