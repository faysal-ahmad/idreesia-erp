import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Upload } from "antd";

export default class InputFile extends Component {
  static propTypes = {
    accept: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  handleChange = info => {
    const { onChange } = this.props;
    if (info.file.status === "removed") {
      onChange(null);
    } else if (info.file.status !== "uploading") {
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
      <Upload accept={accept} onChange={this.handleChange}>
        <Button type="default">
          <Icon type="upload" />
          Upload
        </Button>
      </Upload>
    );
  }
}
