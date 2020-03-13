import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { SECURITY_VISITOR_BY_ID, UPDATE_SECURITY_VISITOR_NOTES } from '../gql';

class Notes extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    visitorId: PropTypes.string,
    securityVisitorById: PropTypes.object,
    updateSecurityVisitorNotes: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(`${paths.visitorRegistrationPath}`);
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      securityVisitorById,
      updateSecurityVisitorNotes,
    } = this.props;
    form.validateFields((err, { criminalRecord, otherNotes }) => {
      if (err) return;

      updateSecurityVisitorNotes({
        variables: {
          _id: securityVisitorById._id,
          criminalRecord,
          otherNotes,
        },
      })
        .then(() => {
          history.push(`${paths.visitorRegistrationPath}`);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { loading, securityVisitorById } = this.props;
    const { getFieldDecorator, isFieldsTouched } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextAreaField
          fieldName="criminalRecord"
          fieldLabel="Criminal Record"
          initialValue={securityVisitorById.criminalRecord}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="otherNotes"
          fieldLabel="Other Notes"
          initialValue={securityVisitorById.otherNotes}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  Form.create(),
  graphql(UPDATE_SECURITY_VISITOR_NOTES, {
    name: 'updateSecurityVisitorNotes',
    options: {
      refetchQueries: ['pagedSecurityVisitors'],
    },
  }),
  graphql(SECURITY_VISITOR_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { visitorId } = match.params;
      return { variables: { _id: visitorId } };
    },
  })
)(Notes);
