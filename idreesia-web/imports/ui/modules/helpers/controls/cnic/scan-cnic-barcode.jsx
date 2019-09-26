import React, { Component } from "react";
import PropTypes from "prop-types";
import { debounce } from "lodash";

import { Col, Input, Row } from "/imports/ui/controls";

export default class ScanCnicBarcode extends Component {
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
      if (scannedInput.length === 8) {
        barcode = scannedInput;
      } else if (scannedInput.length > 50) {
        // Extract the CNIC number from the scanned input
        const parts = scannedInput.split("Enter");
        const idPart = parts[1];

        barcode = idPart;
        if (idPart.length > 13) {
          barcode = idPart.slice(0, 13);
        }
      }

      this.setState({ code: barcode });

      const { onCnicCaptured } = this.props;
      if (onCnicCaptured) {
        onCnicCaptured(barcode);
      }
    },
    50,
    { trailing: true, maxWait: 1000 }
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
