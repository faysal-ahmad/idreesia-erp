import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { JobTypes } from 'meteor/idreesia-common/constants';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import List from './list/list';

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createAdminJob: PropTypes.func,
    removeAdminJob: PropTypes.func,
  };

  state = {
    jobType: null,
    status: null,
    pageIndex: 0,
    pageSize: 20,
  };

  jobTypePathsMap = {
    [JobTypes.ACCOUNTS_IMPORT]: paths.adminJobsNewAccountsImportPath,
    [JobTypes.VOUCHERS_IMPORT]: paths.adminJobsNewVouchersImportPath,
    [JobTypes.ACCOUNTS_CALCULATION]: paths.adminJobsNewAccountsCalculationPath,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleNewClicked = jobType => {
    const { history } = this.props;
    const path = this.jobTypePathsMap[jobType];
    history.push(path);
  };

  handleDeleteClicked = _id => {
    const { removeAdminJob } = this.props;
    removeAdminJob(_id);
  };

  render() {
    const { jobType, status, pageIndex, pageSize } = this.state;

    return (
      <List
        jobType={jobType}
        status={status}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageParams={this.setPageParams}
        handleNewClicked={this.handleNewClicked}
        handleDeleteClicked={this.handleDeleteClicked}
      />
    );
  }
}

const removeMutation = gql`
  mutation removeAdminJob($_id: String!) {
    removeAdminJob(_id: $_id)
  }
`;

export default flowRight(
  graphql(removeMutation, {
    name: 'removeAdminJob',
    options: {
      refetchQueries: ['pagedAdminJobs'],
    },
  }),
  WithBreadcrumbs(['Admin', 'Admin Jobs', 'List'])
)(ListContainer);
