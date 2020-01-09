/* eslint-disable jsx-a11y/media-has-caption */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Camera extends Component {
  static propTypes = {
    showCrop: PropTypes.bool,
    cropTop: PropTypes.number,
    cropLeft: PropTypes.number,
    cropWidth: PropTypes.number,
    cropHeight: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  componentWillMount() {
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(mediaStream => {
          this.setState({ mediaStream });
          this.video.srcObject = mediaStream;
          this.video.play();
        })
        .catch(error => error);
    }
  }

  componentWillUnmount() {
    const { mediaStream } = this.state;
    mediaStream.getVideoTracks().map(track => track.stop());
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
      canvas.width = width;
      canvas.height = height;
      canvas2dContext = canvas.getContext('2d');
      canvas2dContext.drawImage(this.video, 0, 0, width, height);
    } else {
      const scaleX = this.video.videoWidth / width;
      const scaleY = this.video.videoHeight / height;

      canvas.width = cropWidth;
      canvas.height = cropHeight;
      canvas2dContext = canvas.getContext('2d');
      canvas2dContext.drawImage(
        this.video,
        cropLeft * scaleX,
        cropTop * scaleY,
        cropWidth * scaleX,
        cropHeight * scaleY,
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
          ref={video => {
            this.video = video;
          }}
        />
      </div>
    );
  }
}
