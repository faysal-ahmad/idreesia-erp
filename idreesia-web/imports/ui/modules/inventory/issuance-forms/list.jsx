import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import {
  flowRight,
  toSafeInteger,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  WithDynamicBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import {
  Button,
  Icon,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithLocationsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';

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
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    loading: PropTypes.bool,
    refetchListQuery: PropTypes.func,
    pagedIssuanceForms: PropTypes.shape({
      totalResults: PropTypes.number,
      issuanceForms: PropTypes.array,
    }),
    removeIssuanceForm: PropTypes.func,
    approveIssuanceForm: PropTypes.func,
  };

  columns = [
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: text => {
        const date = moment(Number(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Issued To',
      dataIndex: 'refIssuedTo.name',
      key: 'refIssuedTo.name',
      render: (text, record) => {
        if (record.handedOverTo) {
          return `${record.handedOverTo} - [on behalf of ${text}]`;
        }

        return text;
      },
    },
    {
      title: 'For Location',
      dataIndex: 'refLocation.name',
      key: 'refLocation.name',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: items => {
        const formattedItems = items.map(item => {
          const key = `${item.stockItemId}${item.isInflow}`;
          let quantity = item.quantity;
          if (item.unitOfMeasurement !== 'quantity') {
            quantity = `${quantity} ${item.unitOfMeasurement}`;
          }

          return (
            <li key={key}>
              {`${item.stockItemName} [${quantity} ${
                item.isInflow ? 'Returned' : 'Issued'
              }]`}
            </li>
          );
        });

        return <ul>{formattedItems}</ul>;
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
              <Popconfirm
                title="Are you sure you want to delete this issuance form?"
                onConfirm={() => {
                  this.handleDeleteClicked(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <Icon type="delete" style={IconStyle} />
                </Tooltip>
              </Popconfirm>
            </div>
          );
        }

        return (
          <Tooltip title="View">
            <Icon
              type="file"
              style={IconStyle}
              onClick={() => {
                this.handleViewClicked(record);
              }}
            />
          </Tooltip>
        );
      },
    },
  ];

  refreshPage = newParams => {
    const {
      approvalStatus,
      startDate,
      endDate,
      locationId,
      pageIndex,
      pageSize,
    } = newParams;
    const { queryParams, history, location } = this.props;

    let showApprovedVal;
    let showUnapprovedVal;
    if (newParams.hasOwnProperty('approvalStatus')) {
      showApprovedVal =
        approvalStatus.indexOf('approved') !== -1 ? 'true' : 'false';
      showUnapprovedVal =
        approvalStatus.indexOf('unapproved') !== -1 ? 'true' : 'false';
    } else {
      showApprovedVal = queryParams.showApproved || 'true';
      showUnapprovedVal = queryParams.showUnapproved || 'true';
    }

    let locationIdVal;
    if (newParams.hasOwnProperty('locationId')) locationIdVal = locationId;
    else locationIdVal = queryParams.locationId || '';

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
    if (newParams.hasOwnProperty('pageSize')) pageSizeVal = pageSize || 20;
    else pageSizeVal = queryParams.pageSize || 20;

    const path = `${location.pathname}?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&locationId=${locationIdVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsNewFormPath(physicalStoreId));
  };

  handleEditClicked = record => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsEditFormPath(physicalStoreId, record._id));
  };

  handleViewClicked = record => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsViewFormPath(physicalStoreId, record._id));
  };

  handleDeleteClicked = issuanceForm => {
    const { removeIssuanceForm } = this.props;
    removeIssuanceForm({
      variables: { _id: issuanceForm._id },
    })
      .then(() => {
        message.success('Issuance form has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleApproveClicked = issuanceForm => {
    const { approveIssuanceForm } = this.props;
    approveIssuanceForm({
      variables: { _id: issuanceForm._id },
    })
      .then(() => {
        message.success('Issuance form has been approved.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
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
    const {
      locationsByPhysicalStoreId,
      queryParams,
      refetchListQuery,
    } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button
          type="primary"
          icon="plus-circle-o"
          onClick={this.handleNewClicked}
        >
          New Issuance Form
        </Button>
        <ListFilter
          allLocations={locationsByPhysicalStoreId}
          refreshPage={this.refreshPage}
          queryParams={queryParams}
          refreshData={refetchListQuery}
        />
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

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <Table
        rowKey="_id"
        dataSource={issuanceForms}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
        size="small"
        pagination={false}
        footer={() => (
          <Pagination
            defaultCurrent={1}
            defaultPageSize={20}
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
    );
  }
}

const formMutationRemove = gql`
  mutation removeIssuanceForm($_id: String!) {
    removeIssuanceForm(_id: $_id)
  }
`;

const formMutationApprove = gql`
  mutation approveIssuanceForm($_id: String!) {
    approveIssuanceForm(_id: $_id) {
      _id
      issueDate
      issuedBy
      issuedTo
      locationId
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
        stockItemName
        unitOfMeasurement
      }
      refIssuedTo {
        _id
        name
      }
    }
  }
`;

const listQuery = gql`
  query pagedIssuanceForms($physicalStoreId: String!, $queryString: String) {
    pagedIssuanceForms(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      issuanceForms {
        _id
        issueDate
        issuedBy
        issuedTo
        handedOverTo
        locationId
        physicalStoreId
        approvedOn
        items {
          stockItemId
          quantity
          isInflow
          stockItemName
          unitOfMeasurement
        }
        refIssuedTo {
          _id
          name
        }
        refLocation {
          _id
          name
        }
      }
    }
  }
`;

export default flowRight(
  WithQueryParams(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithLocationsByPhysicalStore(),
  graphql(formMutationRemove, {
    name: 'removeIssuanceForm',
    options: {
      refetchQueries: [
        'pagedIssuanceForms',
        'issuanceFormsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  graphql(formMutationApprove, {
    name: 'approveIssuanceForm',
    options: {
      refetchQueries: [
        'pagedIssuanceForms',
        'issuanceFormsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ refetchListQuery: data.refetch, ...data }),
    options: ({ physicalStoreId, queryString }) => ({
      variables: { physicalStoreId, queryString },
    }),
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Issuance Forms, List`;
    }
    return `Inventory, Issuance Forms, List`;
  })
)(List);
