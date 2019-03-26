import { Random } from "meteor/random";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Col, Row } from "antd";
import Barcode from "react-barcode";

export default class DisplayBarcode extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
  };

  handleGenerate = () => {
    const { onChange } = this.props;
    const updatedValue = Random.id(8);
    if (onChange) onChange(updatedValue);
  };

  options = {
    width: 2,
    height: 60,
    format: "CODE128B",
    displayValue: true,
    background: "#ffffff",
    lineColor: "#000000",
    margin: 0,
  };

  render() {
    const { value, disabled } = this.props;
    const barcodeNode = value ? (
      <Barcode value={value} {...this.options} />
    ) : null;

    if (!disabled) {
      return (
        <Row type="flex" justify="start" align="middle" gutter={16}>
          <Col order={1}>{barcodeNode}</Col>
          <Col order={2}>
            <Button type="default" onClick={this.handleGenerate}>
              Generate
            </Button>
          </Col>
        </Row>
      );
    }

    return <Barcode value={value} />;
  }
}
