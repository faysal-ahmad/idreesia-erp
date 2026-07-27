import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from 'antd';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

const AntAvatar = Avatar as any;
const AntModal = Modal as any;
const AntUserOutlined = UserOutlined as any;
const RouterLink = Link as any;
interface Karkun { _id: string; name: string; imageId?: string; }
interface KarkunNameProps { karkun?: Karkun | null; onKarkunNameClicked?(karkun: Karkun): void; }

const KarkunName = ({ karkun, onKarkunNameClicked }: KarkunNameProps) => {
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
    <RouterLink to={`${paths.karkunsPath}/${karkun._id}`}>{karkun.name}</RouterLink>
  );

  let imageUrl: string | undefined;
  let avatarNode = <AntAvatar shape="square" size="large" icon={<AntUserOutlined />} />;
  if (karkun.imageId) {
    imageUrl = getDownloadUrl(karkun.imageId) ?? undefined;
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

  return (
    <>
      <div style={NameDivStyle as any}>
        {avatarNode}
        &nbsp;&nbsp;
        {nameNode}
      </div>
      <AntModal
        title={karkun.name}
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        {imageUrl ? <img src={imageUrl} style={{ maxWidth: '470px' }} alt={karkun.name} /> : null}
      </AntModal>
    </>
  );
};

KarkunName.propTypes = {
  karkun: PropTypes.object,
  onKarkunNameClicked: PropTypes.func,
};

export default KarkunName;
