import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  Button,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useAllWazaifVendors } from 'meteor/idreesia-common/hooks/wazaif';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import ListFilter from './list-filter';
import {
  PAGED_WAZAIF_PRINTING_ORDERS,
  REMOVE_WAZAIF_PRINTING_ORDER,
} from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { allWazaifVendors } = useAllWazaifVendors();
  const { queryString, queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['completedStatus', 'vendorId', 'startData', 'endData',  'pageIndex', 'pageSize'],
  });

  const [removeWazaifPrintingOrder] = useMutation(REMOVE_WAZAIF_PRINTING_ORDER);
   const { data, loading, refetch } = useQuery(PAGED_WAZAIF_PRINTING_ORDERS, {
    variables: { queryString },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Wazaif Management', 'Printing Orders']));
  }, [location]);

  const handleDeleteClicked = printingOrder => {
    removeWazaifPrintingOrder({
      variables: { _id: printingOrder._id },
    })
      .then(() => {
        message.success('Printing order has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleEditClicked = printingOrder => {
    history.push(paths.wazaifPrintingOrdersEditFormPath(printingOrder._id));
  };

  const columns = [
    {
      title: 'Ordered Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: text => {
        const date = moment(Number(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'ordered By',
      dataIndex: ['refOrderedBy','sharedData','name'],
      key: 'refOrderedBy.sharedData.name',
    },
    {
      title: 'Vendor',
      key: 'refVendor',
      render: (text, record) => {
        const { refVendor } = record;
        return refVendor?.name;
      },
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: items => {
        const formattedItems = items.map(item => (
          <li key={item.wazeefaId}>
            {`${item.formattedName} [${item.packets}]`}
          </li>
        ));

        return <ul>{formattedItems}</ul>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, record) => (
        <div className="list-actions-column">
          <Tooltip title="Edit">
            <EditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleEditClicked(record);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this printing order?"
            onConfirm={() => {
              handleDeleteClicked(record);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <DeleteOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleNewClicked = () => {
    history.push(paths.wazaifPrintingOrdersNewFormPath);
  };

  const onChange = (pageIndex, pageSize) => {
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  const onShowSizeChange = (pageIndex, pageSize) => {
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  const getTableHeader = () => (
      <div className="list-table-header">
        <Button
          size="large"
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Printing Order
        </Button>
        <div className="list-table-header-section">
          <ListFilter
            allWazaifVendors={allWazaifVendors}
            refreshPage={setPageParams}
            queryParams={queryParams}
            refreshData={refetch}
          />
        </div>
      </div>
    );

  if (loading) return null;
  const pagedWazaifPrintingOrders = data
    ? data.pagedWazaifPrintingOrders
    : {
        data: [],
        totalResults: 0,
      };

  const { pageIndex, pageSize } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <Table
      rowKey="_id"
      dataSource={pagedWazaifPrintingOrders.data}
      columns={columns}
      bordered
      title={getTableHeader}
      rowSelection={null}
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
          onChange={onChange}
          onShowSizeChange={onShowSizeChange}
          total={pagedWazaifPrintingOrders.totalResults}
        />
      )}
    />
  );
}

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
