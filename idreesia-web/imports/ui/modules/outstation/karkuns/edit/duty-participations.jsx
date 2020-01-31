import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { find, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  Button,
  Icon,
  Select,
  Table,
  Tooltip,
  Popconfirm,
  message,
} from '/imports/ui/controls';
import { WithAllMehfilDuties } from '/imports/ui/modules/outstation/common/composers';

const SelectStyle = {
  width: '300px',
};

class DutyParticipation extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    karkunId: PropTypes.string,
    karkunDutiesByKarkunId: PropTypes.array,
    allMehfilDuties: PropTypes.array,
    allMehfilDutiesLoading: PropTypes.bool,
    createKarkunDuty: PropTypes.func,
    removeKarkunDuty: PropTypes.func,
  };

  columns = [
    {
      title: 'Duty Name',
      dataIndex: 'dutyName',
      key: 'dutyName',
      render: (text, record) => {
        if (record.role) {
          return `${text} (${record.role})`;
        }
        return text;
      },
    },
    {
      key: 'action',
      width: 50,
      render: (text, record) => (
        <span>
          <Popconfirm
            title="Are you sure you want to delete this duty?"
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
        </span>
      ),
    },
  ];

  getDutySelector = () => {
    const { allMehfilDuties, allMehfilDutiesLoading } = this.props;
    if (allMehfilDutiesLoading) return null;

    const options = allMehfilDuties.map(duty => (
      <Select.Option key={duty._id} value={duty._id}>
        {duty.name}
      </Select.Option>
    ));

    return (
      <Select
        allowClear
        style={SelectStyle}
        onChange={this.handleSelectionChange}
        dropdownMatchSelectWidth
        ref={s => {
          this.dutySelector = s;
        }}
      >
        {options}
      </Select>
    );
  };

  handleSelectionChange = value => {
    this.setState({
      selectedDutyId: value,
    });
  };

  handleAddClicked = () => {
    const { karkunId, karkunDutiesByKarkunId, createKarkunDuty } = this.props;
    const dutyId = this.state.selectedDutyId;

    if (!dutyId) return;
    const existingDuty = find(
      karkunDutiesByKarkunId,
      karkunDuty => karkunDuty.dutyId === dutyId
    );
    if (existingDuty) return;

    createKarkunDuty({
      variables: {
        karkunId,
        dutyId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleDeleteClicked = record => {
    const { removeKarkunDuty } = this.props;
    removeKarkunDuty({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { karkunDutiesByKarkunId } = this.props;

    return (
      <Fragment>
        <Table
          rowKey="_id"
          dataSource={karkunDutiesByKarkunId}
          columns={this.columns}
          size="small"
          bordered
          title={() => (
            <div className="list-table-header">
              <div className="list-table-header-section">
                {this.getDutySelector()}
                &nbsp;&nbsp;
                <Button
                  type="primary"
                  icon="plus-circle-o"
                  onClick={this.handleAddClicked}
                >
                  Add Duty
                </Button>
              </div>
            </div>
          )}
        />
      </Fragment>
    );
  }
}

const listQuery = gql`
  query karkunDutiesByKarkunId($karkunId: String!) {
    karkunDutiesByKarkunId(karkunId: $karkunId) {
      _id
      dutyId
      dutyName
    }
  }
`;

const createKarkunDutyMutation = gql`
  mutation createKarkunDuty($karkunId: String!, $dutyId: String!) {
    createKarkunDuty(karkunId: $karkunId, dutyId: $dutyId) {
      _id
      dutyId
      dutyName
    }
  }
`;

const removeKarkunDutyMutation = gql`
  mutation removeKarkunDuty($_id: String!) {
    removeKarkunDuty(_id: $_id)
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { karkunId } };
    },
  }),
  graphql(createKarkunDutyMutation, {
    name: 'createKarkunDuty',
    options: {
      refetchQueries: ['karkunDutiesByKarkunId'],
    },
  }),
  graphql(removeKarkunDutyMutation, {
    name: 'removeKarkunDuty',
    options: {
      refetchQueries: [
        'pagedOutstationKarkuns',
        'karkunDutiesByKarkunId',
        'allMehfilDuties',
      ],
    },
  }),
  WithAllMehfilDuties()
)(DutyParticipation);
