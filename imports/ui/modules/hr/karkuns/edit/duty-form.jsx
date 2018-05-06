import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Row, Col } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import {
  SelectField,
  TimeField,
  DateField,
  FormButtonsSaveCancel
} from '/imports/ui/modules/helpers/fields';

class DutyForm extends Component {
  static propTypes = {
    karkunId: PropTypes.string,
    allDuties: PropTypes.array,
    allDutyLocations: PropTypes.array
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { allDuties, allDutyLocations } = this.props;

    return (
      <Form layout="horizontal">
        <SelectField
          data={allDuties}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="dutyId"
          fieldLabel="Duty Name"
          required={true}
          requiredMessage="Please select a duty from the list."
          getFieldDecorator={getFieldDecorator}
        />

        <SelectField
          data={allDutyLocations}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="locationId"
          fieldLabel="Location Name"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <TimeField
          fieldName="startTime"
          fieldLabel="Start Time"
          required={true}
          requiredMessage="Please input start time for the duty."
          getFieldDecorator={getFieldDecorator}
        />

        <TimeField
          fieldName="endTime"
          fieldLabel="End Time"
          required={true}
          requiredMessage="Please input end time for the duty."
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="startDate"
          fieldLabel="Start Date"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="endDate"
          fieldLabel="End Date"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />
      </Form>
    );
  }
}

export default Form.create()(DutyForm);
