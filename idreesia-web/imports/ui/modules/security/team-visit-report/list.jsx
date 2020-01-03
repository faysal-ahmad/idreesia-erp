import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Pagination, Table } from '/imports/ui/controls';

import ListFilter from './list-filter';

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,

    loading: PropTypes.bool,
    pagedTeamVisits: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  visitDateColumn = {
    title: 'Visit Date',
    key: 'visitDate',
    dataIndex: 'visitDate',
    render: text => moment(Number(text)).format('DD MMM, YYYY'),
  };

  teamNameColumn = {
    title: 'Team Name',
    key: 'teamName',
    dataIndex: 'teamName',
  };

  membersCountColumn = {
    title: 'Members Count',
    key: 'membersCount',
    dataIndex: 'membersCount',
  };

  getColumns = () => [
    this.visitDateColumn,
    this.teamNameColumn,
    this.membersCountColumn,
  ];

  onChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  getTableHeader = () => {
    const { queryParams, setPageParams } = this.props;

    return (
      <div className="list-table-header">
        <ListFilter queryParams={queryParams} setPageParams={setPageParams} />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedTeamVisits: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Fragment>
        <Table
          rowKey="_id"
          dataSource={data}
          columns={this.getColumns()}
          title={this.getTableHeader}
          bordered
          size="small"
          pagination={false}
          footer={() => (
            <Pagination
              current={numPageIndex}
              pageSize={numPageSize}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={this.onChange}
              onShowSizeChange={this.onShowSizeChange}
              total={totalResults}
            />
          )}
        />
      </Fragment>
    );
  }
}

const listQuery = gql`
  query pagedTeamVisits($queryString: String!) {
    pagedTeamVisits(queryString: $queryString) {
      totalResults
      data {
        _id
        teamName
        visitDate
        membersCount
      }
    }
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({
      variables: {
        queryString,
      },
    }),
  })
)(List);
