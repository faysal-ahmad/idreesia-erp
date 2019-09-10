import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Dropdown,
  Icon,
  Menu,
  Modal,
  Table,
  Tooltip,
  Pagination,
  Popconfirm,
  message,
} from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { getDownloadUrl } from '/imports/ui/modules/helpers/misc';
import ListFilter from './list-filter';

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  cursor: 'pointer',
  color: '#1890ff',
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
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    physicalStoreId: PropTypes.string,
    name: PropTypes.string,
    categoryId: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    showNewButton: PropTypes.bool,
    showSelectionColumn: PropTypes.bool,
    showActions: PropTypes.bool,
    handleNewClicked: PropTypes.func,
    removeStockItem: PropTypes.func,
    mergeStockItems: PropTypes.func,
    recalculateStockLevels: PropTypes.func,

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
        render: (text, record) => {
          const onClickHandler = () => {
            const { handleItemSelected } = this.props;
            handleItemSelected(record);
          };

          if (record.imageId) {
            const url = getDownloadUrl(record.imageId);
            return (
              <div style={NameDivStyle} onClick={onClickHandler}>
                <Avatar shape="square" size="large" src={url} />
                &nbsp;&nbsp;
                {text}
              </div>
            );
          }

          return (
            <div style={NameDivStyle} onClick={onClickHandler}>
              <Avatar shape="square" size="large" icon="picture" />
              &nbsp;&nbsp;
              {text}
            </div>
          );
        },
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
          if (!text) return '';
          if (record.unitOfMeasurement !== 'quantity')
            return `${text} ${record.unitOfMeasurement}`;
          return text;
        },
      },
      {
        title: 'Current Stock',
        dataIndex: 'currentStockLevel',
        key: 'currentStockLevel',
        render: (text, record) => {
          const stockLevel = text || 0;
          if (record.unitOfMeasurement !== 'quantity')
            return `${stockLevel} ${record.unitOfMeasurement}`;
          return stockLevel;
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
              <div style={ActionsStyle}>
                <Popconfirm
                  title="Are you sure you want to delete this stock item?"
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
          icon={<Icon type="down" />}
          onClick={handleNewClicked}
          overlay={menu}
        >
          New Stock Item
        </Dropdown.Button>
      );
    }

    return (
      <div style={ToolbarStyle}>
        {newButton}
        <ListFilter
          name={name}
          physicalStoreId={physicalStoreId}
          categoryId={categoryId}
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
        purchaseFormsCount
        issuanceFormsCount
        stockAdjustmentsCount
      }
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
    options: ({ physicalStoreId, categoryId, name, pageIndex, pageSize }) => ({
      variables: {
        physicalStoreId,
        queryString: `?categoryId=${categoryId || ''}&name=${name ||
          ''}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
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
