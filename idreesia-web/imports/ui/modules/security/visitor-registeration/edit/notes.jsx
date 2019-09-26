import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { Form, message } from "/imports/ui/controls";
import {
  InputTextAreaField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";
import { SecuritySubModulePaths as paths } from "/imports/ui/modules/security";

class Notes extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    visitorId: PropTypes.string,
    visitorById: PropTypes.object,
    updateNotes: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(`${paths.visitorRegistrationPath}`);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, visitorById, updateNotes } = this.props;
    form.validateFields((err, { criminalRecord, otherNotes }) => {
      if (err) return;

      updateNotes({
        variables: {
          _id: visitorById._id,
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
    });
  };

  render() {
    const { loading, visitorById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextAreaField
          fieldName="criminalRecord"
          fieldLabel="Criminal Record"
          initialValue={visitorById.criminalRecord}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="otherNotes"
          fieldLabel="Other Notes"
          initialValue={visitorById.otherNotes}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query visitorById($_id: String!) {
    visitorById(_id: $_id) {
      _id
      criminalRecord
      otherNotes
    }
  }
`;

const formMutation = gql`
  mutation updateNotes(
    $_id: String!
    $criminalRecord: String
    $otherNotes: String
  ) {
    updateNotes(
      _id: $_id
      criminalRecord: $criminalRecord
      otherNotes: $otherNotes
    ) {
      _id
      criminalRecord
      otherNotes
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: "updateNotes",
    options: {
      refetchQueries: ["pagedVisitors"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { visitorId } = match.params;
      return { variables: { _id: visitorId } };
    },
  })
)(Notes);
