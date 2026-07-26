// @ts-nocheck
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AuditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  SettingOutlined,
  PlusCircleOutlined,
  BarcodeOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tooltip,
  message,
} from 'antd';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import ListFilter from './list-filter';

import { PAGED_HR_KARKUNS, DELETE_HR_KARKUN } from '../gql';

const ContactNumberSubscribed = {
  color: 'green',
};

const ContactNumberNotSubscribed = {
  color: 'red',
};

const List = props => {
  const [selectedRows, setSelectedRows] = useState([]);
  const {
    pageIndex,
    pageSize,
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
    handleItemSelected,
    showNewButton,
    showDownloadButton,
    showSelectionColumn,
    showPhoneNumbersColumn,
    showDutiesColumn,
    showActionsColumn,
    predefinedFilterName,
    predefinedFilterStoreId,
    handlePrintClicked,
    handleAuditLogClicked,
    handleNewClicked,
    handleScanClicked,
    handlePrintSelected,
  } = props;
  const { data, loading, refetch: refetchListQuery } = useQuery(PAGED_HR_KARKUNS, {
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
        predefinedFilterStoreId,
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
      },
    },
  });
  const [deleteHrKarkun] = useMutation(DELETE_HR_KARKUN, {
    refetchQueries: ['pagedHrKarkuns'],
  });

  const handleDeleteClicked = record => {
    deleteHrKarkun({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleExportSelected = () => {
    if (selectedRows.length === 0) return;

    const reportArgs = selectedRows.map(row => row._id);
    const url = `${
      window.location.origin
    }/generate-report?reportName=Karkuns&reportArgs=${reportArgs.join(',')}`;
    window.open(url, '_blank');
  };

  const handlePrintSelectedClick = () => {
    if (selectedRows.length === 0) return;
    handlePrintSelected(selectedRows);
  };

  const nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <KarkunName
        karkun={record}
        onKarkunNameClicked={handleItemSelected}
      />
    ),
  };

  const cnicColumn = {
    title: 'CNIC Number',
    dataIndex: 'cnicNumber',
    key: 'cnicNumber',
  };

  const phoneNumberColumn = {
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

  const dutiesColumn = {
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

  const actionsColumn = {
    key: 'action',
    render: (text, record) => (
      <div className="list-actions-column">
        <Tooltip title="Print">
          <PrinterOutlined
            className="list-actions-icon"
            onClick={() => {
              handlePrintClicked(record);
            }}
          />
        </Tooltip>
        <Tooltip title="Audit Log">
          <AuditOutlined
            className="list-actions-icon"
            onClick={() => {
              handleAuditLogClicked(record);
            }}
          />
        </Tooltip>
        <Popconfirm
          title="Are you sure you want to delete this karkun?"
          onConfirm={() => {
            handleDeleteClicked(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <DeleteOutlined className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
      </div>
    ),
  };

  const getColumns = () => {
    const columns = [nameColumn, cnicColumn];

    if (showPhoneNumbersColumn) {
      columns.push(phoneNumberColumn);
    }

    if (showDutiesColumn) {
      columns.push(dutiesColumn);
    }

    if (showActionsColumn) {
      columns.push(actionsColumn);
    }

    return columns;
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };

  const onChange = (pageIndex, pageSize) => {
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  const onShowSizeChange = (pageIndex, pageSize) => {
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  const getActionsMenu = () => {
    if (!showDownloadButton) return null;

    const menuItems = [
      {
        key: '1',
        label: (
          <>
            <PrinterOutlined />&nbsp;
            Print Selected
          </>
        ),
        onClick: handlePrintSelectedClick,
      },
      { type: 'divider' },
      {
        key: '2',
        label: (
          <>
            <DownloadOutlined />&nbsp;
            Download Selected
          </>
        ),
        onClick: handleExportSelected,
      },
    ];

    return (
      <Dropdown menu={{ items: menuItems }}>
        <Button icon={<SettingOutlined />} size="large" />
      </Dropdown>
    );
  };

  const getTableHeader = () => {
    let newButton = null;
    if (showNewButton) {
      newButton = (
        <div>
          <Button
            size="large"
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Karkun
          </Button>
          &nbsp;
          <Button
            size="large"
            type="secondary"
            icon={<BarcodeOutlined />}
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

    if (!newButton && !listFilter) return null;
    return (
      <div className="list-table-header">
        {newButton}
        <div className="list-table-header-section">
          {listFilter}
          &nbsp;&nbsp;
          {getActionsMenu()}
        </div>
      </div>
    );
  };

  if (loading) return null;

  const { totalResults, karkuns } = data.pagedHrKarkuns;

  const numPageIndex = pageIndex ? pageIndex + 1 : 1;
  const numPageSize = pageSize || 20;

  return (
    <Table
      rowKey="_id"
      dataSource={karkuns}
      columns={getColumns()}
      title={getTableHeader}
      rowSelection={showSelectionColumn ? rowSelection : null}
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
          onChange={onChange}
          onShowSizeChange={onShowSizeChange}
          total={totalResults}
        />
      )}
    />
  );
};

List.propTypes = {
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
  predefinedFilterStoreId: PropTypes.string,
  handlePrintClicked: PropTypes.func,
  handleAuditLogClicked: PropTypes.func,
  handleNewClicked: PropTypes.func,
  handleScanClicked: PropTypes.func,
  handlePrintSelected: PropTypes.func,
};

List.defaultProps = {
  handleItemSelected: noop,
  handleNewClicked: noop,
  handleScanClicked: noop,
  handlePrintClicked: noop,
};

export default List;
