import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  Button,
  Icon,
  Modal,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';

import {
  CITY_MEHFILS_BY_CITY_ID,
  CREATE_CITY_MEHFIL,
  UPDATE_CITY_MEHFIL,
  REMOVE_CITY_MEHFIL,
} from '../gql';
import { default as MehfilNewForm } from './mehfil-new-form';
import { default as MehfilEditForm } from './mehfil-edit-form';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    cityId: PropTypes.string,
    cityMehfilsByCityId: PropTypes.array,
    createCityMehfil: PropTypes.func,
    updateCityMehfil: PropTypes.func,
    removeCityMehfil: PropTypes.func,
  };

  state = {
    showNewForm: false,
    showEditForm: false,
    cityMehfil: null,
  };

  columns = [
    {
      title: 'Mehfil Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      key: 'action',
      render: (text, record) => (
        <div className="list-actions-column">
          <Tooltip title="Edit">
            <Icon
              className="list-actions-icon"
              type="edit"
              onClick={() => {
                this.handleEditClicked(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Icon
              className="list-actions-icon"
              type="delete"
              onClick={() => {
                this.handleDeleteClicked(record);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  handleNewClicked = () => {
    this.setState({
      showNewForm: true,
    });
  };

  handleNewMehfilSave = ({ name, address }) => {
    const { createCityMehfil, cityId } = this.props;
    this.setState({
      showNewForm: false,
    });

    createCityMehfil({
      variables: {
        name,
        cityId,
        address,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleNewMehfilCancel = () => {
    this.setState({
      showNewForm: false,
    });
  };

  handleEditClicked = cityMehfil => {
    this.setState({
      showEditForm: true,
      cityMehfil,
    });
  };

  handleEditMehfilSave = ({ _id, cityId, name, address }) => {
    const { updateCityMehfil } = this.props;
    this.setState({
      showEditForm: false,
      dutyShift: null,
    });

    updateCityMehfil({
      variables: {
        _id,
        cityId,
        name,
        address,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleEditMehfilCancel = () => {
    this.setState({
      showEditForm: false,
      dutyShift: null,
    });
  };

  handleDeleteClicked = record => {
    const { removeCityMehfil } = this.props;
    removeCityMehfil({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { cityMehfilsByCityId } = this.props;
    const { cityMehfil, showNewForm, showEditForm } = this.state;

    return (
      <>
        <Table
          rowKey="_id"
          dataSource={cityMehfilsByCityId}
          columns={this.columns}
          pagination={false}
          bordered
          title={() => (
            <Button
              type="primary"
              icon="plus-circle-o"
              onClick={this.handleNewClicked}
            >
              New Mehfil
            </Button>
          )}
        />
        <Modal
          title="New Mehfil"
          visible={showNewForm}
          onCancel={this.handleNewMehfilCancel}
          width={600}
          footer={null}
        >
          {showNewForm ? (
            <MehfilNewForm
              handleSave={this.handleNewMehfilSave}
              handleCancel={this.handleNewMehfilCancel}
            />
          ) : null}
        </Modal>
        <Modal
          title="Edit Mehfil"
          visible={showEditForm}
          onCancel={this.handleEditMehfilCancel}
          width={600}
          footer={null}
        >
          {showEditForm ? (
            <MehfilEditForm
              cityMehfil={cityMehfil}
              handleSave={this.handleEditMehfilSave}
              handleCancel={this.handleEditMehfilCancel}
            />
          ) : null}
        </Modal>
      </>
    );
  }
}

export default flowRight(
  graphql(CITY_MEHFILS_BY_CITY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ cityId }) => ({ variables: { cityId } }),
  }),
  graphql(CREATE_CITY_MEHFIL, {
    name: 'createCityMehfil',
    options: {
      refetchQueries: ['cityMehfilsByCityId'],
    },
  }),
  graphql(UPDATE_CITY_MEHFIL, {
    name: 'updateCityMehfil',
    options: {
      refetchQueries: ['cityMehfilsByCityId'],
    },
  }),
  graphql(REMOVE_CITY_MEHFIL, {
    name: 'removeCityMehfil',
    options: {
      refetchQueries: ['cityMehfilsByCityId'],
    },
  })
)(List);
