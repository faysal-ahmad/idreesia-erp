import React from 'react';
import { Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

interface Props {
  imageId?: string | null;
  personName?: string;
  onUploadFinish?(imageId: string): void;
  onPictureTaken?(imageId: string): void;
}

const PersonPicture = ({
  imageId,
  personName,
  onUploadFinish,
  onPictureTaken,
}: Props) => {
  const url = getDownloadUrl(imageId);
  const showActions = Boolean(onUploadFinish || onPictureTaken);

  return (
    <div className="person-picture">
      <div className="person-picture-preview">
        {url ? (
          <img src={url} alt={personName ?? 'Person'} />
        ) : (
          <div className="person-picture-empty">
            <UserOutlined />
            <span>No picture uploaded</span>
          </div>
        )}
      </div>
      {showActions ? (
        <Space size={12} wrap className="person-picture-actions">
          {onUploadFinish ? (
            <UploadAttachment buttonText="Upload" onUploadFinish={onUploadFinish} />
          ) : null}
          {onPictureTaken ? (
            <TakePicture onPictureTaken={onPictureTaken} />
          ) : null}
        </Space>
      ) : null}
    </div>
  );
};

export default PersonPicture;
