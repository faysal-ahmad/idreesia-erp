import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Row, message } from '/imports/ui/controls';
import { PermissionSelection } from '/imports/ui/modules/helpers/controls';
import { portalPermissions } from '/imports/ui/modules/helpers/controls/access-management/portal-permissions';

import {
  PORTAL_USER_BY_ID,
  PAGED_PORTAL_USERS,
  SET_PORTAL_USER_PERMISSIONS,
} from '../gql';

class Permissions extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    portalId: PropTypes.string,
    userId: PropTypes.string,
    loading: PropTypes.bool,
    portalUserById: PropTypes.object,
    setPortalUserPermissions: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSave = e => {
    e.preventDefault();
    const { history, portalId, userId, setPortalUserPermissions } = this.props;
    const permissions = this.permissionSelection.getSelectedPermissions();

    setPortalUserPermissions({
      variables: {
        portalId,
        userId,
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
    const { portalUserById, loading } = this.props;
    if (loading) return null;

    return (
      <Fragment>
        <PermissionSelection
          ref={ps => {
            this.permissionSelection = ps;
          }}
          permissions={portalPermissions}
          securityEntity={portalUserById}
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

export default flowRight(
  graphql(SET_PORTAL_USER_PERMISSIONS, {
    name: 'setPortalUserPermissions',
    options: ({ portalId }) => ({
      refetchQueries: [
        { query: PAGED_PORTAL_USERS, variables: { portalId, filter: {} } },
      ],
    }),
  }),
  graphql(PORTAL_USER_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ portalId, userId }) => ({
      variables: { portalId, _id: userId },
    }),
  })
)(Permissions);
