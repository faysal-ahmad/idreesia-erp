import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { debounce } from 'meteor/idreesia-common/utilities/lodash';
import { Col, Input, Row } from '/imports/ui/controls';

export default class ScanCnic extends Component {
  static propTypes = {
    onCnicCaptured: PropTypes.func,
  };

  state = {
    codes: [],
  };

  keyBuffer = [];

  componentDidMount = () => {
    window.addEventListener('keypress', this.handleKeyPress);
  };

  componentWillUnmount = () => {
    window.removeEventListener('keypress', this.handleKeyPress);
  };

  resetState = () => {
    this.setState({ codes: [] });
  };

  formatCnicNumber = cnicString =>
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

      let barcodes = [];
      if (scannedInput.length === 15) {
        barcodes = [
          this.formatCnicNumber(scannedInput.slice(0, 13)),
          this.formatCnicNumber(scannedInput.slice(1, 14)),
        ];

        this.setState({ codes: barcodes });
        if (onCnicCaptured) {
          onCnicCaptured(barcodes);
        }
      } else if (scannedInput.length === 25) {
        barcodes = [
          this.formatCnicNumber(scannedInput.slice(11, 24)),
          this.formatCnicNumber(scannedInput.slice(10, 23)),
        ];

        this.setState({ codes: barcodes });
        if (onCnicCaptured) {
          onCnicCaptured(barcodes);
        }
      } else if (scannedInput.length === 26) {
        barcodes = [
          this.formatCnicNumber(scannedInput.slice(11, 24)),
          this.formatCnicNumber(scannedInput.slice(12, 25)),
        ];

        this.setState({ codes: barcodes });
        if (onCnicCaptured) {
          onCnicCaptured(barcodes);
        }
      } else if (scannedInput.length > 50) {
        // Old 2D CNIC Formats
        const parts = scannedInput.split('Enter');
        if (parts.length > 6) {
          if (parts[1].length >= 13) {
            barcodes.push(this.formatCnicNumber(parts[1].slice(0, 13)));
          }
          if (parts[2].length >= 13) {
            barcodes.push(this.formatCnicNumber(parts[2].slice(0, 13)));
          }

          this.setState({ codes: barcodes });
          if (onCnicCaptured) {
            onCnicCaptured(barcodes);
          }
        }
      } else if (onCnicCaptured) {
        onCnicCaptured([]);
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
    const { codes } = this.state;

    return (
      <Row type="flex" justify="start" align="middle" gutter={16}>
        <Col order={1}>Scan CNIC</Col>
        <Col order={2}>
          {codes.length > 0 ? (
            this.state.codes.map((code, index) => (
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
