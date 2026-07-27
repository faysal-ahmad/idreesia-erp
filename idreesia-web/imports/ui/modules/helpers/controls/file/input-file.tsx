import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { UploadOutlined } from '@ant-design/icons';

import { Button, Upload } from 'antd';

const AntButton = Button as any;
const AntUpload = Upload as any;
const AntUploadOutlined = UploadOutlined as any;
interface Props { label?: string; accept?: string; value?: string; onChange?(value: string | ArrayBuffer | null): void; showUploadList?: boolean; }

export default class InputFile extends Component<Props> {
  static propTypes = {
    label: PropTypes.string,
    accept: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    showUploadList: PropTypes.bool,
  };

  static defaultProps = {
    label: 'Upload',
    showUploadList: true,
  };

  handleChange = (info: any) => {
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
    const { accept } = this.props;
    return (
      <AntUpload
        accept={accept}
        onChange={this.handleChange}
        showUploadList={this.props.showUploadList}
      >
        <AntButton type="default" size="large">
          <AntUploadOutlined />
          {this.props.label || null}
        </AntButton>
      </AntUpload>
    );
  }
}
