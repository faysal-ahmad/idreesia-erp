import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DeleteOutlined, ReconciliationOutlined } from '@ant-design/icons';

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

const OrderLevel = {
  display: 'flex',
  justifyContent: 'center',
  color: '#1890FF',
  cursor: 'pointer',
};

const StockLevelVerificationOk = {
  display: 'flex',
  justifyContent: 'center',
  color: '#1890FF',
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
    width: 120,
    render: (text, record) => {
      const stockLevel = text || 0;
      let style = StockLevelVerificationError;
      let tooltip = `Stock level has never been reconciled.`;

      if (record.stockReconciledOn) {
        const now = moment();
        const lastVerified = moment(Number(record.stockReconciledOn));
        const duration = moment.duration(now.diff(lastVerified)).asMonths();
        tooltip = `Stock level reconciled on ${lastVerified.format(
          Formats.DATE_FORMAT
        )}`;
        if (duration < 3) {
          style = StockLevelVerificationOk;
        } else if (duration < 6) {
          style = StockLevelVerificationWarning;
        } else if (duration >= 6) {
          style = StockLevelVerificationError;
        }
      }

      return (
        <Tooltip title={tooltip}>
          <div
            style={style}
            onClick={() => {
              setSelectedWazeefa(record);
              setShowCurrentStockLevelForm(true);
            }}
          >
            {stockLevel}
          </div>
        </Tooltip>
      );
    },

  };

  const deliveryOrdersColumn = {
    title: 'Delivery Orders',
    dataIndex: 'deliveryOrders',
    key: 'deliveryOrders',
    width: 120,
    render: text => (
      <div style={OrderLevel}>
        {text || 0}
      </div>
    ),
  };

  const printOrdersColumn = {
    title: 'Print Orders',
    dataIndex: 'printOrders',
    key: 'printOrders',
    width: 120,
    render: text => (
      <div style={OrderLevel}>
        {text || 0}
      </div>
    ),
  };

  const actionsColumn = () => ({
      key: 'action',
      width: 80,
      render: (text, record) => {
        const reconcileAction = (
          <Popconfirm
            title="Are you sure you want to mark this item as reconciled?"
            onConfirm={() => {
              // handleDeleteItem(record);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Reconcile">
              <ReconciliationOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        );
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
        return (
          <div className="list-actions-column">
            {reconcileAction}
            {deleteAction}
          </div>
        );
      },
    });

  const columns = [
    nameColumn,
    revisionNumberColumn,
    revisionDateColumn,
    currentStockColumn,
    deliveryOrdersColumn,
    printOrdersColumn,
    actionsColumn(),
  ];

  const onPaginationChange = (newPageIndex, newPageSize) => {
    setPageParams({
      pageIndex: (newPageIndex - 1).toString(),
      pageSize: newPageSize.toString(),
    });
  };

  const handleSetCurrentStockLevelSave = (wazeefaId, stockLevel, adjustmentReason) => {
    setSelectedWazeefa(null);
    setShowCurrentStockLevelForm(false);
    handleSetStockLevel(wazeefaId, stockLevel, adjustmentReason);
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