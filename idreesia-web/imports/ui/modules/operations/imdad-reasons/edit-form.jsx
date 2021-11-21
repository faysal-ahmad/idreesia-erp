import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

import {
  IMDAD_REASON_BY_ID,
  UPDATE_IMDAD_REASON,
  ALL_IMDAD_REASONS,
} from './gql';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    imdadReasonById: PropTypes.object,
    updateImdadReason: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, imdadReasonById, updateImdadReason } = this.props;
    form.validateFields((err, { name, description }) => {
      if (err) return;

      updateImdadReason({
        variables: {
          id: imdadReasonById._id,
          name,
          description,
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
    const { loading, imdadReasonById } = this.props;
    const { isFieldsTouched } = this.props.form;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Imdad Reason"
            initialValue={imdadReasonById.name}
            required
            requiredMessage="Please input a name for the imdad reason."
          />
          <InputTextAreaField
            disabled
            fieldName="description"
            fieldLabel="Description"
            initialValue={imdadReasonById.description}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={imdadReasonById} />
      </Fragment>
    );
  }
}

export default flowRight(
  Form.create(),
  graphql(UPDATE_IMDAD_REASON, {
    name: 'updateImdadReason',
    options: {
      refetchQueries: [{ query: ALL_IMDAD_REASONS }],
    },
  }),
  graphql(IMDAD_REASON_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { imdadReasonId } = match.params;
      return { variables: { id: imdadReasonId } };
    },
  }),
  WithBreadcrumbs(['Accounts', 'Imdad Reasons', 'Edit'])
)(EditForm);
