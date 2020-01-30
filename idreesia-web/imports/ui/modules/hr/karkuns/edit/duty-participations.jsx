/* eslint "no-script-url": "off" */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  Button,
  Divider,
  Icon,
  Table,
  Tooltip,
  Modal,
  Popconfirm,
  message,
} from '/imports/ui/controls';
import {
  WithAllMSDuties,
  WithAllDutyShifts,
  WithAllDutyLocations,
} from '/imports/ui/modules/hr/common/composers';
import DutyForm from './duty-form';

class DutyParticipation extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    karkunId: PropTypes.string,
    karkunDutiesByKarkunId: PropTypes.array,
    allMSDuties: PropTypes.array,
    allDutyShifts: PropTypes.array,
    allDutyLocations: PropTypes.array,
    createKarkunDuty: PropTypes.func,
    updateKarkunDuty: PropTypes.func,
    removeKarkunDuty: PropTypes.func,
  };

  state = {
    showNewForm: false,
    showEditForm: false,
    defaultValues: {},
  };

  newDutyForm;
  editDutyForm;

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
      title: 'Shift Name',
      dataIndex: 'shiftName',
      key: 'shiftName',
    },
    {
      title: 'Location Name',
      dataIndex: 'locationName',
      key: 'locationName',
    },
    {
      title: 'Days of Week',
      dataIndex: 'daysOfWeek',
      key: 'daysOfWeek',
      render: textArray => (textArray ? textArray.join() : null),
    },
    {
      key: 'action',
      render: (text, record) => (
        <span>
          <Tooltip title="Edit">
            <Icon
              type="edit"
              className="list-actions-icon"
              onClick={() => {
                this.handleEditClicked(record);
              }}
            />
          </Tooltip>
          <Divider type="vertical" />
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

  handleNewClicked = () => {
    this.setState({ showNewForm: true });
  };

  handleEditClicked = record => {
    this.setState({ showEditForm: true, defaultValues: record });
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

  handleNewDutyFormCancelled = () => {
    this.setState({ showNewForm: false });
  };

  handleEditDutyFormCancelled = () => {
    this.setState({ showEditForm: false });
  };

  handleNewDutyFormSaved = () => {
    const { karkunId, createKarkunDuty } = this.props;
    this.newDutyForm.validateFields(
      null,
      (errors, { dutyIdShiftId, locationId, role, weekDays }) => {
        if (!errors) {
          this.setState({ showNewForm: false });
          createKarkunDuty({
            variables: {
              karkunId,
              dutyId: dutyIdShiftId[0],
              shiftId: dutyIdShiftId[1],
              locationId,
              role,
              daysOfWeek: weekDays,
            },
          }).catch(error => {
            message.error(error.message, 5);
          });
        }
      }
    );
  };

  handleEditDutyFormSaved = () => {
    const { _id } = this.state.defaultValues;
    const { karkunId, updateKarkunDuty } = this.props;
    this.editDutyForm.validateFields(
      null,
      (errors, { dutyIdShiftId, locationId, role, weekDays }) => {
        if (!errors) {
          this.setState({ showEditForm: false });
          updateKarkunDuty({
            variables: {
              _id,
              karkunId,
              dutyId: dutyIdShiftId[0],
              shiftId: dutyIdShiftId[1],
              locationId,
              role,
              daysOfWeek: weekDays,
            },
          }).catch(error => {
            message.error(error.message, 5);
          });
        }
      }
    );
  };

  render() {
    const { showNewForm, showEditForm, defaultValues } = this.state;
    const {
      karkunDutiesByKarkunId,
      allMSDuties,
      allDutyShifts,
      allDutyLocations,
    } = this.props;

    return (
      <Fragment>
        <Table
          rowKey="_id"
          dataSource={karkunDutiesByKarkunId}
          columns={this.columns}
          bordered
          title={() => (
            <Button
              type="primary"
              icon="plus-circle-o"
              onClick={this.handleNewClicked}
            >
              New Duty
            </Button>
          )}
        />

        <Modal
          visible={showNewForm}
          title="Add Duty"
          okText="Save"
          width={600}
          destroyOnClose
          onOk={this.handleNewDutyFormSaved}
          onCancel={this.handleNewDutyFormCancelled}
        >
          <DutyForm
            ref={f => {
              this.newDutyForm = f;
            }}
            defaultValues={defaultValues}
            allMSDuties={allMSDuties}
            allDutyShifts={allDutyShifts}
            allDutyLocations={allDutyLocations}
          />
        </Modal>

        <Modal
          visible={showEditForm}
          title="Edit Duty"
          okText="Save"
          width={600}
          destroyOnClose
          onOk={this.handleEditDutyFormSaved}
          onCancel={this.handleEditDutyFormCancelled}
        >
          <DutyForm
            ref={f => {
              this.editDutyForm = f;
            }}
            defaultValues={defaultValues}
            allMSDuties={allMSDuties}
            allDutyShifts={allDutyShifts}
            allDutyLocations={allDutyLocations}
          />
        </Modal>
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
      shiftId
      shiftName
      locationName
      role
      daysOfWeek
    }
  }
`;

const createKarkunDutyMutation = gql`
  mutation createKarkunDuty(
    $karkunId: String!
    $dutyId: String!
    $shiftId: String
    $locationId: String
    $role: String
    $daysOfWeek: [String]
  ) {
    createKarkunDuty(
      karkunId: $karkunId
      dutyId: $dutyId
      shiftId: $shiftId
      locationId: $locationId
      role: $role
      daysOfWeek: $daysOfWeek
    ) {
      _id
      dutyId
      dutyName
      shiftId
      shiftName
      locationId
      locationName
      role
      daysOfWeek
    }
  }
`;

const updateKarkunDutyMutation = gql`
  mutation updateKarkunDuty(
    $_id: String!
    $karkunId: String!
    $dutyId: String!
    $shiftId: String
    $locationId: String
    $role: String
    $daysOfWeek: [String]
  ) {
    updateKarkunDuty(
      _id: $_id
      karkunId: $karkunId
      dutyId: $dutyId
      shiftId: $shiftId
      locationId: $locationId
      role: $role
      daysOfWeek: $daysOfWeek
    ) {
      _id
      dutyId
      dutyName
      shiftId
      shiftName
      locationId
      locationName
      role
      daysOfWeek
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
  graphql(updateKarkunDutyMutation, {
    name: 'updateKarkunDuty',
    options: {
      refetchQueries: ['karkunDutiesByKarkunId'],
    },
  }),
  graphql(removeKarkunDutyMutation, {
    name: 'removeKarkunDuty',
    options: {
      refetchQueries: ['pagedKarkuns', 'karkunDutiesByKarkunId', 'allMSDuties'],
    },
  }),
  WithAllMSDuties(),
  WithAllDutyShifts(),
  WithAllDutyLocations()
)(DutyParticipation);
