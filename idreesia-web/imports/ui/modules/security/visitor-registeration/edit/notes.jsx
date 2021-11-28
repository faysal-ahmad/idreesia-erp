import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
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

    loading: PropTypes.bool,
    visitorId: PropTypes.string,
    securityVisitorById: PropTypes.object,
    updateSecurityVisitorNotes: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(`${paths.visitorRegistrationPath}`);
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ criminalRecord, otherNotes }) => {
    const {
      history,
      securityVisitorById,
      updateSecurityVisitorNotes,
    } = this.props;
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
  };

  render() {
    const { loading, securityVisitorById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextAreaField
          fieldName="criminalRecord"
          fieldLabel="Criminal Record"
          initialValue={securityVisitorById.criminalRecord}
          required={false}
        />

        <InputTextAreaField
          fieldName="otherNotes"
          fieldLabel="Other Notes"
          initialValue={securityVisitorById.otherNotes}
          required={false}
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
