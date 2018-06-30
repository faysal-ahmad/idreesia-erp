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
    pagedPurchaseForms: PropTypes.shape({
      totalResults: PropTypes.number,
      purchaseForms: PropTypes.array,
    }),
    allPhysicalStores: PropTypes.array,
    removePurchaseForm: PropTypes.func,
    approvePurchaseForm: PropTypes.func,
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
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: text => {
        const date = moment(new Date(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Purchased By',
      dataIndex: 'purchasedByName',
      key: 'purchasedByName',
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
    history.push(paths.purchaseFormsNewFormPath);
  };

  handleEditClicked = record => {
    const { history } = this.props;
    history.push(`${paths.purchaseFormsPath}/${record._id}`);
  };

  handleDeleteClicked = purchaseForm => {
    const { removePurchaseForm } = this.props;
    removePurchaseForm({
      variables: { _id: purchaseForm._id },
    })
      .then(() => {
        message.success('Purchase form has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleApproveClicked = purchaseForm => {
    const { approvePurchaseForm } = this.props;
    approvePurchaseForm({
      variables: { _id: purchaseForm._id },
    })
      .then(() => {
        message.success('Purchase form has been approved.', 5);
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
          New Purchase Form
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
      pagedPurchaseForms: { totalResults, purchaseForms },
    } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={purchaseForms}
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
  mutation removePurchaseForm($_id: String!) {
    removePurchaseForm(_id: $_id)
  }
`;

const formMutationApprove = gql`
  mutation approvePurchaseForm($_id: String!) {
    approvePurchaseForm(_id: $_id)
  }
`;

const listQuery = gql`
  query pagedPurchaseForms($queryString: String) {
    pagedPurchaseForms(queryString: $queryString) {
      totalResults
      purchaseForms {
        _id
        purchaseDate
        receivedBy
        purchasedBy
        receivedByName
        purchasedByName
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
    name: 'removePurchaseForm',
    options: {
      refetchQueries: ['pagedPurchaseForms', 'purchaseFormsByStockItem', 'pagedStockItems'],
    },
  }),
  graphql(formMutationApprove, {
    name: 'approvePurchaseForm',
    options: {
      refetchQueries: ['pagedPurchaseForms', 'purchaseFormsByStockItem', 'pagedStockItems'],
    },
  }),
  graphql(physicalStoresListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({ variables: { queryString } }),
  }),
  WithBreadcrumbs(['Inventory', 'Forms', 'Purchase Forms', 'List'])
)(List);
