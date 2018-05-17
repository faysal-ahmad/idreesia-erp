import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { merge } from 'react-komposer';
import { Button, Divider, Icon, Table, Modal } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import DutyForm from './duty-form';

class DutyParticipation extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    karkunId: PropTypes.string,
    karkunDutiesByKarkunId: PropTypes.array,
    allDuties: PropTypes.array,
    allDutyLocations: PropTypes.array,
    createKarkunDuty: PropTypes.func,
    updateKarkunDuty: PropTypes.func,
    removeKarkunDuty: PropTypes.func
  };

  state = {
    showNewForm: false,
    showEditForm: false,
    defaultValues: {}
  };

  newDutyForm;
  editDutyForm;

  columns = [
    {
      title: 'Duty Name',
      dataIndex: 'dutyName',
      key: 'dutyName',
      render: (text, record) => text
    },
    {
      title: 'Location Name',
      dataIndex: 'locationName',
      key: 'locationName'
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text, record) => {
        const startTime = moment(text);
        return startTime.isValid() ? startTime.format('h:mm a') : null;
      }
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text, record) => {
        const endTime = moment(text);
        return endTime.isValid() ? endTime.format('h:mm a') : null;
      }
    },
    {
      title: 'Days of Week',
      dataIndex: 'daysOfWeek',
      key: 'daysOfWeek',
      render: (textArray, record) => (textArray ? textArray.join() : null)
    },
    {
      key: 'action',
      render: (text, record) => (
        <span>
          <a href="javascript:;">
            <Icon
              type="edit"
              onClick={() => {
                this.handleEditClicked(record);
              }}
            />
          </a>
          <Divider type="vertical" />
          <a href="javascript:;">
            <Icon
              type="delete"
              onClick={() => {
                this.handleDeleteClicked(record);
              }}
            />
          </a>
        </span>
      )
    }
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
        _id: record._id
      }
    }).catch(error => {
      console.log(error);
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
    this.newDutyForm.validateFields(null, (errors, values) => {
      if (!errors) {
        this.setState({ showNewForm: false });
        createKarkunDuty({
          variables: {
            karkunId,
            dutyId: values.dutyId,
            locationId: values.locationId,
            startTime: values.startTime ? values.startTime.format() : null,
            endTime: values.endTime ? values.endTime.format() : null,
            startDate: values.startDate ? values.startDate.format() : null,
            endDate: values.endDate ? values.endDate.format() : null,
            daysOfWeek: values.weekDays
          }
        }).catch(error => {
          console.log(error);
        });
      }
    });
  };

  handleEditDutyFormSaved = () => {
    const { _id } = this.state.defaultValues;
    const { karkunId, updateKarkunDuty } = this.props;
    this.editDutyForm.validateFields(null, (errors, values) => {
      if (!errors) {
        this.setState({ showEditForm: false });
        updateKarkunDuty({
          variables: {
            _id,
            karkunId,
            dutyId: values.dutyId,
            locationId: values.locationId,
            startTime: values.startTime ? values.startTime.format() : null,
            endTime: values.endTime ? values.endTime.format() : null,
            startDate: values.startDate ? values.startDate.format() : null,
            endDate: values.endDate ? values.endDate.format() : null,
            daysOfWeek: values.weekDays
          }
        }).catch(error => {
          console.log(error);
        });
      }
    });
  };

  render() {
    const { showNewForm, showEditForm, defaultValues } = this.state;
    const { karkunId, karkunDutiesByKarkunId, allDuties, allDutyLocations } = this.props;

    return (
      <Fragment>
        <Table
          rowKey={'_id'}
          dataSource={karkunDutiesByKarkunId}
          columns={this.columns}
          bordered
          title={() => {
            return (
              <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
                New Duty
              </Button>
            );
          }}
        />

        <Modal
          visible={showNewForm}
          title="Add Duty"
          okText="Save"
          width={600}
          destroyOnClose={true}
          onOk={this.handleNewDutyFormSaved}
          onCancel={this.handleNewDutyFormCancelled}
        >
          <DutyForm
            ref={f => (this.newDutyForm = f)}
            defaultValues={defaultValues}
            allDuties={allDuties}
            allDutyLocations={allDutyLocations}
          />
        </Modal>

        <Modal
          visible={showEditForm}
          title="Edit Duty"
          okText="Save"
          width={600}
          destroyOnClose={true}
          onOk={this.handleEditDutyFormSaved}
          onCancel={this.handleEditDutyFormCancelled}
        >
          <DutyForm
            ref={f => (this.editDutyForm = f)}
            defaultValues={defaultValues}
            allDuties={allDuties}
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
      locationId
      locationName
      startTime
      endTime
      daysOfWeek
    }
  }
`;

const locationsListQuery = gql`
  query allDutyLocations {
    allDutyLocations {
      _id
      name
    }
  }
`;

const dutiesListQuery = gql`
  query allDuties {
    allDuties {
      _id
      name
    }
  }
`;

const createKarkunDutyMutation = gql`
  mutation createKarkunDuty(
    $karkunId: String!
    $dutyId: String!
    $locationId: String
    $startTime: String
    $endTime: String
    $startDate: String
    $endDate: String
    $daysOfWeek: [String]
  ) {
    createKarkunDuty(
      karkunId: $karkunId
      dutyId: $dutyId
      locationId: $locationId
      startTime: $startTime
      endTime: $endTime
      startDate: $startDate
      endDate: $endDate
      daysOfWeek: $daysOfWeek
    ) {
      _id
      dutyId
      dutyName
      locationId
      locationName
      startTime
      endTime
      daysOfWeek
    }
  }
`;

const updateKarkunDutyMutation = gql`
  mutation updateKarkunDuty(
    $_id: String!
    $karkunId: String!
    $dutyId: String!
    $locationId: String
    $startTime: String
    $endTime: String
    $startDate: String
    $endDate: String
    $daysOfWeek: [String]
  ) {
    updateKarkunDuty(
      _id: $_id
      karkunId: $karkunId
      dutyId: $dutyId
      locationId: $locationId
      startTime: $startTime
      endTime: $endTime
      startDate: $startDate
      endDate: $endDate
      daysOfWeek: $daysOfWeek
    ) {
      _id
      dutyId
      dutyName
      locationId
      locationName
      startTime
      endTime
      daysOfWeek
    }
  }
`;

const removeKarkunDutyMutation = gql`
  mutation removeKarkunDuty($_id: String!) {
    removeKarkunDuty(_id: $_id)
  }
`;

export default merge(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { karkunId } };
    }
  }),
  graphql(locationsListQuery, {
    props: ({ data }) => ({ ...data })
  }),
  graphql(dutiesListQuery, {
    props: ({ data }) => ({ ...data })
  }),
  graphql(createKarkunDutyMutation, {
    name: 'createKarkunDuty',
    options: {
      refetchQueries: ['karkunDutiesByKarkunId']
    }
  }),
  graphql(updateKarkunDutyMutation, {
    name: 'updateKarkunDuty',
    options: {
      refetchQueries: ['karkunDutiesByKarkunId']
    }
  }),
  graphql(removeKarkunDutyMutation, {
    name: 'removeKarkunDuty',
    options: {
      refetchQueries: ['karkunDutiesByKarkunId']
    }
  })
)(DutyParticipation);
