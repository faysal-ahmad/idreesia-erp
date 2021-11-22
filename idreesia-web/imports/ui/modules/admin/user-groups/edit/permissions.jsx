import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { PermissionSelection } from '/imports/ui/modules/helpers/controls';

class Permissions extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    groupId: PropTypes.string,
    loading: PropTypes.bool,
    userGroupById: PropTypes.object,
    setUserGroupPermissions: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSave = e => {
    e.preventDefault();
    const { history, userGroupById, setUserGroupPermissions } = this.props;
    const permissions = this.permissionSelection.getSelectedPermissions();

    setUserGroupPermissions({
      variables: {
        _id: userGroupById._id,
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
    const { userGroupById, loading } = this.props;
    if (loading) return null;

    return (
      <Fragment>
        <PermissionSelection
          securityEntity={userGroupById}
          ref={is => {
            this.permissionSelection = is;
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

const formQuery = gql`
  query userGroupById($_id: String!) {
    userGroupById(_id: $_id) {
      _id
      permissions
    }
  }
`;

const formMutation = gql`
  mutation setUserGroupPermissions($_id: String!, $permissions: [String]!) {
    setUserGroupPermissions(_id: $_id, permissions: $permissions) {
      _id
      permissions
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'setUserGroupPermissions',
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ groupId }) => ({ variables: { _id: groupId } }),
  })
)(Permissions);
