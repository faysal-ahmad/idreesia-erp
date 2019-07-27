import React, { Component } from "react";
import PropTypes from "prop-types";
import { Col, Input, Row } from "antd";
import { debounce } from "lodash";

export default class ScanCnicQRCode extends Component {
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
      const scannedInput = this.keyBuffer.join("");
      this.keyBuffer = [];

      let barcode;
      if (scannedInput.length === 26) {
        barcode = `${scannedInput.slice(12, 17)}-${scannedInput.slice(
          17,
          24
        )}-${scannedInput.slice(24, 25)}`;

        this.setState({ code: barcode });
        const { onCnicCaptured } = this.props;
        if (onCnicCaptured) {
          onCnicCaptured(barcode);
        }
      } else if (scannedInput.length > 50) {
        // Extract the CNIC number from the scanned input
        const parts = scannedInput.split("Enter");
        if (parts.length === 10) {
          const idPart = parts[1];

          barcode = idPart;
          if (idPart.length > 13) {
            barcode = `${idPart.slice(0, 5)}-${idPart.slice(
              5,
              12
            )}-${idPart.slice(12, 13)}`;
          }

          this.setState({ code: barcode });
          const { onCnicCaptured } = this.props;
          if (onCnicCaptured) {
            onCnicCaptured(barcode);
          }
        }
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