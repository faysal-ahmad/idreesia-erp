import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';
import { Button, Row, Select, Table, Tooltip } from 'antd';
import { EditOutlined, PrinterOutlined, UsergroupAddOutlined, UsergroupDeleteOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight, sortBy } from 'meteor/idreesia-common/utilities/lodash';
import { PersonName, PeopleSelectionButton } from '/imports/ui/modules/helpers/controls';

import { MEHFIL_KARKUNS_BY_MEHFIL_ID } from './gql';

const SelectStyle = {
  width: '300px',
};

export class List extends Component {
  static propTypes = {
    dutyId: PropTypes.string,
    mehfilId: PropTypes.string,
    mehfilById: PropTypes.object,
    allSecurityMehfilDuties: PropTypes.array,
    setPageParams: PropTypes.func,

    mehfilKarkunsLoading: PropTypes.bool,
    mehfilKarkunsByMehfilId: PropTypes.array,
    refetchMehfilKarkuns: PropTypes.func,
    handleAddMehfilKarkun: PropTypes.func,
    handleEditMehfilKarkun: PropTypes.func,
    handleRemoveMehfilKarkun: PropTypes.func,
    handleViewMehfilCards: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  getIsPastMehfil = mehfilById => {
    const mehfilDate = moment(Number(mehfilById.mehfilDate));
    return moment().diff(
      moment(mehfilDate, Formats.DATE_FORMAT),
      'days'
      ) > 30;
  }

  getColumns = (isPastMehfil, allSecurityMehfilDuties) => {
    const columns = [
      {
        title: 'Name',
        key: 'karkun.name',
        render: (text, record) => {
          const personNameData = {
            _id: record._id,
            name: record.karkun.sharedData.name,
            imageId: record.karkun.sharedData.imageId,
            image: record.karkun.sharedData.image,
          };
    
          return (
            <PersonName
              person={personNameData}
              onPersonNameClicked={() => {}}
            />
          );
        },
      },
      {
        title: 'City',
        key: 'cityCountry',
        render: (text, record) => {
          if (record.karkun.isKarkun && record.karkun.karkunData?.city) {
            return record.karkun.karkunData.city.name;
          } else if (record.karkun.visitorData?.city) {
            return record.karkun.visitorData?.city;
          }

          return '';
        },
      },
      {
        title: 'CNIC',
        key: 'cnicNumber',
        render: (text, record) => record.karkun.sharedData?.cnicNumber,
      },
      {
        title: 'Contact No.',
        key: 'contactNumbers',
        render: (text, record) => {
          const numbers = [];
          if (record.karkun.sharedData?.contactNumber1)
            numbers.push(<Row key="1">{record.karkun.sharedData?.contactNumber1}</Row>);
          if (record.karkun.sharedData.contactNumber2)
            numbers.push(<Row key="2">{record.karkun.sharedData?.contactNumber2}</Row>);
    
          if (numbers.length === 0) return '';
          return <>{numbers}</>;
        },
          },
      {
        title: 'Duty Name',
        dataIndex: 'dutyId',
        key: 'dutyId',
        render: text => {
          const duty = allSecurityMehfilDuties.find(mehfilDuty => mehfilDuty._id === text);
          return duty?.name;
        },
      },
      {
        title: 'Duty Detail',
        dataIndex: 'dutyDetail',
        key: 'dutyDetail',
      },
    ];

    if (!isPastMehfil) {
      columns.push({
        key: 'action',
        render: (text, record) => (
          <div className="list-actions-column">
            <Tooltip key="delete" title="Remove Karkun">
              <UsergroupDeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  const {
                    handleRemoveMehfilKarkun,
                    refetchMehfilKarkuns,
                  } = this.props;
                  handleRemoveMehfilKarkun(record._id, refetchMehfilKarkuns);
                }}
              />
            </Tooltip>
          </div>
        ),
      });
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

  handleSelectionChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      dutyId: value,
    });
    this.setState({
      selectedRows: [],
    });
  };

  handleEditDutyDetails = () => {
    const { handleEditMehfilKarkun } = this.props;
    const { selectedRows } = this.state;
    if (handleEditMehfilKarkun) {
      handleEditMehfilKarkun(selectedRows);
    }
  };

  handleViewMehfilCards = () => {
    const { handleViewMehfilCards } = this.props;
    const { selectedRows } = this.state;
    if (handleViewMehfilCards) {
      handleViewMehfilCards(selectedRows);
    }
  };

  onKarkunSelection = karkun => {
    const { handleAddMehfilKarkun, refetchMehfilKarkuns } = this.props;
    handleAddMehfilKarkun(karkun._id, refetchMehfilKarkuns);
  };

  getTableHeader = () => {
    const { mehfilById, allSecurityMehfilDuties, dutyId } = this.props;
    const { selectedRows } = this.state;
    const isPastMehfil = this.getIsPastMehfil(mehfilById);

    const options = allSecurityMehfilDuties.map(duty => (
      <Select.Option key={duty._id} value={duty._id}>
        {`${duty.name} - ${duty.mehfilUsedCount}`}
      </Select.Option>
    ));

    const dutySelector = (
      <Select
        defaultValue={dutyId}
        style={SelectStyle}
        onChange={this.handleSelectionChange}
        allowClear
        dropdownMatchSelectWidth
      >
        {options}
      </Select>
    );

    const actions = (
      <div className="list-table-header-section">
        <PeopleSelectionButton
          icon={<UsergroupAddOutlined />}
          label="Add Karkuns"
          onSelection={this.onKarkunSelection}
          disabled={isPastMehfil || !dutyId}
        />
        &nbsp;&nbsp;
        <Button
          disabled={isPastMehfil || !(selectedRows && selectedRows.length > 0)}
          icon={<EditOutlined />}
          size="large"
          onClick={this.handleEditDutyDetails}
        >
          Edit Duty Detail
        </Button>
        &nbsp;&nbsp;
        <Button
          disabled={isPastMehfil}
          icon={<PrinterOutlined />}
          size="large"
          onClick={this.handleViewMehfilCards}
        >
          Print Cards
        </Button>
      </div>
    );

    return (
      <div className="list-table-header">
        <div>{dutySelector}</div>
        {actions}
      </div>
    );
  };

  render() {
    const {
      mehfilById,
      mehfilKarkunsLoading,
      mehfilKarkunsByMehfilId,
      allSecurityMehfilDuties,
    } = this.props;
    if (mehfilKarkunsLoading) return null;

    const isPastMehfil = this.getIsPastMehfil(mehfilById);
    const sortedMehfilKarkuns = sortBy(mehfilKarkunsByMehfilId, 'karkun.sharedData.name');

    return (
      <Table
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.getColumns(isPastMehfil, allSecurityMehfilDuties)}
        rowSelection={!isPastMehfil ? this.rowSelection : null}
        dataSource={sortedMehfilKarkuns}
        pagination={false}
        bordered
      />
    );
  }
}

export default flowRight(
  graphql(MEHFIL_KARKUNS_BY_MEHFIL_ID, {
    props: ({ data }) => ({
      mehfilKarkunsLoading: data.loading,
      refetchMehfilKarkuns: data.refetch,
      ...data,
    }),
    options: ({ mehfilId, dutyId }) => ({
      fetchPolicy: "cache-and-network",
      variables: {
        mehfilId,
        dutyId,
      },
    }),
  })
)(List);
