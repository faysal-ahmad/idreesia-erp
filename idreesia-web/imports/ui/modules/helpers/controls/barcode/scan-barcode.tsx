import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { debounce } from 'meteor/idreesia-common/utilities/lodash';
import { Col, Input, Row } from 'antd';

const AntCol = Col as any;
const TextInput = Input as any;
const AntRow = Row as any;
interface Props { onBarcodeCaptured?(code: string): void; }
interface State { code: string; }

export default class ScanBarcode extends Component<Props, State> {
  static propTypes = {
    onBarcodeCaptured: PropTypes.func,
  };

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
      if (onBarcodeCaptured) {
        onBarcodeCaptured(scannedCode);
      }
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
      <AntRow type="flex" justify="start" align="middle" gutter={16}>
        <AntCol order={1}>Scan Barcode</AntCol>
        <AntCol order={2}>
          <TextInput readOnly value={this.state.code} />
        </AntCol>
      </AntRow>
    );
  }
}
