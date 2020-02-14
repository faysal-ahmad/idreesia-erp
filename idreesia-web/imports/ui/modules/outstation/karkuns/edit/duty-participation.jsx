import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
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

import {
  CREATE_OUTSTATION_KARKUN_DUTY,
  REMOVE_OUTSTATION_KARKUN_DUTY,
  KARKUN_DUTIES_BY_KARKUN_ID,
} from '../gql';

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
    refetchKarkunDuties: PropTypes.func,
    allMehfilDuties: PropTypes.array,
    allMehfilDutiesLoading: PropTypes.bool,
    createOutstationKarkunDuty: PropTypes.func,
    removeOutstationKarkunDuty: PropTypes.func,
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
    const {
      karkunId,
      karkunDutiesByKarkunId,
      createOutstationKarkunDuty,
      refetchKarkunDuties,
    } = this.props;
    const dutyId = this.state.selectedDutyId;

    if (!dutyId) return;
    const existingDuty = find(
      karkunDutiesByKarkunId,
      karkunDuty => karkunDuty.dutyId === dutyId
    );
    if (existingDuty) return;

    createOutstationKarkunDuty({
      variables: {
        karkunId,
        dutyId,
      },
    })
      .then(() => {
        refetchKarkunDuties();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleDeleteClicked = record => {
    const { removeOutstationKarkunDuty, refetchKarkunDuties } = this.props;
    removeOutstationKarkunDuty({
      variables: {
        _id: record._id,
      },
    })
      .then(() => {
        refetchKarkunDuties();
      })
      .catch(error => {
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

export default flowRight(
  graphql(KARKUN_DUTIES_BY_KARKUN_ID, {
    props: ({ data }) => ({ refetchKarkunDuties: data.refetch, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { karkunId } };
    },
  }),
  graphql(CREATE_OUTSTATION_KARKUN_DUTY, {
    name: 'createOutstationKarkunDuty',
  }),
  graphql(REMOVE_OUTSTATION_KARKUN_DUTY, {
    name: 'removeOutstationKarkunDuty',
  }),
  WithAllMehfilDuties()
)(DutyParticipation);
