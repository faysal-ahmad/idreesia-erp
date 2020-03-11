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
import { WazaifManagementSubModulePaths as paths } from '/imports/ui/modules/wazaif-management';

import { UPDATE_WAZEEFA, WAZEEFA_BY_ID } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    wazeefaId: PropTypes.string,
    wazeefaById: PropTypes.object,
    updateWazeefa: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.wazaifPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, wazeefaId, updateWazeefa } = this.props;
    form.validateFields((err, { name, revisionNumber, revisionDate }) => {
      if (err) return;

      updateWazeefa({
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
      form: { getFieldDecorator },
      formDataLoading,
      wazeefaById,
    } = this.props;
    if (formDataLoading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the wazeefa."
          initialValue={wazeefaById.name}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="revisionNumber"
          fieldLabel="Revision Number"
          initialValue={wazeefaById.revisionNumber}
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="revisionDate"
          fieldLabel="Revision Date"
          initialValue={
            wazeefaById.revisionDate
              ? moment(Number(wazeefaById.revisionDate))
              : null
          }
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

export default flowRight(
  Form.create(),
  graphql(UPDATE_WAZEEFA, {
    name: 'updateWazeefa',
    options: {
      refetchQueries: ['pagedWazaif'],
    },
  }),
  graphql(WAZEEFA_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ wazeefaId }) => ({ variables: { _id: wazeefaId } }),
  })
)(GeneralInfo);
