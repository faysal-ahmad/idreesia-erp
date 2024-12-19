import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithLocationsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';

import Report from './report';

class ReportContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    physicalStoreId: PropTypes.string,
    physicalStoreLoading: PropTypes.bool,
    physicalStore: PropTypes.object,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
  };

  state = {
    month: dayjs(),
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  render() {
    const { month } = this.state;
    const {
      physicalStoreId,
      physicalStoreLoading,
      locationsLoading,
      locationsByPhysicalStoreId,
    } = this.props;
    if (physicalStoreLoading || locationsLoading) return null;

    const monthString = dayjs(month).startOf('month').format(Formats.DATE_FORMAT);
    return (
      <Report
        month={month}
        monthString={monthString}
        physicalStoreId={physicalStoreId}
        locations={locationsByPhysicalStoreId}
        setPageParams={this.setPageParams}
      />
    );
  }
}

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithLocationsByPhysicalStore(),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Reports, Purchasing Report`;
    }
    return `Inventory, Reports, Purchasing Report`;
  })
)(ReportContainer);
