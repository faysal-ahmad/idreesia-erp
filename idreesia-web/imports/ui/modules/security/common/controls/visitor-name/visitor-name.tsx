import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from 'antd';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

const AntAvatar = Avatar as any;
const AntModal = Modal as any;
const AntUserOutlined = UserOutlined as any;
const RouterLink = Link as any;

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

interface Visitor {
  _id: string;
  name: string;
  imageId?: string;
}

interface VisitorNameProps {
  visitor?: Visitor | null;
  additionalInfo?: string;
  onVisitorNameClicked?(visitor: Visitor): void;
}

const VisitorName = ({ visitor, additionalInfo, onVisitorNameClicked }: VisitorNameProps) => {
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
    <RouterLink to={`${paths.visitorRegistrationPath}/${visitor._id}`}>
      {visitor.name}
    </RouterLink>
  );

  const additionalInfoNode = additionalInfo ? (
    <span>{additionalInfo}</span>
  ) : null;

  let imageUrl: string | undefined;
  let avatarNode = <AntAvatar shape="square" size="large" icon={<AntUserOutlined />} />;
  if (visitor.imageId) {
    imageUrl = getDownloadUrl(visitor.imageId) ?? undefined;
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
      <div style={ContainerDivStyle as any}>
        {avatarNode}
        &nbsp;&nbsp;
        <div style={TextDivStyle as any}>
          {nameNode}
          {additionalInfoNode}
        </div>
      </div>
      <AntModal
        title={visitor.name}
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        {imageUrl ? <img src={imageUrl} alt={visitor.name} /> : null}
      </AntModal>
    </>
  );
};

VisitorName.propTypes = {
  visitor: PropTypes.object,
  additionalInfo: PropTypes.string,
  onVisitorNameClicked: PropTypes.func,
};

export default VisitorName;
