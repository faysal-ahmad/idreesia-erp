import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Icon, Upload } from '/imports/ui/controls';

export default class InputFile extends Component {
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

  handleChange = info => {
    const { onChange } = this.props;
    if (info.file.status === 'removed') {
      onChange(null);
    } else if (info.file.status !== 'uploading') {
      const reader = new FileReader();
      reader.onload = e => {
        onChange(e.target.result);
      };
      reader.readAsText(info.file.originFileObj);
    }
  };

  render() {
    const { accept } = this.props;
    return (
      <Upload
        accept={accept}
        onChange={this.handleChange}
        showUploadList={this.props.showUploadList}
      >
        <Button type="default" size="large">
          <Icon type="upload" />
          {this.props.label || null}
        </Button>
      </Upload>
    );
  }
}
