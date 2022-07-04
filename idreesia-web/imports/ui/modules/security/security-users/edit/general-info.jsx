import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  InputTextField,
  SwitchField,
  FormButtonsClose,
} from '/imports/ui/modules/helpers/fields';

import { USER_BY_ID } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    userId: PropTypes.string,
    userById: PropTypes.object,
  };

  handleClose = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const { loading, userById } = this.props;
    if (loading) return null;

    return (
      <Form layout="horizontal">
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          disabled
          initialValue={userById.username}
        />

        <SwitchField
          fieldName="locked"
          fieldLabel="Locked"
          initialValue={userById.locked}
        />

        <InputTextField
          fieldName="password"
          fieldLabel="Password"
          type="password"
        />

        <InputTextField
          fieldName="email"
          fieldLabel="Google Email"
          initialValue={userById.email}
        />

        <InputTextField
          fieldName="displayName"
          fieldLabel="Display Name"
          initialValue={userById.displayName}
        />

        <InputTextField
          fieldName="personName"
          fieldLabel="Person Name"
          disabled
          initialValue={userById.person ? userById.person.sharedData.name : ''}
        />

        <FormButtonsClose
          handleClose={this.handleClose}
        />
      </Form>
    );
  }
}

export default flowRight(
  graphql(USER_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ userId }) => ({ variables: { _id: userId } }),
  })
)(GeneralInfo);
