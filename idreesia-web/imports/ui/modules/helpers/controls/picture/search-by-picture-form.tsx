import React, { Component, type CSSProperties, type ReactNode } from 'react';
import { Button, Slider } from 'antd';

import Camera from './camera';

// Mirrors take-picture-form's framing: the camera box grows with zoom while the crop rect stays
// fixed, so zooming in raises the captured face's pixel density rather than just enlarging the
// preview. That matters here - a face under 40px is rejected outright by the embedding pipeline.
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

const CapturedControlsStyle: CSSProperties = {
  display: 'flex',
  width: '100%',
  flexFlow: 'row nowrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
};

interface Props {
  // Rendered beside the "Capture another photo" button, so a rejected photo is explained right
  // next to the control that lets the operator retake it.
  errorMessage?: ReactNode;
  onCaptureChange?(imageSrc: string | null): void;
}

interface State {
  imageSrc: string | null;
  currentZoomLevel: number;
  showCrop: boolean;
  cropTop: number;
  cropLeft: number;
}

export default class SearchByPictureForm extends Component<Props, State> {
  state: State = {
    imageSrc: null,
    currentZoomLevel: 0,
    showCrop: false,
    cropTop: 0,
    cropLeft: 0,
  };

  camera: Camera | null = null;

  capture = () => {
    const imageSrc = this.camera?.capture() ?? null;
    this.setState({ imageSrc });
    this.props.onCaptureChange?.(imageSrc);
  };

  captureAnother = () => {
    this.setState({ imageSrc: null });
    this.props.onCaptureChange?.(null);
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
    const { errorMessage } = this.props;
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
          <div style={CapturedControlsStyle}>
            <Button type="default" onClick={this.captureAnother}>
              Capture another photo
            </Button>
            {errorMessage}
          </div>
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
