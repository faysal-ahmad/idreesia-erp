import React, { Component } from 'react';
import { LeftOutlined, RightOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
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

const ControlsContainerStyle = {
  display: 'flex',
  width: '100%',
  flexFlow: 'row nowrap',
  alignItems: 'center',
  justifyContent: 'center',
};

const CameraContainerStyle = {
  display: 'flex',
  width: '700px',
  flexFlow: 'column nowrap',
  alignItems: 'center',
  justifyContent: 'flex-start',
};

const AntButton = Button as any;
const AntSlider = Slider as any;
const AntLeftOutlined = LeftOutlined as any;
const AntRightOutlined = RightOutlined as any;
const AntUpOutlined = UpOutlined as any;
const AntDownOutlined = DownOutlined as any;
const CameraControl = Camera as any;
interface State { imageSrc: string | null; currentZoomLevel: number; showCrop: boolean; cropTop: number; cropLeft: number; }

export default class TakePictureForm extends Component<Record<string, never>, State> {
  state = {
    imageSrc: null,
    currentZoomLevel: 0,
    showCrop: false,
    cropTop: 0,
    cropLeft: 0,
  };

  camera: any;

  capture = () => {
    const imageSrc = this.camera.capture();
    this.setState({
      imageSrc,
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

  moveLeft = () => {
    const { cropLeft } = this.state;
    this.setState({ cropLeft: cropLeft - 10 > 0 ? cropLeft - 10 : 0 });
  };

  moveRight = () => {
    const { currentZoomLevel, cropLeft } = this.state;
    const cameraWidth = MinCameraWidth + currentZoomLevel * WidthStepSize;
    this.setState({
      cropLeft:
        cropLeft + MinCameraWidth + 10 <= cameraWidth
          ? cropLeft + 10
          : cameraWidth - MinCameraWidth,
    });
  };

  moveUp = () => {
    const { cropTop } = this.state;
    this.setState({ cropTop: cropTop - 10 > 0 ? cropTop - 10 : 0 });
  };

  moveDown = () => {
    const { currentZoomLevel, cropTop } = this.state;
    const cameraHeight = MinCameraHeight + currentZoomLevel * HeightStepSize;
    this.setState({
      cropTop:
        cropTop + MinCameraHeight + 10 <= cameraHeight
          ? cropTop + 10
          : cameraHeight - MinCameraHeight,
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
        <div style={CameraContainerStyle as any}>
          <img src={imageSrc} width={cropWidth} height={cropHeight} alt="captured" />
          <div style={{ height: '10px' }} />
          <AntButton type="default" onClick={this.captureAnother}>
            Capture another photo
          </AntButton>
        </div>
      );
    }

    return (
      <div style={CameraContainerStyle as any}>
        <div style={ControlsContainerStyle as any}>
          <div style={{ width: '300px' }}>
            <AntSlider
              marks={zoomLevel}
              step={1}
              min={0}
              max={3}
              defaultValue={currentZoomLevel}
              tooltipVisible={false}
              onChange={this.handleZoomLevelChange}
            />
          </div>
          <div style={{ width: '20px' }} />
          <AntButton icon={<AntLeftOutlined />} size="large" onClick={this.moveLeft} />
          <AntButton icon={<AntRightOutlined />} size="large" onClick={this.moveRight} />
          <AntButton icon={<AntUpOutlined />} size="large" onClick={this.moveUp} />
          <AntButton icon={<AntDownOutlined />} size="large" onClick={this.moveDown} />
          <div style={{ width: '20px' }} />
          <AntButton type="default" onClick={this.capture}>
            Capture photo
          </AntButton>
        </div>
        <CameraControl
          ref={(c: any) => {
            this.camera = c;
          }}
          width={cameraWidth}
          height={cameraHeight}
          showCrop={showCrop}
          cropLeft={cropLeft}
          cropTop={cropTop}
          cropWidth={cropWidth}
          cropHeight={cropHeight}
        />
      </div>
    );
  }
}
