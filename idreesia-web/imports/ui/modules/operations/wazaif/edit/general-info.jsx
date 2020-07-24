import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  InputNumberField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import { UPDATE_OPERATIONS_WAZEEFA, OPERATIONS_WAZEEFA_BY_ID } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    wazeefaId: PropTypes.string,
    operationsWazeefaById: PropTypes.object,
    updateOperationsWazeefa: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.wazaifPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, wazeefaId, updateOperationsWazeefa } = this.props;
    form.validateFields((err, { name, revisionNumber, revisionDate }) => {
      if (err) return;

      updateOperationsWazeefa({
        variables: {
          _id: wazeefaId,
          name,
          revisionNumber,
          revisionDate,
        },
      })
        .then(() => {
          history.push(paths.wazaifPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const {
      form: { getFieldDecorator, isFieldsTouched },
      formDataLoading,
      operationsWazeefaById,
    } = this.props;
    if (formDataLoading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the wazeefa."
          initialValue={operationsWazeefaById.name}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="revisionNumber"
          fieldLabel="Revision Number"
          initialValue={operationsWazeefaById.revisionNumber}
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="revisionDate"
          fieldLabel="Revision Date"
          initialValue={
            operationsWazeefaById.revisionDate
              ? moment(Number(operationsWazeefaById.revisionDate))
              : null
          }
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
  graphql(UPDATE_OPERATIONS_WAZEEFA, {
    name: 'updateOperationsWazeefa',
    options: {
      refetchQueries: ['pagedOperationsWazaif'],
    },
  }),
  graphql(OPERATIONS_WAZEEFA_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ wazeefaId }) => ({ variables: { _id: wazeefaId } }),
  })
)(GeneralInfo);
