import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UserOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from 'antd';

const AntAvatar = Avatar as any;
const AntModal = Modal as any;
const AntUserOutlined = UserOutlined as any;
interface Person { _id: string; name: string; imageId?: string; image?: { data?: string }; }
interface Props { person?: Person | null; onPersonNameClicked?(person: Person): void; showLargeImage?: boolean; }

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

const PersonName = ({ person, onPersonNameClicked, showLargeImage }: Props) => {
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

  let imageUrl: string | undefined;
  let avatarNode = (
    <AntAvatar
      shape="square"
      size="large"
      style={(
        showLargeImage
          ? { height: '80px', width: '80px', fontSize: '60px' }
          : {}
      ) as any}
      icon={<AntUserOutlined />}
    />
  );
  if (person.imageId) {
    imageUrl = getDownloadUrl(person.imageId) ?? undefined;
    avatarNode = (
      <AntAvatar
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
        style={(
          showLargeImage
            ? { height: '80px', width: '80px', borderRadius: '10%' }
            : { height: '40px', width: '40px', borderRadius: '10%' }
        ) as any}
        alt={person.name}
      />
    );
  }

  return (
    <>
      <div style={NameDivStyle as any}>
        {avatarNode}
        &nbsp;&nbsp;
        {nameNode}
      </div>
      <AntModal
        title={person.name}
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        {imageUrl ? <img src={imageUrl} style={{ maxWidth: '470px' }} alt={person.name} /> : null}
      </AntModal>
    </>
  );
};

PersonName.propTypes = {
  showLargeImage: PropTypes.bool,
  onPersonNameClicked: PropTypes.func,
  person: PropTypes.shape({
    _id: PropTypes.string.isRequired,
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
