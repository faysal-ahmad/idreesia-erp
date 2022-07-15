import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  InputNumberField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import { SET_OPERATIONS_WAZEEFA_DETAILS, OPERATIONS_WAZEEFA_BY_ID } from '../gql';

class Specifications extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    formDataLoading: PropTypes.bool,
    wazeefaId: PropTypes.string,
    operationsWazeefaById: PropTypes.object,
    setOperationsWazeefaDetails: PropTypes.func,
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

  handleFinish = ({ packetCount, subCartonCount, cartonCount }) => {
    const { history, wazeefaId, setOperationsWazeefaDetails } = this.props;
    setOperationsWazeefaDetails({
      variables: {
        _id: wazeefaId,
        packetCount,
        subCartonCount,
        cartonCount,
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
        <InputNumberField
          fieldName="packetCount"
          fieldLabel="Packet Count"
          initialValue={operationsWazeefaById?.wazeefaDetail?.packetCount}
        />

        <InputNumberField
          fieldName="subCartonCount"
          fieldLabel="Sub-carton Count"
          initialValue={operationsWazeefaById?.wazeefaDetail?.subCartonCount}
        />

        <InputNumberField
          fieldName="cartonCount"
          fieldLabel="Carton Count"
          initialValue={operationsWazeefaById?.wazeefaDetail?.cartonCount}
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
  graphql(SET_OPERATIONS_WAZEEFA_DETAILS, {
    name: 'setOperationsWazeefaDetails',
    options: {
      refetchQueries: ['pagedOperationsWazaif'],
    },
  }),
  graphql(OPERATIONS_WAZEEFA_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ wazeefaId }) => ({ variables: { _id: wazeefaId } }),
  })
)(Specifications);
