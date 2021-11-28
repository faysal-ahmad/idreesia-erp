import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
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

    loading: PropTypes.bool,
    dutyById: PropTypes.object,
    updateOustationMehfilDuty: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFinish = ({ name, description }) => {
    const { history, dutyById, updateOustationMehfilDuty } = this.props;
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
  };

  render() {
    const { loading, dutyById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Duty Name"
            initialValue={dutyById.name}
            required
            requiredMessage="Please input a name for the duty."
          />
          <InputTextAreaField
            fieldName="description"
            fieldLabel="Description"
            initialValue={dutyById.description}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={dutyById} />
      </>
    );
  }
}

export default flowRight(
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
