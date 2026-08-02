import React, { Component } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload';

import { Button, Upload } from 'antd';

interface Props {
  label?: string;
  accept?: string;
  value?: string;
  onChange?(value: string | ArrayBuffer | null): void;
  showUploadList?: boolean;
}

export default class InputFile extends Component<Props> {
  handleChange = (info: UploadChangeParam<UploadFile>) => {
    const { onChange } = this.props;
    if (info.file.status === 'removed') {
      onChange?.(null);
    } else if (info.file.status !== 'uploading') {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        onChange?.(e.target?.result ?? null);
      };
      if (info.file.originFileObj) reader.readAsText(info.file.originFileObj);
    }
  };

  render() {
    const { accept, label = 'Upload', showUploadList = true } = this.props;
    return (
      <Upload
        accept={accept}
        onChange={this.handleChange}
        showUploadList={showUploadList}
      >
        <Button type="default" size="large">
          <UploadOutlined />
          {label}
        </Button>
      </Upload>
    );
  }
}
