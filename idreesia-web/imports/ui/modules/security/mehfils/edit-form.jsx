import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

import { MEHFIL_BY_ID, UPDATE_MEHFIL, ALL_MEHFILS } from './gql';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    mehfilById: PropTypes.object,
    updateMehfil: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, mehfilById, updateMehfil } = this.props;
    form.validateFields((err, { name, mehfilDate }) => {
      if (err) return;

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
    });
  };

  render() {
    const { loading, mehfilById } = this.props;
    const { getFieldDecorator, isFieldsTouched } = this.props.form;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Mehfil Name"
            initialValue={mehfilById.name}
            required
            requiredMessage="Please input a name for the Mehfil."
            getFieldDecorator={getFieldDecorator}
          />
          <DateField
            fieldName="mehfilDate"
            fieldLabel="Mehfil Date"
            initialValue={moment(Number(mehfilById.mehfilDate))}
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <RecordInfo record={mehfilById} />
      </Fragment>
    );
  }
}

export default flowRight(
  Form.create(),
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
