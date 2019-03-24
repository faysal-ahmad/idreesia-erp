import { Random } from "meteor/random";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Col, Row } from "antd";
import Barcode from "react-barcode";

export default class DisplayBarcode extends Component {
  static propTypes = {
    value: PropTypes.string,
    initialValue: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    value: "",
  };

  handleGenerate = () => {
    const { onChange } = this.props;
    const updatedValue = Random.id();
    if (onChange) onChange(updatedValue);
  };

  options = {
    width: 2,
    height: 100,
    format: "CODE128B",
    displayValue: true,
    background: "#ffffff",
    lineColor: "#000000",
    margin: 0,
  };

  render() {
    const { value, disabled } = this.props;
    if (!disabled) {
      return (
        <Row type="flex" justify="start">
          <Col>
            <Barcode value={value} {...this.options} />
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
