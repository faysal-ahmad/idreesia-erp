import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import numeral from 'numeral';
import {
  Button,
  Dropdown,
  Modal,
  Table,
  Tooltip,
  Pagination,
  Popconfirm,
  message,
} from 'antd';
import {
  CalculatorOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  MergeCellsOutlined,
  PlusCircleOutlined,
  ReconciliationOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import { flowRight, groupBy, kebabCase } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
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

const GroupNameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  color: '#1890ff',
  fontWeight: 'bold',
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
        onCell: (record) => record.isGroup ? ({ colSpan: showActions ? 7 : 6 }) : ({ colSpan: 1 }),
        render: (text, record) => {
          if (record.isGroup) {
            return (
              <div style={GroupNameDivStyle}>
                {record.name}
              </div>
            );
          }

          // If it's not a top level item then add indent
          const paddingLeft = record.noParent ? 0 : 20;
          return (
            <div style={{ paddingLeft }}>
              <StockItemName
                stockItem={record}
                onStockItemNameClicked={this.props.handleItemSelected}
              />
            </div>
          )
        },
      },
      {
        title: 'Company',
        dataIndex: 'company',
        key: 'company',
        onCell: (record) => record.isGroup ? ({ colSpan: 0 }) : ({ colSpan: 1 }),
      },
      {
        title: 'Details',
        dataIndex: 'details',
        key: 'details',
        onCell: (record) => record.isGroup ? ({ colSpan: 0 }) : ({ colSpan: 1 }),
      },
      {
        title: 'Category',
        dataIndex: 'categoryName',
        key: 'categoryName',
        onCell: (record) => record.isGroup ? ({ colSpan: 0 }) : ({ colSpan: 1 }),
      },
      {
        title: 'Min Stock',
        dataIndex: 'minStockLevel',
        key: 'minStockLevel',
        onCell: (record) => record.isGroup ? ({ colSpan: 0 }) : ({ colSpan: 1 }),
        render: (text, record) => {
          let stockLevel = text ? numeral(text).format('0.00') : '';
          if (stockLevel && record.unitOfMeasurement !== 'quantity') {
            stockLevel = `${stockLevel} ${record.unitOfMeasurement}`;
          }

          return <div style={MinStockLevelStyle}>{stockLevel}</div>;
        },
      },
      {
        title: 'Current Stock',
        dataIndex: 'currentStockLevel',
        key: 'currentStockLevel',
        onCell: (record) => record.isGroup ? ({ colSpan: 0 }) : ({ colSpan: 1 }),
        render: (text, record) => {
          let stockLevel = text ? numeral(text).format('0.00') : '';
          if (stockLevel && record.unitOfMeasurement !== 'quantity')
            stockLevel = `${stockLevel} ${record.unitOfMeasurement}`;

          let style = StockLevelVerificationError;
          let tooltip = `Stock level has never been verified.`;

          if (record.verifiedOn) {
            const now = dayjs();
            const lastVerified = dayjs(Number(record.verifiedOn));
            const duration = dayjs.duration(now.diff(lastVerified)).asMonths();
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
              <div style={style}>
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
        onCell: (record) => record.isGroup ? ({ colSpan: 0 }) : ({ colSpan: 1 }),
        render: (text, record) => {
          const {
            purchaseFormsCount,
            issuanceFormsCount,
            stockAdjustmentsCount,
          } = record;

          const verifyAction = (
            <Tooltip title="Verify Stock Level">
              <ReconciliationOutlined
                className="list-actions-icon"
                onClick={() => {
                  this.handleVerifyStockLevel(record);
                }}
              />
            </Tooltip>
          );

          let deleteAction;

          if (
            purchaseFormsCount + issuanceFormsCount + stockAdjustmentsCount === 0
          ) {
            deleteAction = (
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
            );
          }

          return (
            <div className="list-actions-column">
              {verifyAction}
              {deleteAction}    
            </div>
          );
        },
      });
    }

    return columns;
  };

  rowSelection = {
    checkStrictly: false,
    onChange: (selectedRowKeys, selectedRows) => {
      // Remove any group rows from the selection
      const filteredRows = selectedRows.filter(item => !item.isGroup);
      this.setState({
        selectedRows: filteredRows,
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
    if (selectedRows.length === 0) return;

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
    if (selectedRows.length === 0) return;

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

  handleVerifyStockLevel = record => {
    const { physicalStoreId, verifyStockItemLevel } = this.props;
    let currentStockLevel = record.currentStockLevel;
    currentStockLevel = currentStockLevel ? numeral(currentStockLevel).format('0.00') : 0;
    Modal.confirm({
      title: 'Stock Level Verification',
      content: `Have you verified that the current stock level of "${
        record.name
      }" is ${currentStockLevel}?`,
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

  handleExportSelected = () => {
    const { physicalStoreId } = this.props;
    const url = `${
      window.location.origin
    }/generate-report?reportName=StockItems&reportArgs=${physicalStoreId}`;
    window.open(url, '_blank');
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

  handleAction = ({ key }) => {
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
    } else if (key === 'export') {
      this.handleExportSelected();
    }
  };

  getActionsMenu = () => {
    const items = [
      {
        key: 'merge',
        label: 'Merge Selected',
        icon: <MergeCellsOutlined />,
      },
      {
        key: 'recalculate',
        label: 'Recalculate Selected',
        icon: <CalculatorOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: 'export',
        label: 'Export Current Stock Levels',
        icon: <FileExcelOutlined />,
      },
    ];

    return (
      <Dropdown menu={{ items, onClick: this.handleAction }}>
        <Button icon={<SettingOutlined />} size="large" />
      </Dropdown>
    );
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

    let newButton = null;
    if (showNewButton) {
      newButton = (
        <Button
          size="large"
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Stock Item
        </Button>
      );
    }

    return (
      <div className="list-table-header">
        {newButton}
        <div className="list-table-header-section">
          <ListFilter
            name={name}
            physicalStoreId={physicalStoreId}
            categoryId={categoryId}
            verifyDuration={verifyDuration}
            stockLevel={stockLevel}
            setPageParams={setPageParams}
            refreshData={refetchListQuery}
          />
          &nbsp;&nbsp;
          {this.getActionsMenu()}
        </div>
      </div>
    );
  };

  getTreeData = (data) => {
    const treeData = [];
    // Convert the flat data received from the server into
    // appropriate shape for showing tree in the table
    const groupedData = groupBy(data, 'name');
    const itemNames = Object.keys(groupedData);
    itemNames.forEach((itemName, index) => {
      // If there is only a single item against the item name
      // then we do not need to show this item in a hierarchy
      const items = groupedData[itemName];
      if (items.length === 1) {
        treeData.push({
          ...items[0],
          noParent: true,
      });
      } else {
        // Insert a parent row under which we will group all the items
        treeData.push({
          _id: `${index}-${kebabCase(itemName)}`,
          name: `${itemName} (${items.length} items)`,
          isGroup: true,
          children: items,
        });
      }
    });

    return treeData;
  }

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      showSelectionColumn,
      pagedStockItems: { totalResults, data },
    } = this.props;

    const treeData = this.getTreeData(data);
    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={treeData}
        columns={this.getColumns()}
        bordered
        indentSize={30}
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
