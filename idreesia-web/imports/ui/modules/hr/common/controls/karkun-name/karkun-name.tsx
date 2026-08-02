import React, { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

const RouterLink = Link as any;
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from 'antd';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

const NameDivStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

interface Karkun {
  _id?: string | null;
  name?: string | null;
  imageId?: string | null;
}

interface KarkunNameProps {
  karkun?: Karkun | null;
  onKarkunNameClicked?(karkun: Karkun): void;
}

const KarkunName = ({ karkun, onKarkunNameClicked }: KarkunNameProps) => {
  const [showDialog, setShowDialog] = useState(false);
  if (!karkun || !karkun._id || !karkun.name) return null;

  const nameNode = onKarkunNameClicked ? (
    <div
      onClick={() => {
        onKarkunNameClicked(karkun);
      }}
    >
      {karkun.name}
    </div>
  ) : (
    <RouterLink to={`${paths.karkunsPath}/${karkun._id}`}>{karkun.name}</RouterLink>
  );

  let imageUrl: string | undefined;
  let avatarNode = <Avatar shape="square" size="large" icon={<UserOutlined />} />;
  if (karkun.imageId) {
    imageUrl = getDownloadUrl(karkun.imageId) ?? undefined;
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
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        {imageUrl ? <img src={imageUrl} style={{ maxWidth: '470px' }} alt={karkun.name} /> : null}
      </Modal>
    </>
  );
};

export default KarkunName;
