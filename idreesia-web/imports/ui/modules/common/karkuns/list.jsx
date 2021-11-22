import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AuditOutlined, DeleteOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tooltip,
} from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

const ContactNumberSubscribed = {
  color: 'green',
};

const ContactNumberNotSubscribed = {
  color: 'red',
};

export default class KarkunsList extends Component {
  static propTypes = {
    showSelectionColumn: PropTypes.bool,
    showCnicColumn: PropTypes.bool,
    showPhoneNumbersColumn: PropTypes.bool,
    showDutiesColumn: PropTypes.bool,
    showMehfilCityColumn: PropTypes.bool,
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
      karkuns: PropTypes.array,
    }),
  };

  static defaultProps = {
    showAuditLogsAction: false,

    handleSelectItem: noop,
    handleDeleteItem: noop,
    handleAuditLogsAction: noop,
    listHeader: () => null,
  };

  state = {
    selectedRows: [],
  };

  nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <PersonName
        person={record}
        onPersonNameClicked={this.props.handleSelectItem}
      />
    ),
  };

  cnicColumn = {
    title: 'CNIC Number',
    dataIndex: 'cnicNumber',
    key: 'cnicNumber',
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (text, record) => {
      const numbers = [];
      let style = {};
      if (record.contactNumber1) {
        if (record.contactNumber1Subscribed === true) {
          style = ContactNumberSubscribed;
        } else if (record.contactNumber1Subscribed === false) {
          style = ContactNumberNotSubscribed;
        }

        numbers.push(
          <Row key="1">
            <span style={style}>{record.contactNumber1}</span>
          </Row>
        );
      }

      if (record.contactNumber2) {
        style = {};
        if (record.contactNumber2Subscribed === true) {
          style = ContactNumberSubscribed;
        } else if (record.contactNumber2Subscribed === false) {
          style = ContactNumberNotSubscribed;
        }

        numbers.push(
          <Row key="2">
            <span style={style}>{record.contactNumber2}</span>
          </Row>
        );
      }

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  mehfilCityColumn = {
    title: 'City / Mehfil',
    key: 'cityMehfil',
    render: (text, record) => {
      const { city, cityMehfil } = record;
      const cityMehfilInfo = [];

      if (cityMehfil) {
        cityMehfilInfo.push(<Row key="1">{cityMehfil.name}</Row>);
      }
      if (city) {
        cityMehfilInfo.push(
          <Row key="2">{`${city.name}, ${city.country}`}</Row>
        );
      }

      if (cityMehfilInfo.length === 0) return '';
      return <>{cityMehfilInfo}</>;
    },
  };

  dutiesColumn = {
    title: 'Duties',
    dataIndex: 'duties',
    key: 'duties',
    render: duties => {
      let dutyNames = [];
      if (duties.length > 0) {
        dutyNames = duties.map(duty => {
          const dutyName = duty.dutyName;
          return <span>{dutyName}</span>;
        });
      }

      if (dutyNames.length === 0) {
        return null;
      } else if (dutyNames.length === 1) {
        return dutyNames[0];
      }
      return (
        <>
          {dutyNames.map((dutyName, index) => (
            <Row key={index}>{dutyName}</Row>
          ))}
        </>
      );
    },
  };

  actionsColumn = {
    key: 'action',
    render: (text, record) => {
      const {
        showAuditLogsAction,
        showDeleteAction,
        handleAuditLogsAction,
        handleDeleteItem,
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
          title="Are you sure you want to delete this karkun?"
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
      showCnicColumn,
      showPhoneNumbersColumn,
      showMehfilCityColumn,
      showDutiesColumn,
      showAuditLogsAction,
      showDeleteAction,
    } = this.props;
    const columns = [this.nameColumn];

    if (showCnicColumn) {
      columns.push(this.cnicColumn);
    }

    if (showPhoneNumbersColumn) {
      columns.push(this.phoneNumberColumn);
    }

    if (showMehfilCityColumn) {
      columns.push(this.mehfilCityColumn);
    }

    if (showDutiesColumn) {
      columns.push(this.dutiesColumn);
    }

    if (showAuditLogsAction || showDeleteAction) {
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
      pagedData: { totalResults, karkuns },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={karkuns}
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
