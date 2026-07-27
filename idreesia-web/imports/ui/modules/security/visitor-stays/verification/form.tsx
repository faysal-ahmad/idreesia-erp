import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Divider, Row } from 'antd';
import { ScanBarcode } from '/imports/ui/modules/helpers/controls';
import SearchResult from './search-result';

const ReactFragment = Fragment as any;
const AntDivider = Divider as any;
const AntRow = Row as any;
const ScanBarcodeControl = ScanBarcode as any;
const SearchResultComponent = SearchResult as any;
interface FormState { barcode: string; }

class Form extends Component<Record<string, never>, FormState> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    barcode: '',
  };

  onBarcodeCaptured = (code: string) => {
    this.setState({
      barcode: code,
    });
  };

  render() {
    return (
      <ReactFragment>
        <AntRow>
          <ScanBarcodeControl onBarcodeCaptured={this.onBarcodeCaptured} />
        </AntRow>
        <AntRow>
          <AntDivider />
        </AntRow>
        <AntRow>
          <SearchResultComponent barcode={this.state.barcode} />
        </AntRow>
      </ReactFragment>
    );
  }
}

export default WithBreadcrumbs(['Security', 'Visitor Card Verification'])(Form as any);
