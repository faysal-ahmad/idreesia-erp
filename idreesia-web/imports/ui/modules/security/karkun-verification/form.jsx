import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Divider, Row } from '/imports/ui/controls';
import { ScanBarcode } from '/imports/ui/modules/helpers/controls';
import SearchResult from './search-result';

class Form extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  onBarcodeCaptured = code => {
    const { history } = this.props;
    history.push(`${paths.karkunCardVerificationPath}?cardId=${code}`);
  };

  render() {
    const {
      queryParams: { cardId },
    } = this.props;

    return (
      <Fragment>
        <Row>
          <ScanBarcode onBarcodeCaptured={this.onBarcodeCaptured} />
        </Row>
        <Row>
          <Divider />
        </Row>
        <Row>{cardId ? <SearchResult barcode={cardId} /> : null}</Row>
      </Fragment>
    );
  }
}

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['Security', 'Karkun Card Verification'])
)(Form);
