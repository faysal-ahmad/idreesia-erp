import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  WithCompanyId,
  WithCompany,
} from '/imports/ui/modules/accounts/common/composers';

import List from './list';

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    setBreadcrumbs: PropTypes.func,

    companyId: PropTypes.string,
    companyLoading: PropTypes.bool,
    company: PropTypes.object,
  };

  state = {
    month: moment(),
  };

  componentDidMount() {
    const { company, setBreadcrumbs } = this.props;
    if (company) {
      setBreadcrumbs([company.name, 'Activity Sheet']);
    }
  }

  componentDidUpdate(prevProps) {
    const { company, setBreadcrumbs } = this.props;
    if (prevProps.company !== company) {
      setBreadcrumbs([company.name, 'Activity Sheet']);
    }
  }

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  render() {
    const { month } = this.state;
    const { companyId, companyLoading, company } = this.props;
    if (companyLoading) return null;

    const monthString = month.startOf('month').format(Formats.DATE_FORMAT);
    return (
      <List
        month={month}
        monthString={monthString}
        companyId={companyId}
        company={company}
        setPageParams={this.setPageParams}
      />
    );
  }
}

export default flowRight(
  WithCompanyId(),
  WithCompany(),
  WithBreadcrumbs(['Accounts', 'Activity Sheet'])
)(ListContainer);
