import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Pagination, Table } from 'antd';
import moment from 'moment';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { isFinite, toSafeInteger } from 'lodash';

import { WithBreadcrumbs, WithQueryParams } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

import ListFilter from './list-filter';

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,

    loading: PropTypes.bool,
    pagedIssuanceForms: PropTypes.shape({
      totalResults: PropTypes.number,
      issuanceForms: PropTypes.array,
    }),
    allPhysicalStores: PropTypes.array,
  };

  columns = [
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: text => {
        const date = moment(text);
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Issued To',
      dataIndex: 'issuedToName',
      key: 'issuedToName',
    },
    /*    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items, record) => {
        const formattedItems = items.map(
          item => `${getItemDisplayNameFromItemStockId(item.itemStockId)} - ${item.quantity}`
        );
        return formattedItems.join(',');
      },
    }, */
  ];

  constructor(props) {
    super(props);
    this.state = {
      selectedStoreId: null,
    };
  }

  refreshPage = newParams => {
    const { physicalStoreId, approvalStatus, startDate, endDate, pageIndex, pageSize } = newParams;
    const { queryParams, history, location } = this.props;

    let physicalStoreIdVal;
    if (newParams.hasOwnProperty('physicalStoreId')) physicalStoreIdVal = physicalStoreId || '';
    else physicalStoreIdVal = queryParams.physicalStoreId || '';

    let showApprovedVal;
    let showUnapprovedVal;
    if (newParams.hasOwnProperty('approvalStatus')) {
      showApprovedVal = approvalStatus.indexOf('approved') !== -1 ? 'true' : 'false';
      showUnapprovedVal = approvalStatus.indexOf('unapproved') !== -1 ? 'true' : 'false';
    } else {
      showApprovedVal = queryParams.showApproved || 'false';
      showUnapprovedVal = queryParams.showUnapproved || 'false';
    }

    let startDateVal;
    if (newParams.hasOwnProperty('startDate')) startDateVal = startDate.format('DD-MM-YYYY') || '';
    else startDateVal = queryParams.startDateVal || '';

    let endDateVal;
    if (newParams.hasOwnProperty('endDate')) endDateVal = endDate.format('DD-MM-YYYY') || '';
    else endDateVal = queryParams.endDateVal || '';

    let pageIndexVal;
    if (newParams.hasOwnProperty('pageIndex')) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty('pageSize')) pageSizeVal = pageSize || 10;
    else pageSizeVal = queryParams.pageSize || 10;

    const path = `${
      location.pathname
    }?physicalStoreId=${physicalStoreIdVal}&showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.issuanceFormsNewFormPath);
  };

  handleStoreChanged = value => {
    const selectedStoreId = value;
    const state = Object.assign({}, this.state, { selectedStoreId });
    this.setState(state);
  };

  handleDateRangeChange = (dates, dateStrings) => {
    console.log(dateStrings);
  };

  onChange = (pageIndex, pageSize) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  getTableHeader = () => {
    const { queryParams, allPhysicalStores } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
          New Issuance Form
        </Button>
        <ListFilter
          refreshPage={this.refreshPage}
          queryParams={queryParams}
          allPhysicalStores={allPhysicalStores}
        />
        {/*
            <div style={FilterBoxStyle}>
              <div>
                Issue Dates:&nbsp;
                <DatePicker.RangePicker onChange={this.handleDateRangeChange} />
              </div>
            </div>
           */}
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      queryParams: { pageIndex, pageSize },
      pagedIssuanceForms: { totalResults, issuanceForms },
    } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={issuanceForms}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
        footer={() => (
          <Pagination
            defaultCurrent={1}
            defaultPageSize={10}
            current={isFinite(pageIndex) ? toSafeInteger(pageIndex) + 1 : 1}
            pageSize={isFinite(pageSize) ? toSafeInteger(pageSize) : 10}
            showSizeChanger
            onChange={this.onChange}
            onShowSizeChange={this.onShowSizeChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}

const listQuery = gql`
  query pagedIssuanceForms($queryString: String) {
    pagedIssuanceForms(queryString: $queryString) {
      totalResults
      issuanceForms {
        _id
        issueDate
        issuedBy
        issuedTo
        issuedByName
        issuedToName
        physicalStoreId
        items {
          stockItemId
          quantity
        }
      }
    }
  }
`;

const physicalStoresListQuery = gql`
  query allPhysicalStores {
    allPhysicalStores {
      _id
      name
    }
  }
`;

export default compose(
  WithQueryParams(),
  graphql(physicalStoresListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({ variables: { queryString } }),
  }),
  WithBreadcrumbs(['Inventory', 'Forms', 'Issuance Forms', 'List'])
)(List);
