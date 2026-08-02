import React, { Component } from 'react';

import { debounce } from 'meteor/idreesia-common/utilities/lodash';
import { Col, Input, Row } from 'antd';

interface Props {
  onBarcodeCaptured?(code: string): void;
}

interface State {
  code: string;
}

export default class ScanBarcode extends Component<Props, State> {
  state = {
    code: '',
  };

  keyBuffer: string[] = [];

  componentDidMount = () => {
    window.addEventListener('keypress', this.handleKeyPress);
  };

  componentWillUnmount = () => {
    window.removeEventListener('keypress', this.handleKeyPress);
  };

  sendBarcode = debounce(
    () => {
      let scannedCode = this.keyBuffer.join('');
      this.keyBuffer = [];
      if (scannedCode.endsWith('Enter')) {
        scannedCode = scannedCode.substring(0, scannedCode.length - 5);
      }

      this.setState({ code: scannedCode });
      const { onBarcodeCaptured } = this.props;
      onBarcodeCaptured?.(scannedCode);
    },
    50,
    { trailing: true, maxWait: 1000 }
  );

  handleKeyPress = (event: KeyboardEvent) => {
    this.keyBuffer.push(event.key);
    this.sendBarcode();
  };

  render() {
    return (
      <Row justify="start" align="middle" gutter={16}>
        <Col order={1}>Scan Barcode</Col>
        <Col order={2}>
          <Input readOnly value={this.state.code} />
        </Col>
      </Row>
    );
  }
}
