import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';

import { flowRight, noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Button,
  Icon,
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import ListFilter from './list-filter';

import { PAGED_HR_KARKUNS, DELETE_HR_KARKUN } from '../gql';

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    phoneNumber: PropTypes.string,
    bloodGroup: PropTypes.string,
    lastTarteeb: PropTypes.string,
    jobId: PropTypes.string,
    dutyId: PropTypes.string,
    dutyShiftId: PropTypes.string,
    showVolunteers: PropTypes.string,
    showEmployees: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    showNewButton: PropTypes.bool,
    showDownloadButton: PropTypes.bool,
    showSelectionColumn: PropTypes.bool,
    showPhoneNumbersColumn: PropTypes.bool,
    showDutiesColumn: PropTypes.bool,
    showActionsColumn: PropTypes.bool,
    predefinedFilterName: PropTypes.string,
    handlePrintClicked: PropTypes.func,
    handleAuditLogClicked: PropTypes.func,
    handleNewClicked: PropTypes.func,
    handleScanClicked: PropTypes.func,

    deleteHrKarkun: PropTypes.func,
    loading: PropTypes.bool,
    refetchListQuery: PropTypes.func,
    pagedHrKarkuns: PropTypes.shape({
      totalResults: PropTypes.number,
      karkuns: PropTypes.array,
    }),
  };

  static defaultProps = {
    handleItemSelected: noop,
    handleNewClicked: noop,
    handleScanClicked: noop,
    handlePrintClicked: noop,
  };

  state = {
    selectedRows: [],
  };

  nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <KarkunName
        karkun={record}
        onKarkunNameClicked={this.props.handleItemSelected}
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

  dutiesColumn = {
    title: 'Job / Duties',
    dataIndex: 'duties',
    key: 'duties',
    render: (duties, record) => {
      let jobName = [];
      let dutyNames = [];

      if (record.job) {
        const jobTabLink = `${paths.karkunsPath}/${record._id}?default-active-tab=7`;
        jobName = [<Link to={jobTabLink}>{record.job.name}</Link>];
      }

      if (duties.length > 0) {
        const dutyTabLink = `${paths.karkunsPath}/${record._id}?default-active-tab=4`;
        dutyNames = duties.map(duty => {
          let dutyName = duty.dutyName;
          if (duty.shiftName) {
            dutyName = `${duty.dutyName} - ${duty.shiftName}`;
          }

          if (duty.role === 'CO') {
            dutyName = `(CO) - ${dutyName}`;
          }

          return <Link to={dutyTabLink}>{dutyName}</Link>;
        });
      }

      const links = jobName.concat(dutyNames);
      if (links.length === 0) {
        return null;
      } else if (links.length === 1) {
        return links[0];
      }
      return (
        <>
          {links.map((link, index) => (
            <Row key={index}>{link}</Row>
          ))}
        </>
      );
    },
  };

  actionsColumn = {
    key: 'action',
    render: (text, record) => (
      <div className="list-actions-column">
        <Tooltip title="Print">
          <Icon
            type="printer"
            className="list-actions-icon"
            onClick={() => {
              this.props.handlePrintClicked(record);
            }}
          />
        </Tooltip>
        <Tooltip title="Audit Log">
          <Icon
            type="audit"
            className="list-actions-icon"
            onClick={() => {
              this.props.handleAuditLogClicked(record);
            }}
          />
        </Tooltip>
        <Popconfirm
          title="Are you sure you want to delete this karkun?"
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

  getColumns = () => {
    const {
      showPhoneNumbersColumn,
      showDutiesColumn,
      showActionsColumn,
    } = this.props;
    const columns = [this.nameColumn, this.cnicColumn];

    if (showPhoneNumbersColumn) {
      columns.push(this.phoneNumberColumn);
    }

    if (showDutiesColumn) {
      columns.push(this.dutiesColumn);
    }

    if (showActionsColumn) {
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

  onSelect = karkun => {
    const { handleItemSelected } = this.props;
    handleItemSelected(karkun);
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
    const { deleteHrKarkun } = this.props;
    deleteHrKarkun({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleExportSelected = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) return;

    const reportArgs = selectedRows.map(row => row._id);
    const url = `${
      window.location.origin
    }/generate-report?reportName=Karkuns&reportArgs=${reportArgs.join(',')}`;
    window.open(url, '_blank');
  };

  getTableHeader = () => {
    const {
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      lastTarteeb,
      jobId,
      dutyId,
      dutyShiftId,
      showVolunteers,
      showEmployees,
      setPageParams,
      refetchListQuery,
      showNewButton,
      showDownloadButton,
      handleNewClicked,
      handleScanClicked,
      predefinedFilterName,
    } = this.props;

    let newButton = null;
    if (showNewButton) {
      newButton = (
        <div>
          <Button
            size="large"
            type="primary"
            icon="plus-circle-o"
            onClick={handleNewClicked}
          >
            New Karkun
          </Button>
          &nbsp;
          <Button
            size="large"
            type="secondary"
            icon="barcode"
            onClick={handleScanClicked}
          >
            Scan Card
          </Button>
        </div>
      );
    }

    let listFilter = null;
    if (!predefinedFilterName) {
      listFilter = (
        <ListFilter
          name={name}
          cnicNumber={cnicNumber}
          phoneNumber={phoneNumber}
          bloodGroup={bloodGroup}
          lastTarteeb={lastTarteeb}
          jobId={jobId}
          dutyId={dutyId}
          dutyShiftId={dutyShiftId}
          showVolunteers={showVolunteers}
          showEmployees={showEmployees}
          setPageParams={setPageParams}
          refreshData={refetchListQuery}
        />
      );
    }

    let downloadButton = null;
    if (showDownloadButton) {
      downloadButton = (
        <Tooltip title="Download Selected Data">
          <Button
            icon="download"
            size="large"
            onClick={this.handleExportSelected}
          />
        </Tooltip>
      );
    }

    if (!newButton && !listFilter) return null;
    return (
      <div className="list-table-header">
        {newButton}
        <div className="list-table-header-section">
          {listFilter}
          &nbsp;&nbsp;
          {downloadButton}
        </div>
      </div>
    );
  };

  render() {
    const { loading, showSelectionColumn } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedHrKarkuns: { totalResults, karkuns },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={karkuns}
        columns={this.getColumns()}
        title={this.getTableHeader}
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
  graphql(DELETE_HR_KARKUN, {
    name: 'deleteHrKarkun',
    options: {
      refetchQueries: ['pagedHrKarkuns'],
    },
  }),
  graphql(PAGED_HR_KARKUNS, {
    props: ({ data }) => ({ refetchListQuery: data.refetch, ...data }),
    options: ({
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      lastTarteeb,
      jobId,
      dutyId,
      dutyShiftId,
      showVolunteers,
      showEmployees,
      predefinedFilterName,
      pageIndex,
      pageSize,
    }) => ({
      variables: {
        filter: {
          name,
          cnicNumber,
          phoneNumber,
          bloodGroup,
          lastTarteeb,
          jobId,
          dutyId,
          dutyShiftId,
          showVolunteers,
          showEmployees,
          predefinedFilterName,
          pageIndex: pageIndex.toString(),
          pageSize: pageSize.toString(),
        },
      },
    }),
  })
)(List);
