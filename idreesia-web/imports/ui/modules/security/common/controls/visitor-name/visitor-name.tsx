import React, { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from 'antd';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

const RouterLink = Link as any;

const ContainerDivStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

const TextDivStyle: CSSProperties = {
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
  let avatarNode = <Avatar shape="square" size="large" icon={<UserOutlined />} />;
  if (visitor.imageId) {
    imageUrl = getDownloadUrl(visitor.imageId) ?? undefined;
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
      <div style={ContainerDivStyle}>
        {avatarNode}
        &nbsp;&nbsp;
        <div style={TextDivStyle}>
          {nameNode}
          {additionalInfoNode}
        </div>
      </div>
      <Modal
        title={visitor.name}
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        {imageUrl ? <img src={imageUrl} alt={visitor.name} /> : null}
      </Modal>
    </>
  );
};

export default VisitorName;
