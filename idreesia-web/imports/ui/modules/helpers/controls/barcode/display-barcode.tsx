import { Random } from 'meteor/random';
import React, { Component } from 'react';
import Barcode from 'react-barcode';

import { Button, Col, Row } from 'antd';

const BarcodeView = Barcode as any;

interface Props {
  value?: string;
  onChange?(value: string): void;
  disabled?: boolean;
}

export default class DisplayBarcode extends Component<Props> {
  handleGenerate = () => {
    const { onChange } = this.props;
    const updatedValue = Random.id(8);
    onChange?.(updatedValue);
  };

  options = {
    width: 1,
    height: 20,
    format: 'CODE128B',
    displayValue: true,
    background: '#ffffff',
    lineColor: '#000000',
    margin: 0,
  };

  render() {
    const { value, disabled } = this.props;
    const barcodeNode = value ? (
      <BarcodeView value={value} {...this.options} />
    ) : null;

    if (!disabled) {
      return (
        <Row justify="start" align="middle" gutter={16}>
          <Col order={1}>{barcodeNode}</Col>
          <Col order={2}>
            <Button type="default" onClick={this.handleGenerate}>
              Generate
            </Button>
          </Col>
        </Row>
      );
    }

    return <BarcodeView value={value} />;
  }
}
