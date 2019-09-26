import React, { Component } from "react";
import PropTypes from "prop-types";
import Webcam from "react-webcam";

import { Button, Select } from "/imports/ui/controls";

export default class TakePictureForm extends Component {
  static propTypes = {
    value: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    setDimensions: PropTypes.func,
  };
  webcam;

  state = {
    imageSrc: null,
  };

  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
    this.setState({
      imageSrc,
    });
  };

  captureAnother = () => {
    this.setState({ imageSrc: null });
  };

  handleSizeChange = value => {
    const { setDimensions } = this.props;
    setDimensions(value);
  };

  render() {
    const { imageSrc } = this.state;
    const { value, height, width } = this.props;

    if (imageSrc) {
      return (
        <div>
          <img src={imageSrc} />
          <Button type="default" onClick={this.captureAnother}>
            Capture another photo
          </Button>
        </div>
      );
    }
    return (
      <div>
        <img src={imageSrc} />

        <Webcam
          ref={w => {
            this.webcam = w;
          }}
          audio={false}
          height={height}
          width={width}
          screenshotFormat="image/jpeg"
        />
        <Button type="default" onClick={this.capture}>
          Capture photo
        </Button>
        <Select
          type="default"
          onClick={this.capture}
          defaultValue={value}
          onChange={this.handleSizeChange}
        >
          <Select.Option value={1}>Width:350 * Height:300</Select.Option>
          <Select.Option value={2}>Width:700 * Height:600</Select.Option>
          <Select.Option value={3}>Width:1050 * Height:900</Select.Option>
        </Select>
      </div>
    );
  }
}
