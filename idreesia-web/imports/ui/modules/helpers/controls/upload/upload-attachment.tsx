import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Upload } from 'antd';
import { message } from '/imports/ui/antd-feedback';

interface Props {
  accept?: string;
  onUploadFinish?(attachmentId: string): void;
  disabled?: boolean;
  buttonText?: string;
}

const UploadAttachment = ({
  accept = '*',
  onUploadFinish = noop,
  disabled = false,
  buttonText = 'Upload Picture',
}: Props) => (
  <Upload
    accept={accept}
    name="file"
    action="/upload-file"
    showUploadList={false}
    onChange={(info: UploadChangeParam<UploadFile>) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        const attachmentId = info.file.response;
        onUploadFinish(attachmentId);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    }}
  >
    <Button type="default" disabled={disabled}>
      <UploadOutlined />
      {buttonText}
    </Button>
  </Upload>
);

export default UploadAttachment;
