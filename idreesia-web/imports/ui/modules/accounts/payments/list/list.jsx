import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { flowRight } from 'lodash';
import { graphql } from 'react-apollo';
import numeral from 'numeral';
import ListFilter from './list-filter';
import {
  Button,
  Icon,
  Pagination,
  Table,
  Tooltip,
  Modal,
  message,
} from '/imports/ui/controls';
import { REMOVE_PAYMENT, PAGED_PAYMENTS } from '../gql';

const { confirm } = Modal;

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    queryString: PropTypes.string,
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    paymentType: PropTypes.string,
    paymentAmount: PropTypes.number,
    setPageParams: PropTypes.func,
    handleNewClicked: PropTypes.func,
    handleEditClicked: PropTypes.func,
    handlePrintPaymentReceipts: PropTypes.func,

    loading: PropTypes.bool,
    pagedPayments: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
    removePayment: PropTypes.func,
  };

  columns = [
    {
      title: 'Voucher No',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: text => {
        const date = moment(Number(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'CNIC Number',
      dataIndex: 'cnicNumber',
      key: 'cnicNumber',
    },
    {
      title: 'Payment Amount',
      dataIndex: 'paymentAmount',
      key: 'paymentAmount',
      render: text => numeral(text).format('0,0'),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, record) => (
        <div className="list-actions-column">
          <Tooltip title="Edit">
            <Icon
              type="edit"
              className="list-actions-icon"
              onClick={() => {
                this.handleEditClicked(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Print">
            <Icon
              type="printer"
              className="list-actions-icon"
              onClick={() => {
                this.handlePrintPaymentReceipts(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Icon
              type="delete"
              className="list-actions-icon"
              onClick={() => {
                this.handleDeleteClicked(record);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  handleNewClicked = () => {
    const { handleNewClicked } = this.props;
    handleNewClicked();
  };

  handleEditClicked = payment => {
    const { handleEditClicked } = this.props;
    handleEditClicked(payment);
  };

  handleDeleteClicked = payment => {
    const { removePayment } = this.props;

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

  handlePrintPaymentReceipts = payment => {
    const { handlePrintPaymentReceipts } = this.props;
    if (handlePrintPaymentReceipts) {
      handlePrintPaymentReceipts(payment);
    }
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

  getTableHeader = () => {
    const {
      name,
      cnicNumber,
      paymentType,
      paymentAmount,
      startDate,
      endDate,
      setPageParams,
    } = this.props;

    const newButton = (
      <Button
        type="primary"
        icon="plus-circle-o"
        onClick={this.handleNewClicked}
      >
        New Payment Voucher
      </Button>
    );

    return (
      <div className="list-table-header">
        {newButton}
        <ListFilter
          name={name}
          cnicNumber={cnicNumber}
          paymentType={paymentType}
          paymentAmount={paymentAmount}
          startDate={startDate}
          endDate={endDate}
          setPageParams={setPageParams}
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
      pagedPayments: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
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
            onChange={this.onChange}
            onShowSizeChange={this.onShowSizeChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}

export default flowRight(
  graphql(REMOVE_PAYMENT, {
    name: 'removePayment',
    options: {
      refetchQueries: ['pagedPayments'],
    },
  }),
  graphql(PAGED_PAYMENTS, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({
      variables: { queryString },
    }),
  })
)(List);
