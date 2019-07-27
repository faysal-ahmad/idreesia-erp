import React, { Component } from "react";
import PropTypes from "prop-types";
import { Col, Input, Row } from "antd";
import { debounce } from "lodash";

export default class ScanBarcode extends Component {
  static propTypes = {
    onBarcodeCaptured: PropTypes.func,
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
      const scannedCode = this.keyBuffer.join("");
      this.keyBuffer = [];
      this.setState({ code: scannedCode });

      const { onBarcodeCaptured } = this.props;
      if (onBarcodeCaptured) {
        onBarcodeCaptured(scannedCode);
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
        <Col order={1}>Scan Barcode</Col>
        <Col order={2}>
          <Input readOnly value={this.state.code} />
        </Col>
      </Row>
    );
  }
}
