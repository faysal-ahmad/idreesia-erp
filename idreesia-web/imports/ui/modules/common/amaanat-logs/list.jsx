import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import numeral from 'numeral';

import { Icon, Pagination, Table, Tooltip } from '/imports/ui/controls';

export default class AmaanatLogsList extends Component {
  static propTypes = {
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

  columns = [
    {
      title: 'Sent Date',
      dataIndex: 'sentDate',
      key: 'sentDate',
      render: text => {
        const date = moment(Number(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'City / Mehfil',
      key: 'cityMehfil',
      render: (text, record) =>
        `${record.city.name} - ${record.cityMehfil.name}`,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: text => numeral(text).format('0,0'),
    },
    {
      title: 'Breakup',
      key: 'breakup',
      render: (text, record) => {
        const formattedItems = [];
        if (record.hadiaPortion) {
          formattedItems.push(
            <li key={`${record._id}_hadia`}>
              {`Hadia - ${numeral(record.hadiaPortion).format('0,0')}`}
            </li>
          );
        }
        if (record.sadqaPortion) {
          formattedItems.push(
            <li key={`${record._id}_sadqa`}>
              {`Sadqa - ${numeral(record.sadqaPortion).format('0,0')}`}
            </li>
          );
        }
        if (record.zakaatPortion) {
          formattedItems.push(
            <li key={`${record._id}_zakaat`}>
              {`Zakaat - ${numeral(record.zakaatPortion).format('0,0')}`}
            </li>
          );
        }
        if (record.langarPortion) {
          formattedItems.push(
            <li key={`${record._id}_langar`}>
              {`Langar - ${numeral(record.langarPortion).format('0,0')}`}
            </li>
          );
        }
        if (record.otherPortion) {
          formattedItems.push(
            <li key={`${record._id}_other`}>
              {`Other - ${numeral(record.otherPortion).format('0,0')}`}
            </li>
          );
        }

        return <ul>{formattedItems}</ul>;
      },
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
                this.props.handleSelectItem(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Icon
              type="delete"
              className="list-actions-icon"
              onClick={() => {
                this.props.handleDeleteItem(record);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  onPaginationChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  render() {
    const {
      listHeader,
      pageIndex,
      pageSize,
      pagedData: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.columns}
        bordered
        title={listHeader}
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
