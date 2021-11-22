import React from 'react';
import PropTypes from 'prop-types';
import { UploadOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Upload, message } from 'antd';

const UploadAttachment = ({ accept, onUploadFinish, disabled, buttonText }) => (
  <Upload
    accept={accept}
    name="file"
    action="/upload-file"
    showUploadList={false}
    onChange={info => {
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

UploadAttachment.propTypes = {
  accept: PropTypes.string,
  disabled: PropTypes.bool,
  buttonText: PropTypes.string,
  onUploadFinish: PropTypes.func,
};

UploadAttachment.defaultProps = {
  accept: '*',
  disabled: false,
  buttonText: 'Upload Picture',
  onUploadFinish: noop,
};

export default UploadAttachment;
