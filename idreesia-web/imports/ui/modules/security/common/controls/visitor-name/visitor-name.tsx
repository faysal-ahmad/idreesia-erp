import React, { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

import { Avatar, Modal } from 'antd';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

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
  imageUrl?: string;
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
    <Link to={`${paths.visitorRegistrationPath}/${visitor._id}`}>
      {visitor.name}
    </Link>
  );

  const additionalInfoNode = additionalInfo ? (
    <span>{additionalInfo}</span>
  ) : null;

  let avatarNode = <Avatar shape="square" size="large" icon={<UserOutlined />} />;
  const { imageUrl } = visitor;
  if (imageUrl) {
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
