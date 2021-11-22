import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { graphql } from 'react-apollo';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Modal,
  Table,
  Tooltip,
  message,
} from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';

import {
  DUTY_SHIFTS_BY_DUTY_ID,
  CREATE_DUTY_SHIFT,
  UPDATE_DUTY_SHIFT,
  REMOVE_DUTY_SHIFT,
} from '../gql';
import { default as ShiftNewForm } from './shift-new-form';
import { default as ShiftEditForm } from './shift-edit-form';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    dutyId: PropTypes.string,
    dutyShiftsByDutyId: PropTypes.array,
    createDutyShift: PropTypes.func,
    updateDutyShift: PropTypes.func,
    removeDutyShift: PropTypes.func,
  };

  state = {
    showNewForm: false,
    showEditForm: false,
    dutyShift: null,
  };

  columns = [
    {
      title: 'Shift Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: text => {
        const startTime = moment(text);
        return startTime.isValid() ? startTime.format('h:mm a') : null;
      },
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: text => {
        const endTime = moment(text);
        return endTime.isValid() ? endTime.format('h:mm a') : null;
      },
    },
    {
      key: 'action',
      render: (text, record) => {
        let deleteAction = null;
        if (record.canDelete) {
          deleteAction = (
            <Tooltip title="Delete">
              <DeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  this.handleDeleteClicked(record);
                }}
              />
            </Tooltip>
          );
        }

        return (
          <div className="list-actions-column">
            <Tooltip title="Edit">
              <EditOutlined
                className="list-actions-icon"
                onClick={() => {
                  this.handleEditClicked(record);
                }}
              />
            </Tooltip>
            {deleteAction}
          </div>
        );
      },
    },
  ];

  handleNewClicked = () => {
    this.setState({
      showNewForm: true,
    });
  };

  handleNewShiftSave = ({ name, startTime, endTime, attendanceSheet }) => {
    const { createDutyShift, dutyId } = this.props;
    this.setState({
      showNewForm: false,
    });

    createDutyShift({
      variables: {
        name,
        dutyId,
        startTime,
        endTime,
        attendanceSheet,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleNewShiftCancel = () => {
    this.setState({
      showNewForm: false,
    });
  };

  handleEditClicked = dutyShift => {
    this.setState({
      showEditForm: true,
      dutyShift,
    });
  };

  handleEditShiftSave = ({
    _id,
    dutyId,
    name,
    startTime,
    endTime,
    attendanceSheet,
  }) => {
    const { updateDutyShift } = this.props;
    this.setState({
      showEditForm: false,
      dutyShift: null,
    });

    updateDutyShift({
      variables: {
        _id,
        dutyId,
        name,
        startTime,
        endTime,
        attendanceSheet,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleEditShiftCancel = () => {
    this.setState({
      showEditForm: false,
      dutyShift: null,
    });
  };

  handleDeleteClicked = record => {
    const { removeDutyShift } = this.props;
    removeDutyShift({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { dutyShiftsByDutyId } = this.props;
    const { dutyShift, showNewForm, showEditForm } = this.state;

    return (
      <>
        <Table
          rowKey="_id"
          dataSource={dutyShiftsByDutyId}
          columns={this.columns}
          pagination={false}
          bordered
          title={() => (
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={this.handleNewClicked}
            >
              New Duty Shift
            </Button>
          )}
        />
        <Modal
          title="New Shift"
          visible={showNewForm}
          onCancel={this.handleNewShiftCancel}
          width={600}
          footer={null}
        >
          {showNewForm ? (
            <ShiftNewForm
              handleSave={this.handleNewShiftSave}
              handleCancel={this.handleNewShiftCancel}
            />
          ) : null}
        </Modal>
        <Modal
          title="Edit Shift"
          visible={showEditForm}
          onCancel={this.handleEditShiftCancel}
          width={600}
          footer={null}
        >
          {showEditForm ? (
            <ShiftEditForm
              dutyShift={dutyShift}
              handleSave={this.handleEditShiftSave}
              handleCancel={this.handleEditShiftCancel}
            />
          ) : null}
        </Modal>
      </>
    );
  }
}

export default flowRight(
  graphql(DUTY_SHIFTS_BY_DUTY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ dutyId }) => ({ variables: { dutyId } }),
  }),
  graphql(CREATE_DUTY_SHIFT, {
    name: 'createDutyShift',
    options: {
      refetchQueries: ['dutyShiftsByDutyId'],
    },
  }),
  graphql(UPDATE_DUTY_SHIFT, {
    name: 'updateDutyShift',
    options: {
      refetchQueries: ['dutyShiftsByDutyId'],
    },
  }),
  graphql(REMOVE_DUTY_SHIFT, {
    name: 'removeDutyShift',
    options: {
      refetchQueries: ['dutyShiftsByDutyId'],
    },
  })
)(List);
