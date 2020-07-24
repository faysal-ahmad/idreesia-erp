import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { Button, Select, Icon, Table, Tooltip } from '/imports/ui/controls';
import { flowRight, sortBy } from 'meteor/idreesia-common/utilities/lodash';
import { MehfilDuties } from 'meteor/idreesia-common/constants/security';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import { KarkunSelectionButton } from '/imports/ui/modules/helpers/controls';

import { MEHFIL_BY_ID } from '/imports/ui/modules/security/mehfils/gql';
import { MEHFIL_KARKUNS_BY_MEHFIL_ID } from './gql';

const SelectStyle = {
  width: '300px',
};

export class List extends Component {
  static propTypes = {
    dutyName: PropTypes.string,
    setPageParams: PropTypes.func,

    mehfilLoading: PropTypes.bool,
    mehfilById: PropTypes.object,
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

  getColumns = isPastMehfil => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'karkun.name',
        key: 'karkun.name',
        render: (text, record) => (
          <KarkunName karkun={record.karkun} onKarkunNameClicked={() => {}} />
        ),
      },
      {
        title: 'City',
        dataIndex: 'karkun.city.name',
        key: 'karkun.city.name',
      },
      {
        title: 'CNIC',
        dataIndex: 'karkun.cnicNumber',
        key: 'karkun.cnicNumber',
      },
      {
        title: 'Mobile No.',
        dataIndex: 'karkun.contactNumber1',
        key: 'karkun.contactNumber1',
      },
      {
        title: 'Duty Name',
        dataIndex: 'dutyName',
        key: 'dutyName',
        render: text => {
          debugger;
          const duty = MehfilDuties.find(mehfilDuty => mehfilDuty._id === text);
          return duty.name;
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
              <Icon
                type="usergroup-delete"
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
      dutyName: value,
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
    const { mehfilById, dutyName } = this.props;
    const { selectedRows } = this.state;
    const mehfilDate = moment(Number(mehfilById.mehfilDate));
    const isPastMehfil = moment().isAfter(mehfilDate);

    const options = MehfilDuties.map(duty => (
      <Select.Option key={duty._id} value={duty._id}>
        {duty.name}
      </Select.Option>
    ));

    const dutySelector = (
      <Select
        defaultValue={dutyName}
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
        <KarkunSelectionButton
          icon="usergroup-add"
          label="Add Karkuns"
          onSelection={this.onKarkunSelection}
          disabled={isPastMehfil || !dutyName}
        />
        &nbsp;&nbsp;
        <Button
          disabled={isPastMehfil || !(selectedRows && selectedRows.length > 0)}
          icon="edit"
          size="large"
          onClick={this.handleEditDutyDetails}
        >
          Edit Duty Detail
        </Button>
        &nbsp;&nbsp;
        <Button
          disabled={isPastMehfil || !(selectedRows && selectedRows.length > 0)}
          icon="printer"
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
      mehfilLoading,
      mehfilById,
      mehfilKarkunsLoading,
      mehfilKarkunsByMehfilId,
    } = this.props;
    if (mehfilLoading || mehfilKarkunsLoading) return null;

    const mehfilDate = moment(Number(mehfilById.mehfilDate));
    const isPastMehfil = moment().isAfter(mehfilDate);

    const sortedMehfilKarkuns = sortBy(mehfilKarkunsByMehfilId, 'karkun.name');

    return (
      <Table
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.getColumns(isPastMehfil)}
        rowSelection={!isPastMehfil ? this.rowSelection : null}
        dataSource={sortedMehfilKarkuns}
        pagination={false}
        bordered
      />
    );
  }
}

export default flowRight(
  graphql(MEHFIL_BY_ID, {
    props: ({ data }) => ({ mehfilLoading: data.loading, ...data }),
    options: ({ mehfilId }) => ({ variables: { _id: mehfilId } }),
  }),
  graphql(MEHFIL_KARKUNS_BY_MEHFIL_ID, {
    props: ({ data }) => ({
      mehfilKarkunsLoading: data.loading,
      refetchMehfilKarkuns: data.refetch,
      ...data,
    }),
    options: ({ mehfilId, dutyName }) => ({
      variables: {
        mehfilId,
        dutyName,
      },
    }),
  })
)(List);
