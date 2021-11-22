/* eslint "no-script-url": "off" */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  Button,
  Divider,
  Table,
  Tooltip,
  Modal,
  Popconfirm,
  message,
} from 'antd';
import {
  WithAllMSDuties,
  WithAllDutyShifts,
  WithAllDutyLocations,
} from '/imports/ui/modules/hr/common/composers';

import DutyForm from './duty-form';
import {
  KARKUN_DUTIES_BY_KARKUN_ID,
  CREATE_KARKUN_DUTY,
  UPDATE_KARKUN_DUTY,
  REMOVE_KARKUN_DUTY,
} from '../gql';

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
            <EditOutlined
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
              <DeleteOutlined className="list-actions-icon" />
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
              icon={<PlusCircleOutlined />}
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

export default flowRight(
  graphql(KARKUN_DUTIES_BY_KARKUN_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { karkunId } };
    },
  }),
  graphql(CREATE_KARKUN_DUTY, {
    name: 'createKarkunDuty',
    options: {
      refetchQueries: ['karkunDutiesByKarkunId'],
    },
  }),
  graphql(UPDATE_KARKUN_DUTY, {
    name: 'updateKarkunDuty',
    options: {
      refetchQueries: ['karkunDutiesByKarkunId'],
    },
  }),
  graphql(REMOVE_KARKUN_DUTY, {
    name: 'removeKarkunDuty',
    options: {
      refetchQueries: [
        'pagedHrKarkuns',
        'karkunDutiesByKarkunId',
        'allMSDuties',
      ],
    },
  }),
  WithAllMSDuties(),
  WithAllDutyShifts(),
  WithAllDutyLocations()
)(DutyParticipation);
