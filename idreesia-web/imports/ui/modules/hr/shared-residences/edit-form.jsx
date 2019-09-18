import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { WithBreadcrumbs } from '/imports/ui/composers';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    sharedResidenceById: PropTypes.object,
    updateSharedResidence: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      sharedResidenceById,
      updateSharedResidence,
    } = this.props;
    form.validateFields((err, { address, ownerKarkun }) => {
      if (err) return;

      updateSharedResidence({
        variables: {
          id: sharedResidenceById._id,
          address,
          ownerKarkunId: ownerKarkun ? ownerKarkun._id : null,
        },
      })
        .then(() => {
          history.goBack();
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { loading, sharedResidenceById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="address"
            fieldLabel="Address"
            required
            requiredMessage="Please input address for the residence."
            initialValue={sharedResidenceById.address}
            getFieldDecorator={getFieldDecorator}
          />
          <KarkunField
            fieldName="ownerKarkun"
            fieldLabel="Owned By"
            placeholder="Owned By"
            initialValue={sharedResidenceById.owner}
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={sharedResidenceById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query sharedResidenceById($_id: String!) {
    sharedResidenceById(_id: $_id) {
      _id
      address
      owner {
        _id
        name
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateSharedResidence(
    $_id: String!
    $address: String!
    $ownerKarkunId: String
  ) {
    updateSharedResidence(
      _id: $_id
      address: $address
      ownerKarkunId: $ownerKarkunId
    ) {
      _id
      address
      ownerKarkunId
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'updateSharedResidence',
    options: {
      refetchQueries: ['allSharedResidences'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { sharedResidenceId } = match.params;
      return { variables: { _id: sharedResidenceId } };
    },
  }),
  WithBreadcrumbs(['Security', 'Shared Residences', 'Edit'])
)(EditForm);
