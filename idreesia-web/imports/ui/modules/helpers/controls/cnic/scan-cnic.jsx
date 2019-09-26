import React, { Component } from "react";
import PropTypes from "prop-types";
import { debounce } from "lodash";

import { Col, Input, Row } from "/imports/ui/controls";

export default class ScanCnic extends Component {
  static propTypes = {
    onCnicCaptured: PropTypes.func,
  };

  state = {
    code: "",
  };

  keyBuffer = [];

  componentDidMount = () => {
    window.addEventListener("keypress", this.handleKeyPress);
  };

  componentWillUnmount = () => {
    window.removeEventListener("keypress", this.handleKeyPress);
  };

  sendBarcode = debounce(
    () => {
      const { onCnicCaptured } = this.props;
      const scannedInput = this.keyBuffer.join("");
      setTimeout(() => {
        this.keyBuffer = [];
      }, 3000);

      let barcode;
      if (scannedInput.length === 15) {
        barcode = `${scannedInput.slice(0, 5)}-${scannedInput.slice(
          5,
          12
        )}-${scannedInput.slice(12, 13)}`;

        this.setState({ code: barcode });
        if (onCnicCaptured) {
          onCnicCaptured(barcode);
        }
      } else if (scannedInput.length === 25) {
        barcode = `${scannedInput.slice(11, 16)}-${scannedInput.slice(
          16,
          23
        )}-${scannedInput.slice(23, 24)}`;

        this.setState({ code: barcode });
        if (onCnicCaptured) {
          onCnicCaptured(barcode);
        }
      } else if (scannedInput.length === 26) {
        barcode = `${scannedInput.slice(12, 17)}-${scannedInput.slice(
          17,
          24
        )}-${scannedInput.slice(24, 25)}`;

        this.setState({ code: barcode });
        if (onCnicCaptured) {
          onCnicCaptured(barcode);
        }
      } else if (scannedInput.length > 50) {
        // Old 2D CNIC Formats
        const parts = scannedInput.split("Enter");
        if (parts.length > 6) {
          let idPart;
          if (parts[2].lnegth >= 13) {
            idPart = parts[2];
          } else {
            idPart = parts[1];
          }

          barcode = idPart;
          if (idPart.length > 13) {
            barcode = `${idPart.slice(0, 5)}-${idPart.slice(
              5,
              12
            )}-${idPart.slice(12, 13)}`;
          }

          this.setState({ code: barcode });
          if (onCnicCaptured) {
            onCnicCaptured(barcode);
          }
        }
      } else if (onCnicCaptured) {
        onCnicCaptured(null);
      }
    },
    100,
    { trailing: true, maxWait: 2000 }
  );

  handleKeyPress = event => {
    this.keyBuffer.push(event.key);
    this.sendBarcode();
  };

  render() {
    return (
      <Row type="flex" justify="start" align="middle" gutter={16}>
        <Col order={1}>Scan CNIC</Col>
        <Col order={2}>
          <Input readOnly value={this.state.code} />
        </Col>
      </Row>
    );
  }
}
