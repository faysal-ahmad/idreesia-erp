import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  Dropdown,
  Menu,
  Modal,
  Table,
  Tooltip,
  Pagination,
  Popconfirm,
  message,
} from '/imports/ui/controls';
import { StockItemName } from '/imports/ui/modules/inventory/common/controls';
import ListFilter from './list-filter';

const MinStockLevelStyle = {
  display: 'flex',
  justifyContent: 'center',
};

const StockLevelVerificationOk = {
  display: 'flex',
  justifyContent: 'center',
  cursor: 'pointer',
};

const StockLevelVerificationWarning = {
  display: 'flex',
  justifyContent: 'center',
  color: 'orange',
  cursor: 'pointer',
};

const StockLevelVerificationError = {
  display: 'flex',
  justifyContent: 'center',
  color: 'red',
  cursor: 'pointer',
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    physicalStoreId: PropTypes.string,
    name: PropTypes.string,
    categoryId: PropTypes.string,
    verifyDuration: PropTypes.string,
    stockLevel: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    showNewButton: PropTypes.bool,
    showSelectionColumn: PropTypes.bool,
    showActions: PropTypes.bool,
    handleNewClicked: PropTypes.func,
    removeStockItem: PropTypes.func,
    mergeStockItems: PropTypes.func,
    recalculateStockLevels: PropTypes.func,
    verifyStockItemLevel: PropTypes.func,

    loading: PropTypes.bool,
    refetchListQuery: PropTypes.func,
    pagedStockItems: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  state = {
    selectedRows: [],
  };

  getColumns = () => {
    const { showActions } = this.props;
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <StockItemName
            stockItem={record}
            onStockItemNameClicked={this.props.handleItemSelected}
          />
        ),
      },
      {
        title: 'Company',
        dataIndex: 'company',
        key: 'company',
      },
      {
        title: 'Details',
        dataIndex: 'details',
        key: 'details',
      },
      {
        title: 'Category',
        dataIndex: 'categoryName',
        key: 'categoryName',
      },
      {
        title: 'Min Stock',
        dataIndex: 'minStockLevel',
        key: 'minStockLevel',
        render: (text, record) => {
          let stockLevel = text || '';
          if (text && record.unitOfMeasurement !== 'quantity') {
            stockLevel = `${stockLevel} ${record.unitOfMeasurement}`;
          }

          return <div style={MinStockLevelStyle}>{stockLevel}</div>;
        },
      },
      {
        title: 'Current Stock',
        dataIndex: 'currentStockLevel',
        key: 'currentStockLevel',
        render: (text, record) => {
          let stockLevel = text || 0;
          if (record.unitOfMeasurement !== 'quantity')
            stockLevel = `${stockLevel} ${record.unitOfMeasurement}`;

          let style = StockLevelVerificationError;
          let tooltip = `Stock level has never been verified.`;

          if (record.verifiedOn) {
            const now = moment();
            const lastVerified = moment(Number(record.verifiedOn));
            const duration = moment.duration(now.diff(lastVerified)).months();
            tooltip = `Stock level verified on ${lastVerified.format(
              Formats.DATE_FORMAT
            )}`;
            if (duration < 3) {
              style = StockLevelVerificationOk;
            } else if (duration < 6) {
              style = StockLevelVerificationWarning;
            }
          }

          return (
            <Tooltip title={tooltip}>
              <div
                style={style}
                onClick={() => {
                  this.handleStockLevelClicked(record);
                }}
              >
                {stockLevel}
              </div>
            </Tooltip>
          );
        },
      },
    ];

    if (showActions) {
      columns.push({
        title: 'Actions',
        key: 'action',
        render: (text, record) => {
          const {
            purchaseFormsCount,
            issuanceFormsCount,
            stockAdjustmentsCount,
          } = record;

          if (
            purchaseFormsCount + issuanceFormsCount + stockAdjustmentsCount ===
            0
          ) {
            return (
              <div className="list-actions-column">
                <Popconfirm
                  title="Are you sure you want to delete this stock item?"
                  onConfirm={() => {
                    this.handleDeleteClicked(record);
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Delete">
                    <DeleteOutlined className="list-actions-icon" />
                  </Tooltip>
                </Popconfirm>
              </div>
            );
          }

          return null;
        },
      });
    }

    return columns;
  };

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows,
      });
    },
  };

  handleDeleteClicked = stockItem => {
    const { physicalStoreId, removeStockItem } = this.props;
    removeStockItem({
      variables: {
        _id: stockItem._id,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Stock item has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleMergeClicked = () => {
    const { selectedRows } = this.state;
    const { physicalStoreId, mergeStockItems } = this.props;

    const ids = selectedRows.map(({ _id }) => _id);
    mergeStockItems({
      variables: {
        ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Stock items have been merged.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleRecalculateClicked = () => {
    const { selectedRows } = this.state;
    const { physicalStoreId, recalculateStockLevels } = this.props;

    const ids = selectedRows.map(({ _id }) => _id);
    recalculateStockLevels({
      variables: {
        ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Stock levels have been recalculated.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleStockLevelClicked = record => {
    const { physicalStoreId, verifyStockItemLevel } = this.props;
    Modal.confirm({
      title: 'Stock Level Verification',
      content: `Have you verified that the current stock level of "${
        record.name
      }" is ${record.currentStockLevel || 0}?`,
      onOk() {
        verifyStockItemLevel({
          variables: {
            _id: record._id,
            physicalStoreId,
          },
        })
          .then(() => {
            message.success(
              `Verification date for stock level of "${record.name}" was set.`,
              5
            );
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      },
    });
  };

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

  handleMenuClick = ({ key }) => {
    const { selectedRows } = this.state;
    if (key === 'merge') {
      if (selectedRows.length <= 1) {
        message.info('You need to select multiple stock items to merge.', 5);
        return;
      }

      Modal.confirm({
        title: 'Merge selected items',
        content:
          'Are you sure you want to merge these items? This cannot be undone.',
        onOk: this.handleMergeClicked,
        onCancel() {},
      });
    } else if (key === 'recalculate') {
      this.handleRecalculateClicked();
    }
  };

  getTableHeader = () => {
    const {
      name,
      categoryId,
      verifyDuration,
      stockLevel,
      physicalStoreId,
      setPageParams,
      showNewButton,
      handleNewClicked,
      refetchListQuery,
    } = this.props;

    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="merge">Merge Selected Items</Menu.Item>
        <Menu.Item key="recalculate">Recalculate Stock Level</Menu.Item>
      </Menu>
    );

    let newButton = null;
    if (showNewButton) {
      newButton = (
        <Dropdown.Button
          type="primary"
          icon={<DownOutlined />}
          onClick={handleNewClicked}
          overlay={menu}
        >
          New Stock Item
        </Dropdown.Button>
      );
    }

    return (
      <div className="list-table-header">
        {newButton}
        <ListFilter
          name={name}
          physicalStoreId={physicalStoreId}
          categoryId={categoryId}
          verifyDuration={verifyDuration}
          stockLevel={stockLevel}
          setPageParams={setPageParams}
          refreshData={refetchListQuery}
        />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      showSelectionColumn,
      pagedStockItems: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.getColumns()}
        bordered
        size="small"
        pagination={false}
        title={this.getTableHeader}
        rowSelection={showSelectionColumn ? this.rowSelection : null}
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

const listQuery = gql`
  query pagedStockItems($physicalStoreId: String!, $queryString: String) {
    pagedStockItems(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      data {
        _id
        name
        formattedName
        company
        details
        imageId
        categoryName
        unitOfMeasurement
        minStockLevel
        currentStockLevel
        totalStockLevel
        verifiedOn
        purchaseFormsCount
        issuanceFormsCount
        stockAdjustmentsCount
      }
    }
  }
`;

const formMutationVerify = gql`
  mutation verifyStockItemLevel($_id: String!, $physicalStoreId: String!) {
    verifyStockItemLevel(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      verifiedOn
    }
  }
`;

const formMutationRemove = gql`
  mutation removeStockItem($_id: String!, $physicalStoreId: String!) {
    removeStockItem(_id: $_id, physicalStoreId: $physicalStoreId)
  }
`;

const formMutationMerge = gql`
  mutation mergeStockItems($ids: [String]!, $physicalStoreId: String!) {
    mergeStockItems(ids: $ids, physicalStoreId: $physicalStoreId) {
      _id
      currentStockLevel
      purchaseFormsCount
      issuanceFormsCount
      stockAdjustmentsCount
    }
  }
`;

const formMutationRecalculate = gql`
  mutation recalculateStockLevels($ids: [String]!, $physicalStoreId: String!) {
    recalculateStockLevels(ids: $ids, physicalStoreId: $physicalStoreId) {
      _id
      currentStockLevel
      purchaseFormsCount
      issuanceFormsCount
      stockAdjustmentsCount
    }
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ refetchListQuery: data.refetch, ...data }),
    options: ({
      physicalStoreId,
      categoryId,
      name,
      verifyDuration,
      stockLevel,
      pageIndex,
      pageSize,
    }) => ({
      variables: {
        physicalStoreId,
        queryString: `?categoryId=${categoryId || ''}&name=${name ||
          ''}&verifyDuration=${verifyDuration || ''}&stockLevel=${stockLevel ||
          ''}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  }),
  graphql(formMutationVerify, {
    name: 'verifyStockItemLevel',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  }),
  graphql(formMutationRemove, {
    name: 'removeStockItem',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  }),
  graphql(formMutationMerge, {
    name: 'mergeStockItems',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  }),
  graphql(formMutationRecalculate, {
    name: 'recalculateStockLevels',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  })
)(List);
