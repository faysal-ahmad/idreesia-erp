import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
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

const IconStyle = {
  cursor: 'pointer',
  fontSize: 20,
};

const ToolbarStyle = {
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
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    phoneNumber: PropTypes.string,
    bloodGroup: PropTypes.string,
    jobId: PropTypes.string,
    dutyId: PropTypes.string,
    shiftId: PropTypes.string,
    showVolunteers: PropTypes.string,
    showEmployees: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    showNewButton: PropTypes.bool,
    handleNewClicked: PropTypes.func,
    handleScanClicked: PropTypes.func,
    handlePrintClicked: PropTypes.func,
    showPhoneNumbersColumn: PropTypes.bool,
    predefinedFilterName: PropTypes.string,

    deleteKarkun: PropTypes.func,
    loading: PropTypes.bool,
    refetchListQuery: PropTypes.func,
    pagedKarkuns: PropTypes.shape({
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
      if (record.contactNumber1) numbers.push(record.contactNumber1);
      if (record.contactNumber2) numbers.push(record.contactNumber2);

      if (numbers.length === 0) return '';
      return numbers.join(', ');
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
        const jobTabLink = `${paths.karkunsPath}/${record._id}?default-active-tab=6`;
        jobName = [<Link to={jobTabLink}>{record.job.name}</Link>];
      }

      if (duties.length > 0) {
        const dutyTabLink = `${paths.karkunsPath}/${record._id}?default-active-tab=3`;
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
      <>
        <Tooltip title="Print">
          <Icon
            type="printer"
            style={IconStyle}
            onClick={() => {
              this.props.handlePrintClicked(record);
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
            <Icon type="delete" style={IconStyle} />
          </Tooltip>
        </Popconfirm>
      </>
    ),
  };

  getColumns = () => {
    const { showPhoneNumbersColumn } = this.props;
    if (showPhoneNumbersColumn) {
      return [
        this.nameColumn,
        this.cnicColumn,
        this.phoneNumberColumn,
        this.dutiesColumn,
        this.actionsColumn,
      ];
    }

    return [this.nameColumn, this.cnicColumn, this.dutiesColumn];
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
    const { deleteKarkun } = this.props;
    deleteKarkun({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  getTableHeader = () => {
    const {
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      jobId,
      dutyId,
      shiftId,
      showVolunteers,
      showEmployees,
      setPageParams,
      refetchListQuery,
      showNewButton,
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
          jobId={jobId}
          dutyId={dutyId}
          shiftId={shiftId}
          showVolunteers={showVolunteers}
          showEmployees={showEmployees}
          setPageParams={setPageParams}
          refreshData={refetchListQuery}
        />
      );
    }

    if (!newButton && !listFilter) return null;
    return (
      <div style={ToolbarStyle}>
        {newButton}
        {listFilter}
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedKarkuns: { totalResults, karkuns },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={karkuns}
        columns={this.getColumns()}
        title={this.getTableHeader}
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
  query pagedKarkuns($queryString: String) {
    pagedKarkuns(queryString: $queryString) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        imageId
        job {
          _id
          name
        }
        duties {
          _id
          dutyId
          shiftId
          dutyName
          shiftName
          role
        }
      }
    }
  }
`;

const formMutation = gql`
  mutation deleteKarkun($_id: String!) {
    deleteKarkun(_id: $_id)
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'deleteKarkun',
    options: {
      refetchQueries: ['pagedKarkuns'],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ refetchListQuery: data.refetch, ...data }),
    options: ({
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      jobId,
      dutyId,
      shiftId,
      showVolunteers,
      showEmployees,
      predefinedFilterName,
      pageIndex,
      pageSize,
    }) => ({
      variables: {
        queryString: `?name=${name || ''}&cnicNumber=${cnicNumber ||
          ''}&phoneNumber=${phoneNumber || ''}&bloodGroup=${bloodGroup ||
          ''}&jobId=${jobId || ''}&dutyId=${dutyId || ''}&shiftId=${shiftId ||
          ''}&showVolunteers=${showVolunteers ||
          'true'}&showEmployees=${showEmployees ||
          'true'}&predefinedFilterName=${predefinedFilterName ||
          ''}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  })
)(List);
