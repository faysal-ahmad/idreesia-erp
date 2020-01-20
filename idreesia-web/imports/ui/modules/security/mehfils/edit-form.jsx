import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
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
          id: mehfilById._id,
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
    const { getFieldDecorator } = this.props.form;
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
          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={mehfilById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query mehfilById($id: String!) {
    mehfilById(id: $id) {
      _id
      name
      mehfilDate
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateMehfil($id: String!, $name: String!, $mehfilDate: String!) {
    updateMehfil(id: $id, name: $name, mehfilDate: $mehfilDate) {
      _id
      name
      mehfilDate
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
    name: 'updateMehfil',
    options: {
      refetchQueries: ['allMehfils'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { mehfilId } = match.params;
      return { variables: { id: mehfilId } };
    },
  }),
  WithBreadcrumbs(['Security', 'Mehfils', 'Edit'])
)(EditForm);
