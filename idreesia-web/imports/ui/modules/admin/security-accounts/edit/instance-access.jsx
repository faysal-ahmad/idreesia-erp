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

    userId: PropTypes.string,
    loading: PropTypes.bool,
    userById: PropTypes.object,
    setInstanceAccess: PropTypes.func,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { karkunById } = nextProps;
    if (karkunById && !prevState.initDone) {
      return {
        initDone: true,
        checkedKeys: karkunById.user.instances,
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
    const { userById, loading } = this.props;
    if (loading) return null;

    return (
      <Fragment>
        <InstanceSelection
          securityEntity={userById}
          ref={is => {
            this.instanceSelection = is;
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

const formMutation = gql`
  mutation setInstanceAccess($userId: String!, $instances: [String]!) {
    setInstanceAccess(userId: $userId, instances: $instances) {
      _id
      instances
    }
  }
`;

const formQuery = gql`
  query userById($_id: String!) {
    userById(_id: $_id) {
      _id
      instances
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'setInstanceAccess',
    options: {
      refetchQueries: ['pagedUser'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ userId }) => ({ variables: { _id: userId } }),
  })
)(InstanceAccess);
