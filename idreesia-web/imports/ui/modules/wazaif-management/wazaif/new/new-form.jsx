import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { WazaifManagementSubModulePaths as paths } from '/imports/ui/modules/wazaif-management';
import {
  InputTextField,
  InputNumberField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_WAZEEFA } from '../gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createWazeefa: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, createWazeefa } = this.props;
    form.validateFields((err, { name, revisionNumber, revisionDate }) => {
      if (err) return;

      createWazeefa({
        variables: {
          name,
          revisionNumber,
          revisionDate,
        },
      })
        .then(({ data: { createWazeefa: newWazeefa } }) => {
          history.push(`${paths.wazaifEditFormPath(newWazeefa._id)}`);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the wazeefa."
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="revisionNumber"
          fieldLabel="Revision Number"
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="revisionDate"
          fieldLabel="Revision Date"
          initialValue={null}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

export default flowRight(
  Form.create(),
  graphql(CREATE_WAZEEFA, {
    name: 'createWazeefa',
    options: {
      refetchQueries: ['pagedWazaif'],
    },
  }),
  WithBreadcrumbs(['Wazaif Management', 'Wazaif', 'New'])
)(NewForm);
