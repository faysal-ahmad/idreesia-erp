import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Divider, Row } from 'antd';
import { ScanBarcode } from '/imports/ui/modules/helpers/controls';
import SearchResult from './search-result';

const ReactFragment = Fragment as any;
const AntDivider = Divider as any;
const AntRow = Row as any;
const ScanBarcodeControl = ScanBarcode as any;
const ScanSearchResult = SearchResult as any;
interface HistoryLike { push(path: string): void; }
interface ScanCardProps { history: HistoryLike; location?: unknown; queryString?: string; queryParams: { cardId?: string }; }

class ScanCard extends Component<ScanCardProps> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  onBarcodeCaptured = (code: string) => {
    const { history } = this.props;
    history.push(`${paths.karkunsScanCardPath}?cardId=${code}`);
  };

  render() {
    const {
      queryParams: { cardId },
    } = this.props;

    return (
      <ReactFragment>
        <AntRow>
          <ScanBarcodeControl onBarcodeCaptured={this.onBarcodeCaptured} />
        </AntRow>
        <AntRow>
          <AntDivider />
        </AntRow>
        <AntRow>{cardId ? <ScanSearchResult barcode={cardId} /> : null}</AntRow>
      </ReactFragment>
    );
  }
}

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['HR', 'Karkuns', 'Scan Card'])
)(ScanCard as any);
