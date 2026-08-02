import React, { Component } from 'react';

import { debounce } from 'meteor/idreesia-common/utilities/lodash';
import { Col, Input, Row } from 'antd';

interface Props {
  onCnicCaptured?(codes: string[]): void;
}

interface State {
  codes: string[];
}

export default class ScanCnic extends Component<Props, State> {
  state = {
    codes: [],
  };

  keyBuffer: string[] = [];

  componentDidMount = () => {
    window.addEventListener('keypress', this.handleKeyPress);
  };

  componentWillUnmount = () => {
    window.removeEventListener('keypress', this.handleKeyPress);
  };

  resetState = () => {
    this.setState({ codes: [] });
  };

  formatCnicNumber = (cnicString: string) =>
    `${cnicString.slice(0, 5)}-${cnicString.slice(5, 12)}-${cnicString.slice(
      12,
      13
    )}`;

  sendBarcode = debounce(
    () => {
      const { onCnicCaptured } = this.props;
      const scannedInput = this.keyBuffer.join('');
      setTimeout(() => {
        this.keyBuffer = [];
      }, 3000);

      let barcodes: string[] = [];
      if (scannedInput.length === 15) {
        barcodes = [
          this.formatCnicNumber(scannedInput.slice(0, 13)),
          this.formatCnicNumber(scannedInput.slice(1, 14)),
        ];

        this.setState({ codes: barcodes });
        onCnicCaptured?.(barcodes);
      } else if (scannedInput.length === 25) {
        barcodes = [
          this.formatCnicNumber(scannedInput.slice(11, 24)),
          this.formatCnicNumber(scannedInput.slice(10, 23)),
        ];

        this.setState({ codes: barcodes });
        onCnicCaptured?.(barcodes);
      } else if (scannedInput.length === 26) {
        barcodes = [
          this.formatCnicNumber(scannedInput.slice(11, 24)),
          this.formatCnicNumber(scannedInput.slice(12, 25)),
        ];

        this.setState({ codes: barcodes });
        onCnicCaptured?.(barcodes);
      } else if (scannedInput.length > 50) {
        const parts = scannedInput.split('Enter');
        if (parts.length > 6) {
          if (parts[1].length >= 13) {
            barcodes.push(this.formatCnicNumber(parts[1].slice(0, 13)));
          }
          if (parts[2].length >= 13) {
            barcodes.push(this.formatCnicNumber(parts[2].slice(0, 13)));
          }

          this.setState({ codes: barcodes });
          onCnicCaptured?.(barcodes);
        }
      } else {
        onCnicCaptured?.([]);
      }
    },
    100,
    { trailing: true, maxWait: 2000 }
  );

  handleKeyPress = (event: KeyboardEvent) => {
    this.keyBuffer.push(event.key);
    this.sendBarcode();
  };

  render() {
    const { codes } = this.state;

    return (
      <Row justify="start" align="middle" gutter={16}>
        <Col order={1}>Scan CNIC</Col>
        <Col order={2}>
          {codes.length > 0 ? (
            codes.map((code, index) => (
              <Input key={index} readOnly value={code} />
            ))
          ) : (
            <Input readOnly />
          )}
        </Col>
      </Row>
    );
  }
}
