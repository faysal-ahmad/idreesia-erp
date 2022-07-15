import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DeleteOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Modal,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
} from 'antd';
import { WazeefaName } from '/imports/ui/modules/helpers/controls';

import SetCurrentStockLevelForm from './set-current-stock-level';

const LinkStyle = {
  width: '100%',
  color: '#1890FF',
  cursor: 'pointer',
};

const List = ({
  listHeader,
  handleSelectItem,
  handleDeleteItem,
  handleSetStockLevel,
  setPageParams,
  pageIndex,
  pageSize,
  pagedData,
}) => {
  const [selectedWazeefa, setSelectedWazeefa] = useState(null);
  const [showCurrentStockLevelForm, setShowCurrentStockLevelForm] = useState(false);

  const nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <WazeefaName
        wazeefa={record}
        onWazeefaNameClicked={handleSelectItem}
      />
    ),
  };

  const revisionNumberColumn = {
    title: 'Revision No.',
    dataIndex: 'revisionNumber',
    key: 'revisionNumber',
    width: 100,
  };

  const revisionDateColumn = {
    title: 'Revision Date',
    dataIndex: 'revisionDate',
    key: 'revisionDate',
    width: 150,
    render: text =>
      text ? moment(Number(text)).format(Formats.DATE_FORMAT) : '',
  };

  const currentStockColumn = {
    title: 'Current Stock',
    dataIndex: 'currentStockLevel',
    key: 'currentStockLevel',
    width: 150,
    render: (text, record) => (
      <div
        style={LinkStyle}
        onClick={() => {
          setSelectedWazeefa(record);
          setShowCurrentStockLevelForm(true);
        }}
      >
        {text || 0}
      </div>
    ),
  };

  const unfulfilledOrdersColumn = {
    title: 'Unfulfilled Orders',
    dataIndex: 'unfulfilledOrders',
    key: 'unfulfilledOrders',
    width: 150,
    render: text => text || 0,
  };

  const printOrdersColumn = {
    title: 'Print Orders',
    dataIndex: 'printOrders',
    key: 'printOrders',
    width: 150,
    render: text => text || 0,
  };

  const actionsColumn = () => ({
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
              <DeleteOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        );

        return <div className="list-actions-column">{deleteAction}</div>;
      },
    });

  const columns = [
    nameColumn,
    revisionNumberColumn,
    revisionDateColumn,
    currentStockColumn,
    unfulfilledOrdersColumn,
    printOrdersColumn,
    actionsColumn(),
  ];

  const onPaginationChange = (newPageIndex, newPageSize) => {
    setPageParams({
      pageIndex: (newPageIndex - 1).toString(),
      pageSize: newPageSize.toString(),
    });
  };

  const handleSetCurrentStockLevelSave = (wazeefaId, stockLevel) => {
    setSelectedWazeefa(null);
    setShowCurrentStockLevelForm(false);
    handleSetStockLevel(wazeefaId, stockLevel);
  }

  const handleSetCurrentStockLevelClose = () => {
    setSelectedWazeefa(null);
    setShowCurrentStockLevelForm(false);
  }

  const { totalResults, data } = pagedData;
  const numPageIndex = pageIndex ? pageIndex + 1 : 1;
  const numPageSize = pageSize || 20;

  const currentStockLevelForm = showCurrentStockLevelForm ? (
    <SetCurrentStockLevelForm
      wazeefa={selectedWazeefa}
      onSave={handleSetCurrentStockLevelSave}
      onCancel={handleSetCurrentStockLevelClose}
    />
  ) : null;

  return (
    <>
      <Modal
        title={`Set Current Stock Level - ${selectedWazeefa?.name}`}
        visible={showCurrentStockLevelForm}
        onCancel={handleSetCurrentStockLevelClose}
        width={600}
        footer={null}
      >
        <div>{currentStockLevelForm}</div>
      </Modal>

      {currentStockLevelForm}
      <Table
        rowKey="_id"
        dataSource={data}
        columns={columns}
        title={listHeader}
        rowSelection={null}
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
            onChange={onPaginationChange}
            onShowSizeChange={onPaginationChange}
            total={totalResults}
          />
        )}
      />
    </>
  );
}

List.propTypes = {
  listHeader: PropTypes.func,
  handleSelectItem: PropTypes.func,
  handleDeleteItem: PropTypes.func,
  handleSetStockLevel: PropTypes.func,
  setPageParams: PropTypes.func,

  pageIndex: PropTypes.number,
  pageSize: PropTypes.number,
  pagedData: PropTypes.shape({
    totalResults: PropTypes.number,
    data: PropTypes.array,
  }),
};

List.defaultProps = {
  handleSelectItem: noop,
  handleDeleteItem: noop,
  listHeader: () => null,
};

export default List;