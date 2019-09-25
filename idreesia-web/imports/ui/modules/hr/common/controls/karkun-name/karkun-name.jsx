import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Avatar, Modal } from 'antd';

import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { getDownloadUrl } from '/imports/ui/modules/helpers/misc';

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

const KarkunName = ({ karkun, onKarkunNameClicked }) => {
  const [showDialog, setShowDialog] = useState(false);
  if (!karkun) return null;

  const nameNode = onKarkunNameClicked ? (
    <div
      onClick={() => {
        onKarkunNameClicked(karkun);
      }}
    >
      {karkun.name}
    </div>
  ) : (
    <Link to={`${paths.karkunsPath}/${karkun._id}`}>{karkun.name}</Link>
  );

  let imageUrl;
  let avatarNode = <Avatar shape="square" size="large" icon="picture" />;
  if (karkun.imageId) {
    imageUrl = getDownloadUrl(karkun.imageId);
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
        title={karkun.name}
        visible={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        <img src={imageUrl} />
      </Modal>
    </>
  );
};

KarkunName.propTypes = {
  karkun: PropTypes.object,
  onKarkunNameClicked: PropTypes.func,
};

export default KarkunName;
