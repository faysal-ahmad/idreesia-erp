import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { Button, Row, message } from '/imports/ui/controls';
import { InstanceSelection } from '/imports/ui/modules/helpers/controls';

class InstanceAccess extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    groupId: PropTypes.string,
    loading: PropTypes.bool,
    userGroupById: PropTypes.object,
    setUserGroupInstanceAccess: PropTypes.func,
  };

  handleSave = e => {
    e.preventDefault();
    const { history, userGroupById, setUserGroupInstanceAccess } = this.props;
    const instances = this.instanceSelection.getSelectedInstances();
    setUserGroupInstanceAccess({
      variables: {
        _id: userGroupById._id,
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
    const { userGroupById, loading } = this.props;
    if (loading) return null;

    return (
      <Fragment>
        <InstanceSelection
          securityEntity={userGroupById}
          ref={is => {
            this.instanceSelection = is;
          }}
        />
        <br />
        <br />
        <Row type="flex" justify="start">
          <Button
            size="large"
            icon="close-circle"
            type="default"
            onClick={this.handleCancel}
          >
            Cancel
          </Button>
          &nbsp;
          <Button
            size="large"
            icon="save"
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

const formMutation = gql`
  mutation setUserGroupInstanceAccess($_id: String!, $instances: [String]!) {
    setUserGroupInstanceAccess(_id: $_id, instances: $instances) {
      _id
      instances
    }
  }
`;

const formQuery = gql`
  query userGroupById($_id: String!) {
    userGroupById(_id: $_id) {
      _id
      instances
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'setUserGroupInstanceAccess',
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ groupId }) => ({ variables: { _id: groupId } }),
  })
)(InstanceAccess);
