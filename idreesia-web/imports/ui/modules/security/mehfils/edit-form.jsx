import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';
import dayjs from 'dayjs';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

import { MEHFIL_BY_ID, UPDATE_MEHFIL, ALL_MEHFILS } from './gql';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    mehfilById: PropTypes.object,
    updateMehfil: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, mehfilDate }) => {
    const { history, mehfilById, updateMehfil } = this.props;
    updateMehfil({
      variables: {
        _id: mehfilById._id,
        name,
        mehfilDate,
      },
    })
      .catch(error => {
        message.error(error.message, 5);
      })
      .finally(() => {
        history.goBack();
      });
  };

  render() {
    const { loading, mehfilById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Mehfil Name"
            initialValue={mehfilById.name}
            required
            requiredMessage="Please input a name for the Mehfil."
          />
          <DateField
            fieldName="mehfilDate"
            fieldLabel="Mehfil Date"
            initialValue={dayjs(Number(mehfilById.mehfilDate))}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={mehfilById} />
      </>
    );
  }
}

export default flowRight(
  graphql(UPDATE_MEHFIL, {
    name: 'updateMehfil',
    options: {
      refetchQueries: [{ query: ALL_MEHFILS }],
    },
  }),
  graphql(MEHFIL_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { mehfilId } = match.params;
      return { variables: { _id: mehfilId } };
    },
  }),
  WithBreadcrumbs(['Security', 'Mehfils', 'Edit'])
)(EditForm);
