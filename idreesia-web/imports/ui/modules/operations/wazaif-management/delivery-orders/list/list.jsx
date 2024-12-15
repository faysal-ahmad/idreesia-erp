import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
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
  FileOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  useAllCities,
  useAllCityMehfils,
} from 'meteor/idreesia-common/hooks/outstation';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import ListFilter from './list-filter';
import {
  PAGED_WAZAIF_DELIVERY_ORDERS,
  REMOVE_WAZAIF_DELIVERY_ORDER,
} from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { allCities } = useAllCities();
  const { allCityMehfils } = useAllCityMehfils();
  const { queryString, queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['completedStatus', 'cityId', 'cityMehfilId', 'startData', 'endData',  'pageIndex', 'pageSize'],
  });

  const [removeWazaifDeliveryOrder] = useMutation(REMOVE_WAZAIF_DELIVERY_ORDER);
   const { data, loading, refetch } = useQuery(PAGED_WAZAIF_DELIVERY_ORDERS, {
    variables: { queryString },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Wazaif Management', 'Delivery Orders']));
  }, [location]);

  const handleDeleteClicked = deliveryOrder => {
    removeWazaifDeliveryOrder({
      variables: { _id: deliveryOrder._id },
    })
      .then(() => {
        message.success('Delivery order has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleEditClicked = deliveryOrder => {
    history.push(paths.wazaifDeliveryOrdersEditFormPath(deliveryOrder._id));
  };

  const handleViewClicked = () => {
    // history.push(paths.issuanceFormsViewFormPath(physicalStoreId, record._id));
  };

  const columns = [
    {
      title: 'Requested Date',
      dataIndex: 'requestedDate',
      key: 'requestedDate',
      render: text => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Requested By',
      dataIndex: ['refRequestedBy','sharedData','name'],
      key: 'refRequestedBy.sharedData.name',
    },
    {
      title: 'City / Mehfil',
      key: 'refCityMehfil',
      render: (text, record) => {
        const { refCity, refCityMehfil } = record;
        let cityMehfilName = refCity.name;
        if (refCityMehfil) {
          cityMehfilName = `${cityMehfilName} - ${refCityMehfil.name}`;
        }

        return cityMehfilName;
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
      render: (text, record) => {
        if (!record.approvedOn) {
          return (
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
                title="Are you sure you want to delete this delivery order?"
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
          );
        }

        return (
          <Tooltip title="View">
            <FileOutlined
              className="list-actions-icon"
              onClick={() => {
                handleViewClicked(record);
              }}
            />
          </Tooltip>
        );
      },
    },
  ];

  const handleNewClicked = () => {
    history.push(paths.wazaifDeliveryOrdersNewFormPath);
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
          New Delivery Order
        </Button>
        <div className="list-table-header-section">
          <ListFilter
            allCities={allCities}
            allCityMehfils={allCityMehfils}
            refreshPage={setPageParams}
            queryParams={queryParams}
            refreshData={refetch}
          />
        </div>
      </div>
    );

  if (loading) return null;
  const pagedWazaifDeliveryOrders = data
    ? data.pagedWazaifDeliveryOrders
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
      dataSource={pagedWazaifDeliveryOrders.data}
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
          total={pagedWazaifDeliveryOrders.totalResults}
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
