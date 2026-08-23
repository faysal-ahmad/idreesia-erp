/* eslint-disable jsx-a11y/media-has-caption */
import React, { Component } from 'react';

const CaptureJpegQuality = 0.95;

interface Props {
  showCrop?: boolean;
  cropTop?: number;
  cropLeft?: number;
  cropWidth?: number;
  cropHeight?: number;
  width?: number;
  height?: number;
  onCropPositionChange?(left: number, top: number): void;
}

interface State {
  mediaStream?: MediaStream;
}

export default class Camera extends Component<Props, State> {
  state: State = {};
  video: HTMLVideoElement | null = null;
  canvas?: HTMLCanvasElement;
  dragStartX = 0;
  dragStartY = 0;
  dragStartCropLeft = 0;
  dragStartCropTop = 0;

  componentDidMount() {
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        .then(mediaStream => {
          this.setState({ mediaStream });
          if (this.video) {
            this.video.srcObject = mediaStream;
            this.video.play();
          }
        })
        .catch(error => error);
    }
  }

  componentWillUnmount() {
    const { mediaStream } = this.state;
    mediaStream?.getVideoTracks().forEach((track: MediaStreamTrack) => track.stop());
    this.stopCropDrag();
  }

  handleCropDragStart = (event: React.MouseEvent) => {
    const { cropLeft, cropTop } = this.props;

    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartCropLeft = cropLeft ?? 0;
    this.dragStartCropTop = cropTop ?? 0;

    window.addEventListener('mousemove', this.handleCropDragMove);
    window.addEventListener('mouseup', this.handleCropDragEnd);
    event.preventDefault();
  };

  handleCropDragMove = (event: MouseEvent) => {
    const { onCropPositionChange } = this.props;

    onCropPositionChange?.(
      this.dragStartCropLeft + (event.clientX - this.dragStartX),
      this.dragStartCropTop + (event.clientY - this.dragStartY)
    );
  };

  handleCropDragEnd = () => {
    this.stopCropDrag();
  };

  stopCropDrag = () => {
    window.removeEventListener('mousemove', this.handleCropDragMove);
    window.removeEventListener('mouseup', this.handleCropDragEnd);
  };

  getCanvas = () => {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
    }

    return this.canvas;
  };

  // The video preview is rendered with objectFit: 'cover', so it is scaled
  // uniformly (never stretched) and centered within its width x height box,
  // with any excess cropped off-center. Capturing must undo that same
  // scale/offset, or the pixels behind the on-screen crop rect won't match
  // what capture() reads from the source video.
  getVideoCoverTransform() {
    const { width = 0, height = 0 } = this.props;
    const videoWidth = this.video?.videoWidth ?? 0;
    const videoHeight = this.video?.videoHeight ?? 0;

    if (!videoWidth || !videoHeight || !width || !height) {
      return { scale: 1, offsetX: 0, offsetY: 0 };
    }

    const scale = Math.max(width / videoWidth, height / videoHeight);
    return {
      scale,
      offsetX: (videoWidth * scale - width) / (2 * scale),
      offsetY: (videoHeight * scale - height) / (2 * scale),
    };
  }

  capture() {
    const {
      width = 0,
      height = 0,
      showCrop,
      cropLeft = 0,
      cropTop = 0,
      cropWidth = width,
      cropHeight = height,
    } = this.props;

    const canvas = this.getCanvas();
    const context = canvas.getContext('2d');
    if (!this.video || !context) return canvas.toDataURL('image/jpeg', CaptureJpegQuality);

    const boxLeft = showCrop ? cropLeft : 0;
    const boxTop = showCrop ? cropTop : 0;
    const boxWidth = showCrop ? cropWidth : width;
    const boxHeight = showCrop ? cropHeight : height;

    const { scale, offsetX, offsetY } = this.getVideoCoverTransform();
    const sourceX = offsetX + boxLeft / scale;
    const sourceY = offsetY + boxTop / scale;
    const sourceWidth = boxWidth / scale;
    const sourceHeight = boxHeight / scale;

    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    context.drawImage(
      this.video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    );

    return canvas.toDataURL('image/jpeg', CaptureJpegQuality);
  }

  render() {
    const {
      width,
      height,
      showCrop,
      cropLeft,
      cropTop,
      cropWidth,
      cropHeight,
    } = this.props;

    const cropRect = showCrop ? (
      <div
        onMouseDown={this.handleCropDragStart}
        style={{
          position: 'absolute',
          top: cropTop,
          left: cropLeft,
          width: cropWidth,
          height: cropHeight,
          border: '1px dashed',
          color: '#ffffff',
          cursor: 'move',
        }}
      />
    ) : null;

    return (
      <div
        style={{
          width,
          height,
          position: 'relative',
        }}
      >
        {cropRect}
        <video
          style={{ height, width, objectFit: 'cover' }}
          ref={(video: HTMLVideoElement | null) => {
            this.video = video;
          }}
        />
      </div>
    );
  }
}
