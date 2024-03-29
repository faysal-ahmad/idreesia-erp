import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { filter, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { WithAllCities } from '/imports/ui/modules/outstation/common/composers';

import { PAGED_CITIES, CREATE_CITY } from '../gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    allCitiesLoading: PropTypes.bool,
    allCities: PropTypes.array,
    createCity: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, peripheryOf, region, country }) => {
    const { createCity, history } = this.props;
    createCity({
      variables: {
        name,
        peripheryOf,
        region,
        country,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  getNonPeripheryCities = () => {
    const { allCities } = this.props;
    return filter(allCities, city => !city.peripheryOf);
  };

  render() {
    const { allCitiesLoading } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (allCitiesLoading) return null;
    const nonPeripheryCities = this.getNonPeripheryCities();

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="City Name"
          required
          requiredMessage="Please input a name for the city."
        />
        <SelectField
          data={nonPeripheryCities}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="peripheryOf"
          fieldLabel="Periphery Of"
        />
        <InputTextField
          fieldName="region"
          fieldLabel="Region"
        />
        <InputTextField
          fieldName="country"
          fieldLabel="Country"
          initialValue="Pakistan"
          required
          requiredMessage="Please input a name for the country."
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
  WithAllCities(),
  graphql(CREATE_CITY, {
    name: 'createCity',
    options: {
      refetchQueries: [{ query: PAGED_CITIES }],
    },
  }),
  WithBreadcrumbs(['Outstation', 'Cities & Mehfils', 'New'])
)(NewForm);
