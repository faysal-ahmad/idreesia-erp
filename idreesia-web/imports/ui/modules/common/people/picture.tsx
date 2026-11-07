import React from 'react';
import { Button, Space, Upload } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';
import {
  readImageFile,
  TakePicture,
} from '/imports/ui/modules/helpers/controls';

interface Props {
  imageUrl?: string | null;
  personName?: string;
  /** Called with the chosen photo as base64 JPEG data. */
  onImageSelected?(imageData: string): void;
}

const PersonPicture = ({ imageUrl, personName, onImageSelected }: Props) => (
  <div className="person-picture">
    <div className="person-picture-preview">
      {imageUrl ? (
        <img src={imageUrl} alt={personName ?? 'Person'} />
      ) : (
        <div className="person-picture-empty">
          <UserOutlined />
          <span>No picture uploaded</span>
        </div>
      )}
    </div>
    {onImageSelected ? (
      <Space size={12} wrap className="person-picture-actions">
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={file => {
            readImageFile(file)
              .then(onImageSelected)
              .catch((error: Error) => {
                message.error(error.message, 5);
              });
            // The photo is sent with the mutation, not uploaded here.
            return false;
          }}
        >
          <Button type="default">
            <UploadOutlined />
            Upload
          </Button>
        </Upload>
        <TakePicture onPictureCaptured={onImageSelected} />
      </Space>
    ) : null}
  </div>
);

export default PersonPicture;
