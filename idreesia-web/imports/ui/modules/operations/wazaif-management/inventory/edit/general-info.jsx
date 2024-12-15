import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import dayjs from 'dayjs';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
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

    formDataLoading: PropTypes.bool,
    wazeefaId: PropTypes.string,
    operationsWazeefaById: PropTypes.object,
    updateOperationsWazeefa: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.wazaifInventoryPath);
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, revisionNumber, revisionDate }) => {
    const { history, wazeefaId, updateOperationsWazeefa } = this.props;
    updateOperationsWazeefa({
      variables: {
        _id: wazeefaId,
        name,
        revisionNumber,
        revisionDate,
      },
    })
      .then(() => {
        history.push(paths.wazaifInventoryPath);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { formDataLoading, operationsWazeefaById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (formDataLoading) return null;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the wazeefa."
          initialValue={operationsWazeefaById.name}
        />

        <InputNumberField
          fieldName="revisionNumber"
          fieldLabel="Revision Number"
          initialValue={operationsWazeefaById.revisionNumber}
        />

        <DateField
          fieldName="revisionDate"
          fieldLabel="Revision Date"
          initialValue={
            operationsWazeefaById.revisionDate
              ? dayjs(Number(operationsWazeefaById.revisionDate))
              : null
          }
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
