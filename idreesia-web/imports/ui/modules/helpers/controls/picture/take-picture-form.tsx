import React, { Component, type CSSProperties } from 'react';
import { Button, Slider } from 'antd';

import Camera from './camera';

const MinCameraWidth = 350;
const MinCameraHeight = 262;
const MaxCameraWidth = 700;
const MaxCameraHeight = 524;

const WidthStepSize = (MaxCameraWidth - MinCameraWidth) / 3;
const HeightStepSize = (MaxCameraHeight - MinCameraHeight) / 3;

const zoomLevel = {
  0: '1',
  1: '2',
  2: '3',
  3: '4',
};

const ControlsContainerStyle: CSSProperties = {
  display: 'flex',
  width: '100%',
  flexFlow: 'row nowrap',
  alignItems: 'center',
  justifyContent: 'center',
};

const CameraContainerStyle: CSSProperties = {
  display: 'flex',
  width: '700px',
  flexFlow: 'column nowrap',
  alignItems: 'center',
  justifyContent: 'flex-start',
};

interface State {
  imageSrc: string | null;
  currentZoomLevel: number;
  showCrop: boolean;
  cropTop: number;
  cropLeft: number;
}

export default class TakePictureForm extends Component<object, State> {
  state: State = {
    imageSrc: null,
    currentZoomLevel: 0,
    showCrop: false,
    cropTop: 0,
    cropLeft: 0,
  };

  camera: Camera | null = null;

  capture = () => {
    const imageSrc = this.camera?.capture();
    this.setState({
      imageSrc: imageSrc ?? null,
    });
  };

  captureAnother = () => {
    this.setState({ imageSrc: null });
  };

  handleZoomLevelChange = (value: number) => {
    const cameraWidth = MinCameraWidth + value * WidthStepSize;
    const cameraHeight = MinCameraHeight + value * HeightStepSize;
    const cropTop = (cameraHeight - MinCameraHeight) / 2;
    const cropLeft = (cameraWidth - MinCameraWidth) / 2;

    this.setState({
      currentZoomLevel: value,
      showCrop: value !== 0,
      cropTop,
      cropLeft,
    });
  };

  handleCropPositionChange = (left: number, top: number) => {
    const { currentZoomLevel } = this.state;
    const maxCropLeft = currentZoomLevel * WidthStepSize;
    const maxCropTop = currentZoomLevel * HeightStepSize;

    this.setState({
      cropLeft: Math.min(Math.max(left, 0), maxCropLeft),
      cropTop: Math.min(Math.max(top, 0), maxCropTop),
    });
  };

  render() {
    const {
      currentZoomLevel,
      showCrop,
      cropTop,
      cropLeft,
      imageSrc,
    } = this.state;
    const cropWidth = MinCameraWidth;
    const cropHeight = MinCameraHeight;
    const cameraWidth = MinCameraWidth + currentZoomLevel * WidthStepSize;
    const cameraHeight = MinCameraHeight + currentZoomLevel * HeightStepSize;

    if (imageSrc) {
      return (
        <div style={CameraContainerStyle}>
          <img
            src={imageSrc}
            alt="captured"
            style={{
              maxWidth: MaxCameraWidth,
              maxHeight: MaxCameraHeight,
              width: 'auto',
              height: 'auto',
            }}
          />
          <div style={{ height: '10px' }} />
          <Button type="default" onClick={this.captureAnother}>
            Capture another photo
          </Button>
        </div>
      );
    }

    return (
      <div style={CameraContainerStyle}>
        <div style={ControlsContainerStyle}>
          <div style={{ width: '300px' }}>
            <Slider
              marks={zoomLevel}
              step={0.25}
              min={0}
              max={3}
              defaultValue={currentZoomLevel}
              tooltip={{ open: false }}
              onChange={this.handleZoomLevelChange}
            />
          </div>
          <div style={{ width: '20px' }} />
          <Button type="default" onClick={this.capture}>
            Capture photo
          </Button>
        </div>
        <Camera
          ref={(camera) => {
            this.camera = camera;
          }}
          width={cameraWidth}
          height={cameraHeight}
          showCrop={showCrop}
          cropLeft={cropLeft}
          cropTop={cropTop}
          cropWidth={cropWidth}
          cropHeight={cropHeight}
          onCropPositionChange={this.handleCropPositionChange}
        />
      </div>
    );
  }
}
