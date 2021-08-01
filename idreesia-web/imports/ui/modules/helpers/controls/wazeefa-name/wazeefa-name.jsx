import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ReadOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { find } from 'meteor/idreesia-common/utilities/lodash';
import { Avatar, Modal } from '/imports/ui/controls';

import WazeefaPreview from './wazeefa-preview';

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

const WazeefaName = ({ wazeefa, onWazeefaNameClicked }) => {
  const [showDialog, setShowDialog] = useState(false);
  if (!wazeefa) return null;

  const nameNode = onWazeefaNameClicked ? (
    <div
      onClick={() => {
        onWazeefaNameClicked(wazeefa);
      }}
    >
      {wazeefa.name}
    </div>
  ) : (
    <span>{wazeefa.name}</span>
  );

  let imageUrl;
  let avatarNode = <Avatar shape="square" size="large" icon={<ReadOutlined />} />;
  if (wazeefa.images && wazeefa.images.length > 0) {
    imageUrl = getDownloadUrl(wazeefa.images[0]._id);
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

  const getSortedImages = () => {
    const { imageIds, images } = wazeefa;
    return (imageIds || []).map(imageId =>
      find(images, ({ _id }) => _id === imageId)
    );
  };

  return (
    <>
      <div style={NameDivStyle}>
        {avatarNode}
        &nbsp;&nbsp;
        {nameNode}
      </div>
      <Modal
        title={wazeefa.name}
        visible={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        <WazeefaPreview images={getSortedImages()} />
      </Modal>
    </>
  );
};

WazeefaName.propTypes = {
  onWazeefaNameClicked: PropTypes.func,
  wazeefa: PropTypes.shape({
    name: PropTypes.string.isRequired,
    imageIds: PropTypes.array,
    images: PropTypes.array,
  }),
};

export default WazeefaName;
