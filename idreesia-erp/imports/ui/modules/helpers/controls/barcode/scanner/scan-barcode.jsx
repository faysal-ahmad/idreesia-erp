import React, { Component } from "react";
import PropTypes from "prop-types";
import { Col, Input, Row } from "antd";

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

  handleKeyPress = event => {
    if (event.which === 13) {
      const code = "2q7C78WyzQwZMHS8M"; // this.keyBuffer.join("");
      this.setState({ code });
      this.keyBuffer = [];

      const { onBarcodeCaptured } = this.props;
      if (onBarcodeCaptured) {
        onBarcodeCaptured(code);
      }
    } else {
      this.keyBuffer.push(event.key);
    }
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
