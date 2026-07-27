import { Random } from "meteor/random";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Barcode from "react-barcode";

import { Button, Col, Row } from "antd";

const BarcodeView = Barcode as any;
const AntButton = Button as any;
const AntCol = Col as any;
const AntRow = Row as any;
interface Props { value?: string; onChange?(value: string): void; disabled?: boolean; }

export default class DisplayBarcode extends Component<Props> {
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
    width: 1,
    height: 20,
    format: "CODE128B",
    displayValue: true,
    background: "#ffffff",
    lineColor: "#000000",
    margin: 0,
  };

  render() {
    const { value, disabled } = this.props;
    const barcodeNode = value ? (
      <BarcodeView value={value} {...this.options} />
    ) : null;

    if (!disabled) {
      return (
        <AntRow type="flex" justify="start" align="middle" gutter={16}>
          <AntCol order={1}>{barcodeNode}</AntCol>
          <AntCol order={2}>
            <AntButton type="default" onClick={this.handleGenerate}>
              Generate
            </AntButton>
          </AntCol>
        </AntRow>
      );
    }

    return <BarcodeView value={value} />;
  }
}
