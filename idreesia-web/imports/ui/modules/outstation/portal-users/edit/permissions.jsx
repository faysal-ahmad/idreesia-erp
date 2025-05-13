import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { PermissionSelection } from '/imports/ui/modules/helpers/controls';
import { portalPermissions } from '/imports/ui/modules/helpers/controls/access-management/portal-permissions';

import {
  OUTSTATION_PORTAL_USER_BY_ID,
  PAGED_OUTSTATION_PORTAL_USERS,
  SET_OUTSTATION_PORTAL_USER_PERMISSIONS,
} from '../gql';

class Permissions extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    userId: PropTypes.string,
    loading: PropTypes.bool,
    outstationPortalUserById: PropTypes.object,
    setOutstationPortalUserPermissions: PropTypes.func,
  };

  state = {
    permissionsChanged: false,
    selectedPermissions: null,
  };

  handlePermissionSelectionChange = updatedPermissions => {
    this.setState({
      permissionsChanged: true,
      selectedPermissions: updatedPermissions,
    })
  }

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSave = e => {
    e.preventDefault();
    const { history, userId, setOutstationPortalUserPermissions } = this.props;
    setOutstationPortalUserPermissions({
      variables: {
        userId,
        permissions: this.state.selectedPermissions,
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
    const { outstationPortalUserById, loading } = this.props;
    if (loading) return null;

    return (
      <Fragment>
        <PermissionSelection
          permissions={portalPermissions}
          securityEntity={outstationPortalUserById}
          onChange={this.handlePermissionSelectionChange}
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
  graphql(SET_OUTSTATION_PORTAL_USER_PERMISSIONS, {
    name: 'setOutstationPortalUserPermissions',
    options: () => ({
      refetchQueries: [
        {
          query: PAGED_OUTSTATION_PORTAL_USERS,
          variables: { filter: {} },
        },
      ],
    }),
  }),
  graphql(OUTSTATION_PORTAL_USER_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ userId }) => ({
      variables: { _id: userId },
    }),
  })
)(Permissions);
