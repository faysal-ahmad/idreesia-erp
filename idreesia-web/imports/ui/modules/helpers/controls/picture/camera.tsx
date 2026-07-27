/* eslint-disable jsx-a11y/media-has-caption */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

interface Props { showCrop?: boolean; cropTop?: number; cropLeft?: number; cropWidth?: number; cropHeight?: number; width?: number; height?: number; }
interface State { mediaStream?: MediaStream; }

export default class Camera extends Component<Props, State> {
  static propTypes = {
    showCrop: PropTypes.bool,
    cropTop: PropTypes.number,
    cropLeft: PropTypes.number,
    cropWidth: PropTypes.number,
    cropHeight: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  state: State = {};
  video: HTMLVideoElement | null = null;
  canvas?: HTMLCanvasElement;

  componentWillMount() {
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
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
  }

  getCanvas = () => {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
    }

    return this.canvas;
  };

  capture() {
    const {
      width,
      height,
      showCrop,
      cropLeft,
      cropTop,
      cropWidth,
      cropHeight,
    } = this.props;

    const canvas = this.getCanvas();
    let canvas2dContext;

    if (!showCrop) {
      canvas.width = width ?? 0;
      canvas.height = height ?? 0;
      canvas2dContext = canvas.getContext('2d');
      if (canvas2dContext && this.video) canvas2dContext.drawImage(this.video, 0, 0, width ?? 0, height ?? 0);
    } else {
      const scaleX = this.video ? this.video.videoWidth / (width ?? 1) : 1;
      const scaleY = this.video ? this.video.videoHeight / (height ?? 1) : 1;

      canvas.width = cropWidth ?? 0;
      canvas.height = cropHeight ?? 0;
      canvas2dContext = canvas.getContext('2d');
      if (canvas2dContext && this.video) canvas2dContext.drawImage(
        this.video,
        (cropLeft ?? 0) * scaleX,
        (cropTop ?? 0) * scaleY,
        (cropWidth ?? 0) * scaleX,
        (cropHeight ?? 0) * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
    return canvas.toDataURL('image/jpeg');
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
        style={{
          position: 'absolute',
          top: cropTop,
          left: cropLeft,
          width: cropWidth,
          height: cropHeight,
          border: '1px dashed',
          color: '#ffffff',
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
          style={{ height, width }}
          ref={(video: HTMLVideoElement | null) => {
            this.video = video;
          }}
        />
      </div>
    );
  }
}
