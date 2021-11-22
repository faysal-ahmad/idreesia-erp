import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { PermissionSelection } from '/imports/ui/modules/helpers/controls';

import { USER_BY_ID, SET_PERMISSIONS } from '../gql';

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
          ref={ps => {
            this.permissionSelection = ps;
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
  graphql(SET_PERMISSIONS, {
    name: 'setPermissions',
    options: {
      refetchQueries: ['pagedUsers'],
    },
  }),
  graphql(USER_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ userId }) => ({ variables: { _id: userId } }),
  })
)(Permissions);
