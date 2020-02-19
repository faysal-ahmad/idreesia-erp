import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import {
  DateField,
  FormButtonsSubmit,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    visitorId: PropTypes.string,
    handleAddItem: PropTypes.func,
    createVisitorMulakaat: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      visitorId,
      handleAddItem,
      createVisitorMulakaat,
    } = this.props;
    form.validateFields((err, { mulakaatDate }) => {
      if (err) return;

      createVisitorMulakaat({
        variables: {
          visitorId,
          mulakaatDate,
        },
      })
        .then(({ data: { createVisitorMulakaat: newVisitorMulakaat } }) => {
          if (handleAddItem) handleAddItem(newVisitorMulakaat);
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
      <Form layout="inline" onSubmit={this.handleSubmit}>
        <DateField
          fieldName="mulakaatDate"
          fieldLabel="Mulakaat Date"
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSubmit text="Add Mulakaat" />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createVisitorMulakaat($visitorId: String!, $mulakaatDate: String!) {
    createVisitorMulakaat(visitorId: $visitorId, mulakaatDate: $mulakaatDate) {
      _id
      visitorId
      mulakaatDate
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'createVisitorMulakaat',
    options: {
      refetchQueries: ['pagedVisitorMulakaat'],
    },
  })
)(NewForm);
