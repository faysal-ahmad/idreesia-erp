import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { Button, Icon, Table, Tooltip, Pagination } from '/imports/ui/controls';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';
import ListFilter from './list-filter';

const ItemStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    companyId: PropTypes.string,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    voucherNumber: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    showNewButton: PropTypes.bool,
    handleNewClicked: PropTypes.func,
    handleViewClicked: PropTypes.func,

    loading: PropTypes.bool,
    pagedVouchers: PropTypes.shape({
      data: PropTypes.array,
      totalResults: PropTypes.number,
    }),
  };

  columns = [
    {
      title: 'Voucher No.',
      dataIndex: 'voucherNumber',
      key: 'voucherNumber',
      render: (text, record) => {
        const voucherNumber = `${record.voucherType} - ${record.voucherNumber}`;
        const url = paths.vouchersEditFormPath(record.companyId, record._id);
        return <Link to={url}>{voucherNumber}</Link>;
      },
    },
    {
      title: 'Voucher Date',
      dataIndex: 'voucherDate',
      key: 'voucherDate',
      render: text => {
        const date = moment(Number(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Voucher Details',
      key: 'details',
      render: (text, record) => {
        const { voucherDetails } = record;
        const formattedDetails = voucherDetails.map(voucherDetail => (
          <li key={voucherDetail._id} style={ItemStyle}>
            <span>{`[${voucherDetail.refAccountHead.number}] ${voucherDetail.refAccountHead.name}`}</span>
            <span>{`Rs. ${voucherDetail.amount} ${
              voucherDetail.isCredit ? 'Credit' : 'Debit'
            }`}</span>
          </li>
        ));
        return <ul>{formattedDetails}</ul>;
      },
    },
    {
      key: 'action',
      render: (text, record) => (
        <Tooltip title="Details">
          <Icon
            type="bars"
            className="list-actions-icon"
            onClick={() => {
              this.onViewClicked(record);
            }}
          />
        </Tooltip>
      ),
    },
  ];

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

  onViewClicked = voucher => {
    const { handleViewClicked } = this.props;
    if (handleViewClicked) handleViewClicked(voucher);
  };

  getTableHeader = () => {
    const {
      startDate,
      endDate,
      setPageParams,
      showNewButton,
      handleNewClicked,
    } = this.props;

    let newButton = null;
    if (showNewButton) {
      newButton = (
        <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
          New Voucher
        </Button>
      );
    }

    return (
      <div className="list-table-header">
        {newButton}
        <ListFilter
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
      pagedVouchers: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.columns}
        bordered
        size="small"
        pagination={false}
        title={this.getTableHeader}
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
  query pagedVouchers($companyId: String!, $queryString: String) {
    pagedVouchers(companyId: $companyId, queryString: $queryString) {
      totalResults
      data {
        _id
        companyId
        externalReferenceId
        voucherNumber
        voucherType
        voucherDate
        description
        order
        voucherDetails {
          _id
          companyId
          voucherId
          accountHeadId
          amount
          isCredit
          refAccountHead {
            _id
            name
            number
          }
        }
      }
    }
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({
      companyId,
      startDate,
      endDate,
      voucherNumber,
      pageIndex,
      pageSize,
    }) => ({
      variables: {
        companyId,
        queryString: `?startDate=${
          startDate ? startDate.format(Formats.DATE_FORMAT) : ''
        }&endDate=${
          endDate ? endDate.format(Formats.DATE_FORMAT) : ''
        }&voucherNumber=${voucherNumber ||
          ''}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  })
)(List);
