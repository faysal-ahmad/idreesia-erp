import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AuditOutlined, DeleteOutlined, DollarOutlined, StarOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tooltip,
} from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

export default class PeopleList extends Component {
  static propTypes = {
    showSelectionColumn: PropTypes.bool,
    showCategoryColumn: PropTypes.bool,
    showCnicColumn: PropTypes.bool,
    showPhoneNumbersColumn: PropTypes.bool,
    showCityCountryColumn: PropTypes.bool,
    showDeleteAction: PropTypes.bool,
    showAuditLogsAction: PropTypes.bool,

    listHeader: PropTypes.func,
    handleSelectItem: PropTypes.func,
    handleDeleteItem: PropTypes.func,
    handleAuditLogsAction: PropTypes.func,
    setPageParams: PropTypes.func,

    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    pagedData: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  static defaultProps = {
    showDeleteAction: false,
    showAuditLogsAction: false,

    handleSelectItem: noop,
    handleDeleteItem: noop,
    handleAuditLogsAction: noop,
    listHeader: () => null,
  };

  state = {
    selectedRows: [],
  };

  categoryColumn = {
    title: '',
    key: 'status',
    render: (text, record) => {
      const icons = [];
      if (record.isKarkun) {
        icons.push(<StarOutlined key="1" className="list-actions-icon" />);
      }
      if (record.isEmployee) {
        icons.push(<DollarOutlined key="2" className="list-actions-icon" />);
      }

      if (icons.length === 0) return '';
      return <>{icons}</>;
    },
  };

  nameColumn = {
    title: 'Name',
    key: 'name',
    render: (text, record) => {
      const personNameData = {
        _id: record._id,
        name: record.sharedData.name,
        imageId: record.sharedData.imageId,
        image: record.sharedData.image,
      };

      return (
        <PersonName
          person={personNameData}
          onPersonNameClicked={this.props.handleSelectItem}
        />
      );
    },
  };

  cnicColumn = {
    title: 'CNIC Number',
    key: 'cnicNumber',
    render: (text, record) => record.sharedData.cnicNumber,
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (text, record) => {
      const numbers = [];
      if (record.sharedData?.contactNumber1)
        numbers.push(<Row key="1">{record.sharedData?.contactNumber1}</Row>);
      if (record.sharedData.contactNumber2)
        numbers.push(<Row key="2">{record.sharedData?.contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  cityCountryColumn = {
    title: 'City / Country',
    key: 'cityCountry',
    render: (text, record) => {
      const cityCountry = [];
      if (record.isKarkun) {
        if (record.karkunData?.city) {
          cityCountry.push(<Row key="1">{record.karkunData.city.name}</Row>);
          cityCountry.push(<Row key="2">{record.visitorData.city.country}</Row>);
        }
      } else {
        if (record.visitorData?.city) {
          cityCountry.push(<Row key="1">{record.visitorData?.city}</Row>);
        }
        if (record.visitorData?.country) {
          cityCountry.push(<Row key="2">{record.visitorData?.country}</Row>);
        }
      }
      return <>{cityCountry}</>;
    },
  };

  actionsColumn = {
    key: 'action',
    width: 80,
    render: (text, record) => {
      const {
        showDeleteAction,
        showAuditLogsAction,
        handleDeleteItem,
        handleAuditLogsAction,
      } = this.props;

      const auditLogsAction = showAuditLogsAction ? (
        <Tooltip title="Audit Logs">
          <AuditOutlined
            className="list-actions-icon"
            onClick={() => {
              handleAuditLogsAction(record);
            }}
          />
        </Tooltip>
      ) : null;

      const deleteAction = showDeleteAction ? (
        <Popconfirm
          title="Are you sure you want to delete the data for this person?"
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
      ) : null;

      return (
        <div className="list-actions-column">
          {auditLogsAction}
          {deleteAction}
        </div>
      );
    },
  };

  getColumns = () => {
    const {
      showCategoryColumn,
      showCnicColumn,
      showPhoneNumbersColumn,
      showCityCountryColumn,
      showDeleteAction,
      showAuditLogsAction,
    } = this.props;

    const columns = [];
    if (showCategoryColumn) {
      columns.push(this.categoryColumn);
    }

    columns.push(this.nameColumn);

    if (showCnicColumn) {
      columns.push(this.cnicColumn);
    }

    if (showPhoneNumbersColumn) {
      columns.push(this.phoneNumberColumn);
    }

    if (showCityCountryColumn) {
      columns.push(this.cityCountryColumn);
    }

    if (showDeleteAction || showAuditLogsAction) {
      columns.push(this.actionsColumn);
    }

    return columns;
  };

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows,
      });
    },
  };

  onPaginationChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: (pageIndex - 1).toString(),
      pageSize: pageSize.toString(),
    });
  };

  getSelectedRows = () => this.state.selectedRows;

  render() {
    const {
      pageIndex,
      pageSize,
      listHeader,
      showSelectionColumn,
      pagedData: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.getColumns()}
        title={listHeader}
        rowSelection={showSelectionColumn ? this.rowSelection : null}
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
            onChange={this.onPaginationChange}
            onShowSizeChange={this.onPaginationChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}
