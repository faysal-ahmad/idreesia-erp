import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithAllPhysicalStores } from 'meteor/idreesia-common/composers/admin';

import { InstanceSelection } from '/imports/ui/modules/helpers/controls';

import { USER_BY_ID, SET_INSTANCE_ACCESS } from '../gql';

class InstanceAccess extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    userId: PropTypes.string,
    userLoading: PropTypes.bool,
    userById: PropTypes.object,
    allPhysicalStoresLoading: PropTypes.bool,
    allPhysicalStores: PropTypes.array,
    setInstanceAccess: PropTypes.func,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { userById } = nextProps;
    if (userById && !prevState.initDone) {
      return {
        initDone: true,
        checkedKeys: userById.instances,
      };
    }

    return null;
  }

  state = {
    initDone: false,
    expandedKeys: [],
    checkedKeys: [],
  };

  handleSave = e => {
    e.preventDefault();
    const { history, userById, setInstanceAccess } = this.props;
    const instances = this.instanceSelection.getSelectedInstances();

    setInstanceAccess({
      variables: {
        userId: userById._id,
        instances,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const {
      userById,
      userLoading,
      allPhysicalStoresLoading,
      allPhysicalStores,
    } = this.props;
    if (userLoading || allPhysicalStoresLoading) {
      return null;
    }

    return (
      <Fragment>
        <InstanceSelection
          securityEntity={userById}
          allPhysicalStores={allPhysicalStores}
          ref={is => {
            this.instanceSelection = is;
          }}
        />
        <br />
        <br />
        <Row type="flex" justify="start">
          <Button
            size="large"
            icon={<CloseCircleOutlined />}
            type="default"
            onClick={this.handleCancel}
          >
            Cancel
          </Button>
          &nbsp;
          <Button
            size="large"
            icon={<SaveOutlined />}
            type="primary"
            onClick={this.handleSave}
          >
            Save
          </Button>
        </Row>
      </Fragment>
    );
  }
}

export default flowRight(
  WithAllPhysicalStores(),
  graphql(SET_INSTANCE_ACCESS, {
    name: 'setInstanceAccess',
    options: {
      refetchQueries: ['pagedUser'],
    },
  }),
  graphql(USER_BY_ID, {
    props: ({ data }) => ({ userLoading: data.loading, ...data }),
    options: ({ userId }) => ({ variables: { _id: userId } }),
  })
)(InstanceAccess);
