import React, { Component } from "react";
import PropTypes from "prop-types";
import Quagga from "quagga";

export default class CaptureBarcodeForm extends Component {
  liveStreamDiv = null;

  static propTypes = {
    onBarcodeCaptured: PropTypes.func,
  };

  componentDidMount() {
    this.startScanning();
    Quagga.onDetected(data => {
      const { onBarcodeCaptured } = this.props;
      if (onBarcodeCaptured) {
        onBarcodeCaptured(data.codeResult.code);
      }
    });
  }

  componentWillUnmount() {
    this.stopScanning();
  }

  startScanning = () => {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          locate: true,
          target: this.liveStreamDiv,
          constraints: {
            width: 500,
            height: 500,
          },
        },
        locator: {
          halfSample: true,
          patchSize: "medium",
        },
        decoder: {
          readers: ["code_128_reader"],
          debug: {
            drawBoundingBox: true,
            showFrequency: false,
            drawScanline: false,
            showPattern: false,
          },
          multiple: false,
        },
      },
      err => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log(`Error occurred during initialization. ${err}`);
          return;
        }
        Quagga.start();
      }
    );
  };

  stopScanning = () => {
    Quagga.stop();
  };

  render() {
    return (
      <div
        style={{ maxHeight: "550px", maxWidth: "550px" }}
        ref={d => {
          this.liveStreamDiv = d;
        }}
      />
    );
  }
}
