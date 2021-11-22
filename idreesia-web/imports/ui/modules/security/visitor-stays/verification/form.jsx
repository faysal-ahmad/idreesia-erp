import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Divider, Row } from 'antd';
import { ScanBarcode } from '/imports/ui/modules/helpers/controls';
import SearchResult from './search-result';

class Form extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    barcode: '',
  };

  onBarcodeCaptured = code => {
    this.setState({
      barcode: code,
    });
  };

  render() {
    return (
      <Fragment>
        <Row>
          <ScanBarcode onBarcodeCaptured={this.onBarcodeCaptured} />
        </Row>
        <Row>
          <Divider />
        </Row>
        <Row>
          <SearchResult barcode={this.state.barcode} />
        </Row>
      </Fragment>
    );
  }
}

export default WithBreadcrumbs(['Security', 'Visitor Card Verification'])(Form);
