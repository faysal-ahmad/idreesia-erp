import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { merge } from 'react-komposer';
import { Button, Table, Modal } from 'antd';
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
    createKarkunDuty: PropTypes.func
  };

  state = {
    showForm: false
  };

  dutyForm;

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
    }
  ];

  handleNewClicked = () => {
    this.setState({ showForm: true });
  };

  handleNewDutyFormCancelled = () => {
    this.setState({ showForm: false });
  };

  handleNewDutyFormSaved = () => {
    const { karkunId, createKarkunDuty } = this.props;
    this.dutyForm.validateFields(null, (errors, values) => {
      if (!errors) {
        this.setState({ showForm: false });
        debugger;
        createKarkunDuty({
          variables: {
            karkunId,
            dutyId: values.dutyId,
            locationId: values.locationId,
            startTime: values.startTime.format(),
            endTime: values.endTime.format(),
            startDate: values.startDate.format(),
            endDate: values.endDate.format()
          }
        }).catch(error => {
          console.log(error);
        });
      }
    });
  };

  render() {
    const { showForm } = this.state;
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
          visible={showForm}
          title="Add Duty"
          okText="Save"
          width={600}
          destroyOnClose={true}
          onOk={this.handleNewDutyFormSaved}
          onCancel={this.handleNewDutyFormCancelled}
        >
          <DutyForm
            ref={f => (this.dutyForm = f)}
            karkunId={karkunId}
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
      dutyName
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

const formMutation = gql`
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
      dutyName
      locationName
      startTime
      endTime
      daysOfWeek
    }
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
  graphql(formMutation, {
    name: 'createKarkunDuty',
    options: {
      refetchQueries: ['karkunDutiesByKarkunId']
    }
  })
)(DutyParticipation);
