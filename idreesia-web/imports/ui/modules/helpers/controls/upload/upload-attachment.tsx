import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload';

import {
  ATTACHMENT_ALLOWED_MIME_TYPES,
  ATTACHMENT_MAX_FILE_SIZE,
  type AttachmentCategoryValue,
} from 'meteor/idreesia-common/constants';
import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { getLoginHeaders } from 'meteor/idreesia-common/utilities';
import { Button, Upload } from 'antd';
import { message } from '/imports/ui/antd-feedback';

interface Props {
  /** What the file belongs to - decides where it is stored. */
  category: AttachmentCategoryValue;
  accept?: string;
  onUploadFinish?(attachmentId: string): void;
  disabled?: boolean;
  buttonText?: string;
}

const UploadAttachment = ({
  category,
  // The types the server accepts (see /upload-file).
  accept = ATTACHMENT_ALLOWED_MIME_TYPES.join(','),
  onUploadFinish = noop,
  disabled = false,
  buttonText = 'Upload Picture',
}: Props) => (
  <Upload
    accept={accept}
    name="file"
    action="/upload-file"
    headers={getLoginHeaders()}
    data={{ category }}
    showUploadList={false}
    beforeUpload={file => {
      if (file.size <= ATTACHMENT_MAX_FILE_SIZE) return true;
      message.error(
        `${file.name} is larger than ${
          ATTACHMENT_MAX_FILE_SIZE / (1024 * 1024)
        } MB.`
      );
      return Upload.LIST_IGNORE;
    }}
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
