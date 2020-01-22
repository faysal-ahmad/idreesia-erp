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

    groupId: PropTypes.string,
    loading: PropTypes.bool,
    securityGroupById: PropTypes.object,
    setSecurityGroupPermissions: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSave = e => {
    e.preventDefault();
    const {
      history,
      securityGroupById,
      setSecurityGroupPermissions,
    } = this.props;
    const permissions = this.permissionSelection.getSelectedPermissions();

    setSecurityGroupPermissions({
      variables: {
        _id: securityGroupById._id,
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
    const { securityGroupById, loading } = this.props;
    if (loading) return null;

    return (
      <Fragment>
        <PermissionSelection
          securityEntity={securityGroupById}
          ref={is => {
            this.permissionSelection = is;
          }}
        />
        <br />
        <br />
        <Row type="flex" justify="start">
          <Button type="default" onClick={this.handleCancel}>
            Cancel
          </Button>
          &nbsp;
          <Button type="primary" onClick={this.handleSave}>
            Save
          </Button>
        </Row>
      </Fragment>
    );
  }
}

const formQuery = gql`
  query securityGroupById($_id: String!) {
    securityGroupById(_id: $_id) {
      _id
      permissions
    }
  }
`;

const formMutation = gql`
  mutation setSecurityGroupPermissions($_id: String!, $permissions: [String]!) {
    setSecurityGroupPermissions(_id: $_id, permissions: $permissions) {
      _id
      permissions
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'setSecurityGroupPermissions',
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ groupId }) => ({ variables: { _id: groupId } }),
  })
)(Permissions);
