import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  Button,
  Icon,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import { InputFile } from '/imports/ui/modules/helpers/controls';

import { VisitorName } from '/imports/ui/modules/security/common/controls';
import ListFilter from './list-filter';

const StatusStyle = {
  fontSize: 20,
};

const ButtonGroupStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    phoneNumber: PropTypes.string,
    additionalInfo: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    handleShowStayList: PropTypes.func,
    showNewButton: PropTypes.bool,
    handleNewClicked: PropTypes.func,
    handleScanClicked: PropTypes.func,

    deleteVisitor: PropTypes.func,
    importCsvData: PropTypes.func,
    loading: PropTypes.bool,
    pagedVisitors: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
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
      <VisitorName
        visitor={record}
        onVisitorNameClicked={this.props.handleItemSelected}
      />
    ),
  };

  cnicColumn = {
    title: 'CNIC Number',
    dataIndex: 'cnicNumber',
    key: 'cnicNumber',
  };

  phoneNumberColumn = {
    title: 'Phone Number',
    key: 'phoneNumber',
    render: (text, record) => {
      const numbers = [];
      if (record.contactNumber1) numbers.push(record.contactNumber1);
      if (record.contactNumber2) numbers.push(record.contactNumber2);

      if (numbers.length === 0) return '';
      return numbers.join(', ');
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
    render: (text, record) => (
      <div className="list-actions-column">
        <Tooltip title="Stay History">
          <Icon
            type="history"
            className="list-actions-icon"
            onClick={() => {
              this.handleStayHistoryClicked(record);
            }}
          />
        </Tooltip>
        <Popconfirm
          title="Are you sure you want to delete this visitor registration?"
          onConfirm={() => {
            this.handleDeleteClicked(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <Icon type="delete" className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
      </div>
    ),
  };

  getColumns = () => [
    this.statusColumn,
    this.nameColumn,
    this.cnicColumn,
    this.phoneNumberColumn,
    this.cityCountryColumn,
    this.actionsColumn,
  ];

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows,
      });
    },
  };

  onSelect = visitor => {
    const { handleItemSelected } = this.props;
    handleItemSelected(visitor);
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

  handleDeleteClicked = record => {
    const { deleteVisitor } = this.props;
    deleteVisitor({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleStayHistoryClicked = visitor => {
    const { handleShowStayList } = this.props;
    if (handleShowStayList) handleShowStayList(visitor);
  };

  handleUploadData = fileContents => {
    const { importCsvData } = this.props;
    importCsvData({
      variables: {
        csvData: fileContents,
      },
    })
      .then(response => {
        const result = JSON.parse(response.data.importCsvData);
        message.success(
          `${result.imported} records were imported. ${result.ignored} were ignored.`
        );
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  getTableHeader = () => {
    const {
      name,
      cnicNumber,
      phoneNumber,
      additionalInfo,
      setPageParams,
      showNewButton,
      handleNewClicked,
      handleScanClicked,
    } = this.props;

    let newButton = null;
    if (showNewButton) {
      newButton = (
        <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
          New Visitor Registration
        </Button>
      );
    }

    return (
      <div className="list-table-header">
        <div style={ButtonGroupStyle}>
          {newButton}
          &nbsp;
          <Button icon="scan" onClick={handleScanClicked}>
            Scan Visitor CNIC
          </Button>
        </div>
        <div className="list-table-header-section">
          <ListFilter
            name={name}
            cnicNumber={cnicNumber}
            phoneNumber={phoneNumber}
            additionalInfo={additionalInfo}
            setPageParams={setPageParams}
          />
          &nbsp;&nbsp;
          <Tooltip title="Upload CSV Data">
            <InputFile
              label=""
              accept=".csv"
              showUploadList={false}
              onChange={this.handleUploadData}
            />
          </Tooltip>
        </div>
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedVisitors: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.getColumns()}
        title={this.getTableHeader}
        rowSelection={this.rowSelection}
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
  query pagedVisitors($queryString: String) {
    pagedVisitors(queryString: $queryString) {
      totalResults
      data {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        city
        country
        imageId
        criminalRecord
        otherNotes
      }
    }
  }
`;

const importCsvDataMutation = gql`
  mutation importCsvData($csvData: String!) {
    importCsvData(csvData: $csvData)
  }
`;

const deleteMutation = gql`
  mutation deleteVisitor($_id: String!) {
    deleteVisitor(_id: $_id)
  }
`;

export default flowRight(
  graphql(importCsvDataMutation, {
    name: 'importCsvData',
    options: {
      refetchQueries: ['pagedVisitors'],
    },
  }),
  graphql(deleteMutation, {
    name: 'deleteVisitor',
    options: {
      refetchQueries: ['pagedVisitors'],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({
      name,
      cnicNumber,
      phoneNumber,
      additionalInfo,
      pageIndex,
      pageSize,
    }) => ({
      variables: {
        queryString: `?name=${name || ''}&cnicNumber=${cnicNumber ||
          ''}&phoneNumber=${phoneNumber ||
          ''}&additionalInfo=${additionalInfo ||
          ''}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  })
)(List);
