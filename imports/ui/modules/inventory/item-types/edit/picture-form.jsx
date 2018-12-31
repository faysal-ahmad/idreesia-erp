import React, { Component } from 'react';
import Webcam from 'react-webcam';
import { Button } from 'antd';

export default class PictureForm extends Component {
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

  render() {
    const { imageSrc } = this.state;

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
          height={300}
          width={350}
          screenshotFormat="image/jpeg"
        />
        <Button type="default" onClick={this.capture}>
          Capture photo
        </Button>
      </div>
    );
  }
}
