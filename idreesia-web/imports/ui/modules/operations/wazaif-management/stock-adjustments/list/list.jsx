import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { CheckSquareOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from 'antd';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { WazeefaName } from '/imports/ui/modules/helpers/controls';

import ListFilter from './list-filter';
import {
  APPROVE_STOCK_ADJUSTMENT,
  REMOVE_STOCK_ADJUSTMENT,
  PAGED_WAZAIF_STOCK_ADJUSTMENTS,
} from '../gql';

const List = ({
  history,
  location,
 }) => {
  const dispatch = useDispatch();
  const { queryString, queryParams } = useQueryParams({
    history,
    location,
    paramNames: ['approvalStatus', 'startData', 'endData', 'pageIndex', 'pageSize'],
  });

  const [approveStockAdjustment] = useMutation(APPROVE_STOCK_ADJUSTMENT);
  const [removeStockAdjustment] = useMutation(REMOVE_STOCK_ADJUSTMENT);
   const { data, loading, refetch } = useQuery(PAGED_WAZAIF_STOCK_ADJUSTMENTS, {
    variables: { queryString },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Wazaif Management', 'Stock Adjustments']));
  }, [location]);

  const handleApproveClicked = stockAdjustment => {
    approveStockAdjustment({
      variables: { _id: stockAdjustment._id },
    })
      .then(() => {
        message.success('Stock adjustment has been approved.', 5);
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleDeleteClicked = stockAdjustment => {
    removeStockAdjustment({
      variables: { _id: stockAdjustment._id },
    })
      .then(() => {
        message.success('Stock adjustment has been deleted.', 5);
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const columns = [
    {
      title: 'Wazeefa Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <WazeefaName
          wazeefa={record.refWazeefa}
          onWazeefaNameClicked={() => {}}
        />
      ),
    },
    {
      title: 'Adjustment',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Adjustment Date',
      dataIndex: 'adjustmentDate',
      key: 'adjustmentDate',
      render: text => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Adjusted By',
      key: 'adjustedBy',
      render: (text, record) => record?.refAdjustedBy?.sharedData?.name,
    },
    {
      title: 'Adjustment Reason',
      dataIndex: 'adjustmentReason',
      key: 'adjustmentReason',
    },
    {
      key: 'action',
      render: (text, record) => {
        if (!record.approvedOn) {
          return (
            <div className="list-actions-column">
              <Tooltip title="Approve">
                <CheckSquareOutlined
                  className="list-actions-icon"
                  onClick={() => {
                    handleApproveClicked(record);
                  }}
                />
              </Tooltip>
              <Popconfirm
                title="Are you sure you want to delete this stock adjustment?"
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

        return null;
      },
    },
  ];

  const refreshPage = newParams => {
    const {
      approvalStatus,
      startDate,
      endDate,
      pageIndex,
      pageSize,
    } = newParams;

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

    const path = `${location.pathname}?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  const onChange = (pageIndex, pageSize) => {
    refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  const onShowSizeChange = (pageIndex, pageSize) => {
    refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  const getTableHeader = () => (
      <div className="list-table-header">
        <div />
        <ListFilter
          refreshPage={refreshPage}
          queryParams={queryParams}
          refreshData={refetch}
        />
      </div>
    );

  if (loading) return null;
  const pagedWazaifStockAdjustments = data
    ? data.pagedWazaifStockAdjustments
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
      dataSource={pagedWazaifStockAdjustments.data}
      columns={columns}
      bordered
      title={getTableHeader}
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
          total={pagedWazaifStockAdjustments.totalResults}
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
