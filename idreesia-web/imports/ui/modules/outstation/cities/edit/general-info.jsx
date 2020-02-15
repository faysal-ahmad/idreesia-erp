import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

import { ALL_CITIES, PAGED_CITIES, CITY_BY_ID, UPDATE_CITY } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    cityById: PropTypes.object,
    updateCity: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, cityById, updateCity } = this.props;
    form.validateFields((err, { name, country, region }) => {
      if (err) return;

      updateCity({
        variables: {
          _id: cityById._id,
          name,
          country,
          region,
        },
      })
        .then(() => {
          history.goBack();
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { loading, cityById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="City Name"
            initialValue={cityById.name}
            required
            requiredMessage="Please input a name for the city."
            getFieldDecorator={getFieldDecorator}
          />
          <InputTextField
            fieldName="region"
            fieldLabel="Region"
            initialValue={cityById.region}
            getFieldDecorator={getFieldDecorator}
          />
          <InputTextField
            fieldName="country"
            fieldLabel="Country"
            initialValue={cityById.country}
            required
            requiredMessage="Please input a name for the country."
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={cityById} />
      </Fragment>
    );
  }
}

export default flowRight(
  Form.create(),
  graphql(UPDATE_CITY, {
    name: 'updateCity',
    options: {
      refetchQueries: [{ query: PAGED_CITIES }, { query: ALL_CITIES }],
    },
  }),
  graphql(CITY_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ cityId }) => ({ variables: { _id: cityId } }),
  })
)(GeneralInfo);
