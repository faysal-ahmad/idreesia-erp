import React from "react";
import PropTypes from "prop-types";
import { Button, Icon, Upload, message } from "antd";

const UploadAttachment = ({
  onUploadFinish,
  enabled = true,
  buttonText = "Upload Picture",
}) => (
  <Upload
    name="file"
    action="/upload-file"
    showUploadList={false}
    onChange={info => {
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
        const attachmentId = info.file.response;
        onUploadFinish(attachmentId);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    }}
  >
    <Button type="default" enabled={enabled}>
      <Icon type="upload" />
      {buttonText}
    </Button>
  </Upload>
);

UploadAttachment.propTypes = {
  enabled: PropTypes.bool,
  buttonText: PropTypes.string,
  onUploadFinish: PropTypes.func,
};

export default UploadAttachment;
