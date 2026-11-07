import React, { useState, type CSSProperties } from 'react';
import { UserOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { Avatar, Modal } from 'antd';
import ImageVectorStatusBadge from '../image-vector-status-badge/image-vector-status-badge';

interface Person {
  _id?: string | null;
  name?: string | null;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  imageVectorStatus?: string | null;
}

interface Props {
  person?: Person | null;
  onPersonNameClicked?(person: Person): void;
  showLargeImage?: boolean;
  /** Renders the photo as a plain image (no avatar or popup), for printing. */
  plainImage?: boolean;
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
  plainImage = false,
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

  const imageUrl = person.imageUrl ?? undefined;
  const avatarSrc = person.imageThumbnailUrl ?? imageUrl;
  let avatarNode = (
    <Avatar
      shape="square"
      size="large"
      style={avatarSizeStyle}
      icon={<UserOutlined />}
    />
  );
  if (avatarSrc && plainImage) {
    avatarNode = (
      <img src={avatarSrc} style={imageSizeStyle} alt={person.name} />
    );
  } else if (avatarSrc) {
    avatarNode = (
      <Avatar
        shape="square"
        size="large"
        src={avatarSrc}
        onClick={() => {
          setShowDialog(true);
        }}
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
