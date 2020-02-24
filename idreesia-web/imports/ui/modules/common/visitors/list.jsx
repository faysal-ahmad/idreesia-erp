import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Icon,
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tooltip,
} from '/imports/ui/controls';
import { PersonName } from '/imports/ui/modules/helpers/controls';

const StatusStyle = {
  fontSize: 20,
};

export default class VisitorsList extends Component {
  static propTypes = {
    showSelectionColumn: PropTypes.bool,
    showStatusColumn: PropTypes.bool,
    showCnicColumn: PropTypes.bool,
    showPhoneNumbersColumn: PropTypes.bool,
    showCityCountryColumn: PropTypes.bool,
    showDeleteAction: PropTypes.bool,
    showStayHistoryAction: PropTypes.bool,
    showMulakaatHistoryAction: PropTypes.bool,
    showKarkunLinkAction: PropTypes.bool,
    showKarkunCreateAction: PropTypes.bool,

    listHeader: PropTypes.func,
    handleSelectItem: PropTypes.func,
    handleDeleteItem: PropTypes.func,
    handleStayHistoryAction: PropTypes.func,
    handleMulakaatHistoryAction: PropTypes.func,
    handleKarkunLinkAction: PropTypes.func,
    handleKarkunCreateAction: PropTypes.func,
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
    showStayHistoryAction: false,
    showMulakaatHistoryAction: false,
    showKarkunLinkAction: false,
    showKarkunCreateAction: false,

    handleSelectItem: noop,
    handleDeleteItem: noop,
    handleStayHistoryAction: noop,
    handleMulakaatHistoryAction: noop,
    handleKarkunLinkAction: noop,
    handleKarkunCreateAction: noop,
    listHeader: () => null,
  };

  state = {
    selectedRows: [],
  };

  statusColumn = {
    title: '',
    key: 'status',
    render: (text, record) => {
      if (record.criminalRecord) {
        return (
          <Icon
            type="warning"
            style={StatusStyle}
            theme="twoTone"
            twoToneColor="red"
          />
        );
      } else if (record.otherNotes) {
        return (
          <Icon
            type="warning"
            style={StatusStyle}
            theme="twoTone"
            twoToneColor="orange"
          />
        );
      }

      return null;
    },
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
      if (record.contactNumber1)
        numbers.push(<Row key="1">{record.contactNumber1}</Row>);
      if (record.contactNumber2)
        numbers.push(<Row key="2">{record.contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  cityCountryColumn = {
    title: 'City / Country',
    key: 'cityCountry',
    render: (text, record) => {
      if (record.city) {
        return `${record.city}, ${record.country}`;
      }
      return record.country;
    },
  };

  actionsColumn = {
    key: 'action',
    width: 80,
    render: (text, record) => {
      const {
        showDeleteAction,
        showStayHistoryAction,
        showMulakaatHistoryAction,
        showKarkunLinkAction,
        showKarkunCreateAction,
        handleDeleteItem,
        handleStayHistoryAction,
        handleMulakaatHistoryAction,
        handleKarkunLinkAction,
        handleKarkunCreateAction,
      } = this.props;

      const stayHistoryAction = showStayHistoryAction ? (
        <Tooltip title="Stay History">
          <Icon
            type="history"
            className="list-actions-icon"
            onClick={() => {
              handleStayHistoryAction(record);
            }}
          />
        </Tooltip>
      ) : null;

      const mulakaatHistoryAction = showMulakaatHistoryAction ? (
        <Tooltip title="Mulakaat History">
          <Icon
            type="thunderbolt"
            className="list-actions-icon"
            onClick={() => {
              handleMulakaatHistoryAction(record);
            }}
          />
        </Tooltip>
      ) : null;

      const linkAction =
        showKarkunLinkAction && record.karkunId ? (
          <Tooltip title="Show in Karkuns">
            <Icon
              type="link"
              className="list-actions-icon"
              onClick={() => {
                handleKarkunLinkAction(record);
              }}
            />
          </Tooltip>
        ) : null;

      const createAction =
        showKarkunCreateAction && !record.karkunId ? (
          <Tooltip title="Create Karkun">
            <Icon
              type="plus-circle"
              className="list-actions-icon"
              onClick={() => {
                handleKarkunCreateAction(record);
              }}
            />
          </Tooltip>
        ) : null;

      const deleteAction = showDeleteAction ? (
        <Popconfirm
          title="Are you sure you want to delete this visitor?"
          onConfirm={() => {
            handleDeleteItem(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <Icon type="delete" className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
      ) : null;

      return (
        <div className="list-actions-column">
          {stayHistoryAction}
          {mulakaatHistoryAction}
          {linkAction}
          {createAction}
          {deleteAction}
        </div>
      );
    },
  };

  getColumns = () => {
    const {
      showStatusColumn,
      showCnicColumn,
      showPhoneNumbersColumn,
      showCityCountryColumn,
      showDeleteAction,
      showStayHistoryAction,
      showMulakaatHistoryAction,
      showKarkunLinkAction,
      showKarkunCreateAction,
    } = this.props;

    const columns = [];
    if (showStatusColumn) {
      columns.push(this.statusColumn);
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

    if (
      showDeleteAction ||
      showStayHistoryAction ||
      showMulakaatHistoryAction ||
      showKarkunLinkAction ||
      showKarkunCreateAction
    ) {
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
      pageIndex: pageIndex - 1,
      pageSize,
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
