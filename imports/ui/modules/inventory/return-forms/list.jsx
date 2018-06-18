import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Icon, Pagination, Table, Tooltip, message } from 'antd';
import moment from 'moment';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { isFinite, toSafeInteger } from 'lodash';

import { Formats } from '/imports/lib/constants';
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

const ActionsStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const IconStyle = {
  cursor: 'pointer',
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,

    loading: PropTypes.bool,
    pagedReturnForms: PropTypes.shape({
      totalResults: PropTypes.number,
      returnForms: PropTypes.array,
    }),
    allPhysicalStores: PropTypes.array,
    removeReturnForm: PropTypes.func,
    approveReturnForm: PropTypes.func,
  };

  columns = [
    {
      title: 'Approved',
      dataIndex: 'approvedOn',
      key: 'approvedOn',
      render: text => {
        let value = false;
        if (text) value = true;
        return <Checkbox checked={value} disabled />;
      },
    },
    {
      title: 'Return Date',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: text => {
        const date = moment(new Date(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Returned By',
      dataIndex: 'returnedByName',
      key: 'returnedByName',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: items => {
        const formattedItems = items.map(item => `${item.itemTypeName} - ${item.quantity}`);
        return formattedItems.join(', ');
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, record) => {
        if (!record.approvedOn) {
          return (
            <div style={ActionsStyle}>
              <Tooltip title="Approve">
                <Icon
                  type="check-square-o"
                  style={IconStyle}
                  onClick={() => {
                    this.handleApproveClicked(record);
                  }}
                />
              </Tooltip>
              <Tooltip title="Edit">
                <Icon
                  type="edit"
                  style={IconStyle}
                  onClick={() => {
                    this.handleEditClicked(record);
                  }}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Icon
                  type="delete"
                  style={IconStyle}
                  onClick={() => {
                    this.handleDeleteClicked(record);
                  }}
                />
              </Tooltip>
            </div>
          );
        }

        return null;
      },
    },
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
      showApprovedVal = queryParams.showApproved || 'true';
      showUnapprovedVal = queryParams.showUnapproved || 'true';
    }

    let startDateVal;
    if (newParams.hasOwnProperty('startDate'))
      startDateVal = startDate ? startDate.format(Formats.DATE_FORMAT) : '';
    else startDateVal = queryParams.startDateVal || '';

    let endDateVal;
    if (newParams.hasOwnProperty('endDate'))
      endDateVal = endDate ? endDate.format(Formats.DATE_FORMAT) : '';
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
    history.push(paths.returnFormsNewFormPath);
  };

  handleEditClicked = record => {
    const { history } = this.props;
    history.push(`${paths.returnFormsPath}/${record._id}`);
  };

  handleDeleteClicked = returnForm => {
    const { removeReturnForm } = this.props;
    removeReturnForm({
      variables: { _id: returnForm._id },
    })
      .then(() => {
        message.success('Return form has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleApproveClicked = returnForm => {
    const { approveReturnForm } = this.props;
    approveReturnForm({
      variables: { _id: returnForm._id },
    })
      .then(() => {
        message.success('Return form has been approved.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleStoreChanged = value => {
    const selectedStoreId = value;
    const state = Object.assign({}, this.state, { selectedStoreId });
    this.setState(state);
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
          New Return Form
        </Button>
        <ListFilter
          refreshPage={this.refreshPage}
          queryParams={queryParams}
          allPhysicalStores={allPhysicalStores}
        />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      queryParams: { pageIndex, pageSize },
      pagedReturnForms: { totalResults, returnForms },
    } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={returnForms}
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

const formMutationRemove = gql`
  mutation removeReturnForm($_id: String!) {
    removeReturnForm(_id: $_id)
  }
`;

const formMutationApprove = gql`
  mutation approveReturnForm($_id: String!) {
    approveReturnForm(_id: $_id)
  }
`;

const listQuery = gql`
  query pagedReturnForms($queryString: String) {
    pagedReturnForms(queryString: $queryString) {
      totalResults
      returnForms {
        _id
        returnDate
        receivedBy
        returnedBy
        receivedByName
        returnedByName
        physicalStoreId
        approvedOn
        items {
          stockItemId
          quantity
          itemTypeName
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
  graphql(formMutationRemove, {
    name: 'removeReturnForm',
    options: {
      refetchQueries: ['pagedReturnForms', 'returnFormsByStockItem', 'pagedStockItems'],
    },
  }),
  graphql(formMutationApprove, {
    name: 'approveReturnForm',
    options: {
      refetchQueries: ['pagedReturnForms', 'returnFormsByStockItem', 'pagedStockItems'],
    },
  }),
  graphql(physicalStoresListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({ variables: { queryString } }),
  }),
  WithBreadcrumbs(['Inventory', 'Forms', 'Return Forms', 'List'])
)(List);
