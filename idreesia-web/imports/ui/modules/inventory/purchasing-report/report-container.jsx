import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { flowRight } from 'lodash';

import { Formats } from 'meteor/idreesia-common/constants';
import { WithDynamicBreadcrumbs } from '/imports/ui/composers';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';

import Report from './report';

class ReportContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    physicalStoreId: PropTypes.string,
    physicalStoreLoading: PropTypes.bool,
    physicalStore: PropTypes.object,
  };

  state = {
    month: moment(),
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  render() {
    const { month } = this.state;
    const { physicalStoreId, physicalStoreLoading, physicalStore } = this.props;
    if (physicalStoreLoading) return null;

    const monthString = month.startOf('month').format(Formats.DATE_FORMAT);
    return (
      <Report
        month={month}
        monthString={monthString}
        physicalStoreId={physicalStoreId}
        physicalStore={physicalStore}
        setPageParams={this.setPageParams}
      />
    );
  }
}

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Reports, Purchasing Report`;
    }
    return `Inventory, Reports, Purchasing Report`;
  })
)(ReportContainer);
