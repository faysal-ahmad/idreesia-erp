import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Divider, Row } from '/imports/ui/controls';
import { ScanBarcode } from '/imports/ui/modules/helpers/controls';
import SearchResult from './search-result';

class ScanCard extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  onBarcodeCaptured = code => {
    history.push(`${paths.karkunsScanCardPath}?cardId=${code}`);
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
        <Row>
          <SearchResult barcode={cardId} />
        </Row>
      </Fragment>
    );
  }
}

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['HR', 'Karkuns', 'Scan Card'])
)(ScanCard);
