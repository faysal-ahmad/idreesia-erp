import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { flowRight } from 'lodash';
import { graphql } from 'react-apollo';
import numeral from 'numeral';

import {
  Button,
  Icon,
  Pagination,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import ListFilter from './list-filter';

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    queryString: PropTypes.string,
    fromCity: PropTypes.string,
    hasPortion: PropTypes.string,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    setPageParams: PropTypes.func,
    handleNewClicked: PropTypes.func,
    handleEditClicked: PropTypes.func,

    loading: PropTypes.bool,
    pagedAmaanatLogs: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
    removeAmaanatLog: PropTypes.func,
  };

  columns = [
    {
      title: 'Received Date',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      render: text => {
        const date = moment(Number(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'From City',
      dataIndex: 'fromCity',
      key: 'fromCity',
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
                this.handleEditClicked(record);
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

  handleEditClicked = record => {
    const { handleEditClicked } = this.props;
    handleEditClicked(record);
  };

  handleDeleteClicked = amaanatLog => {
    const { removeAmaanatLog } = this.props;
    removeAmaanatLog({
      variables: { _id: amaanatLog._id },
    })
      .then(() => {
        message.success('Amaanat Log item has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
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
      fromCity,
      hasPortion,
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
        New Amaanat Log
      </Button>
    );

    return (
      <div className="list-table-header">
        {newButton}
        <ListFilter
          fromCity={fromCity}
          hasPortion={hasPortion}
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
      pagedAmaanatLogs: { totalResults, data },
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

const formMutationRemove = gql`
  mutation removeAmaanatLog($_id: String!) {
    removeAmaanatLog(_id: $_id)
  }
`;

const listQuery = gql`
  query pagedAmaanatLogs($queryString: String) {
    pagedAmaanatLogs(queryString: $queryString) {
      totalResults
      data {
        _id
        fromCity
        receivedDate
        totalAmount
        hadiaPortion
        sadqaPortion
        zakaatPortion
        langarPortion
        otherPortion
      }
    }
  }
`;

export default flowRight(
  graphql(formMutationRemove, {
    name: 'removeAmaanatLog',
    options: {
      refetchQueries: ['pagedAmaanatLogs'],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({
      variables: { queryString },
    }),
  })
)(List);
