import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Row, message } from '/imports/ui/controls';
import { PermissionSelection } from '/imports/ui/modules/helpers/controls';

class Permissions extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    userId: PropTypes.string,
    userById: PropTypes.object,
    setPermissions: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSave = e => {
    e.preventDefault();
    const { history, userById, setPermissions } = this.props;
    const permissions = this.permissionSelection.getSelectedPermissions();

    setPermissions({
      variables: {
        userId: userById._id,
        permissions,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { userById, loading } = this.props;
    if (loading) return null;

    return (
      <Fragment>
        <PermissionSelection
          securityEntity={userById}
          ref={is => {
            this.permissionSelection = is;
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

const formQuery = gql`
  query userById($_id: String!) {
    userById(_id: $_id) {
      _id
      permissions
    }
  }
`;

const formMutation = gql`
  mutation setPermissions($userId: String!, $permissions: [String]!) {
    setPermissions(userId: $userId, permissions: $permissions) {
      _id
      permissions
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'setPermissions',
    options: {
      refetchQueries: ['allKarkunsWithAccounts'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ userId }) => ({ variables: { _id: userId } }),
  })
)(Permissions);
