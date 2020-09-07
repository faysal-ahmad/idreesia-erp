import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

import { DUTY_BY_ID, UPDATE_OUTSTATION_MEHFIL_DUTY } from './gql';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    dutyById: PropTypes.object,
    updateOustationMehfilDuty: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, dutyById, updateOustationMehfilDuty } = this.props;
    form.validateFields((err, { name, description }) => {
      if (err) return;

      updateOustationMehfilDuty({
        variables: {
          _id: dutyById._id,
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
    const { loading, dutyById } = this.props;
    const { getFieldDecorator, isFieldsTouched } = this.props.form;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Duty Name"
            initialValue={dutyById.name}
            required
            requiredMessage="Please input a name for the duty."
            getFieldDecorator={getFieldDecorator}
          />
          <InputTextAreaField
            fieldName="description"
            fieldLabel="Description"
            initialValue={dutyById.description}
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={dutyById} />
      </Fragment>
    );
  }
}

export default flowRight(
  Form.create(),
  WithQueryParams(),
  graphql(UPDATE_OUTSTATION_MEHFIL_DUTY, {
    name: 'updateOustationMehfilDuty',
    options: {
      refetchQueries: ['allMehfilDuties'],
    },
  }),
  graphql(DUTY_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { dutyId } = match.params;
      return { variables: { id: dutyId } };
    },
  }),
  WithBreadcrumbs(['Outstations', 'Mehfil Duties', 'Edit'])
)(EditForm);
