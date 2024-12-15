import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { AuditOutlined, DeleteOutlined, EditOutlined, PrinterOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { useAllPaymentTypes } from 'meteor/idreesia-common/hooks/accounts';

import {
  Button,
  Pagination,
  Table,
  Tooltip,
  Modal,
  message,
} from 'antd';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';

import ListFilter from './list-filter';
import { REMOVE_PAYMENT, PAGED_PAYMENTS } from '../gql';

const { confirm } = Modal;

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { allPaymentTypes, allPaymentTypesLoading } = useAllPaymentTypes();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'paymentNumber',
      'name',
      'cnicNumber',
      'paymentTypeId',
      'startDate',
      'endDate',
      'updatedBetween',
      'pageIndex',
      'pageSize',
    ],
  });

  const [removePayment] = useMutation(REMOVE_PAYMENT);
  const { data, loading, refetch } = useQuery(PAGED_PAYMENTS, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Accounts', 'Payments', 'List']));
  }, [location]);

  if (loading || allPaymentTypesLoading) return null;
  const { pagedPayments } = data;
  const {
    paymentNumber,
    name,
    cnicNumber,
    paymentTypeId,
    startDate,
    endDate,
    updatedBetween,
    pageIndex,
    pageSize,
  } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const onPaginationChange = (index, size) => {
    setPageParams({
      pageIndex: index - 1,
      pageSize: size,
    });
  };

  const handleNewClicked = () => {
    history.push(paths.paymentsNewFormPath);
  };

  const handleEditClicked = payment => {
    history.push(paths.paymentsEditFormPath(payment._id));
  };

  const handleDeleteClicked = payment => {
    confirm({
      title: 'Do you want to delete the payment item?',
      onOk() {
        removePayment({
          variables: { _id: payment._id },
        })
          .then(() => {
            message.success('Payment item has been deleted.', 5);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      },
      onCancel() {},
    });
  };

  const handleAuditLogsAction = payment => {
    history.push(`${paths.auditLogsPath}?entityId=${payment._id}`);
  };

  const handlePrintPaymentReceipts = payment => {
    history.push(paths.paymentReceiptsPath(payment._id));
  };

  const columns = [
    {
      title: 'Voucher No.',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      width: 100,
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 150,
      render: text => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      key: 'paymentType',
      render: (text, record) => record.paymentType.name,
    },
    {
      title: 'Amount',
      dataIndex: 'paymentAmount',
      key: 'paymentAmount',
      width: 100,
      render: text => numeral(text).format('0,0'),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 100,
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
          <Tooltip title="Print">
            <PrinterOutlined
              className="list-actions-icon"
              onClick={() => {
                handlePrintPaymentReceipts(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Audit Logs">
            <AuditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleAuditLogsAction(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined
              className="list-actions-icon"
              onClick={() => {
                handleDeleteClicked(record);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const getTableHeader = () => {
    const newButton = (
      <Button
        type="primary"
        size="large"
        icon={<PlusCircleOutlined />}
        onClick={handleNewClicked}
      >
        New Payment
      </Button>
    );

    return (
      <div className="list-table-header">
        {newButton}
        <ListFilter
          paymentNumber={paymentNumber}
          name={name}
          cnicNumber={cnicNumber}
          paymentTypeId={paymentTypeId}
          startDate={startDate}
          endDate={endDate}
          updatedBetween={updatedBetween}
          allPaymentTypes={allPaymentTypes}
          refreshData={refetch}
          setPageParams={setPageParams}
        />
      </div>
    );
  };

  return (
    <Table
      rowKey="_id"
      dataSource={pagedPayments.data}
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
          onChange={onPaginationChange}
          onShowSizeChange={onPaginationChange}
          total={pagedPayments.totalResults}
        />
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
