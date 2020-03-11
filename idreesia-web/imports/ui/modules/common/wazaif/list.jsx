import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Icon,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
} from '/imports/ui/controls';
import { WazeefaName } from '/imports/ui/modules/helpers/controls';

export default class WazaifList extends Component {
  static propTypes = {
    showSelectionColumn: PropTypes.bool,

    listHeader: PropTypes.func,
    handleSelectItem: PropTypes.func,
    handleDeleteItem: PropTypes.func,
    setPageParams: PropTypes.func,

    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    pagedData: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  static defaultProps = {
    handleSelectItem: noop,
    handleDeleteItem: noop,
    listHeader: () => null,
  };

  state = {
    selectedRows: [],
  };

  nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <WazeefaName
        wazeefa={record}
        onWazeefaNameClicked={this.props.handleSelectItem}
      />
    ),
  };

  revisionNumberColumn = {
    title: 'Revision No.',
    dataIndex: 'revisionNumber',
    key: 'revisionNumber',
  };

  revisionDateColumn = {
    title: 'Revision Date',
    dataIndex: 'revisionDate',
    key: 'revisionDate',
  };

  actionsColumn = () => {
    const { handleDeleteItem } = this.props;
    return {
      key: 'action',
      width: 80,
      render: (text, record) => {
        const deleteAction = (
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => {
              handleDeleteItem(record);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Icon type="delete" className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        );

        return <div className="list-actions-column">{deleteAction}</div>;
      },
    };
  };

  getColumns = () => {
    const columns = [
      this.nameColumn,
      this.revisionNumberColumn,
      this.revisionDateColumn,
      this.actionsColumn(),
    ];

    return columns;
  };

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows,
      });
    },
  };

  onPaginationChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: (pageIndex - 1).toString(),
      pageSize: pageSize.toString(),
    });
  };

  getSelectedRows = () => this.state.selectedRows;

  render() {
    const {
      pageIndex,
      pageSize,
      listHeader,
      showSelectionColumn,
      pagedData: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.getColumns()}
        title={listHeader}
        rowSelection={showSelectionColumn ? this.rowSelection : null}
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
            onChange={this.onPaginationChange}
            onShowSizeChange={this.onPaginationChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}
