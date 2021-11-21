import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { filter, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';
import { WithAllCities } from '/imports/ui/modules/outstation/common/composers';

import { PAGED_CITIES, CITY_BY_ID, UPDATE_CITY } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    allCitiesLoading: PropTypes.bool,
    allCities: PropTypes.array,
    cityByIdLoading: PropTypes.bool,
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
    form.validateFields((err, { name, peripheryOf, country, region }) => {
      if (err) return;

      updateCity({
        variables: {
          _id: cityById._id,
          name,
          peripheryOf,
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

  getNonPeripheryCities = () => {
    const { allCities } = this.props;
    return filter(allCities, city => !city.peripheryOf);
  };

  render() {
    const { cityByIdLoading, allCitiesLoading, cityById } = this.props;
    const { isFieldsTouched } = this.props.form;
    if (cityByIdLoading || allCitiesLoading) return null;
    const nonPeripheryCities = this.getNonPeripheryCities();

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="City Name"
            initialValue={cityById.name}
            required
            requiredMessage="Please input a name for the city."
          />
          <SelectField
            data={nonPeripheryCities}
            getDataValue={({ _id }) => _id}
            getDataText={({ name }) => name}
            fieldName="peripheryOf"
            fieldLabel="Periphery Of"
            initialValue={cityById.peripheryOf}
          />
          <InputTextField
            fieldName="region"
            fieldLabel="Region"
            initialValue={cityById.region}
          />
          <InputTextField
            fieldName="country"
            fieldLabel="Country"
            initialValue={cityById.country}
            required
            requiredMessage="Please input a name for the country."
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={cityById} />
      </Fragment>
    );
  }
}

export default flowRight(
  Form.create(),
  WithAllCities(),
  graphql(UPDATE_CITY, {
    name: 'updateCity',
    options: {
      refetchQueries: [{ query: PAGED_CITIES }],
    },
  }),
  graphql(CITY_BY_ID, {
    props: ({ data }) => ({ cityByIdLoading: data.loading, ...data }),
    options: ({ cityId }) => ({ variables: { _id: cityId } }),
  })
)(GeneralInfo);
