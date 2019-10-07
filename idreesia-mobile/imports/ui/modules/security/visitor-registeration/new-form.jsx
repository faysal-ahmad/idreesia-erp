import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { createForm, formShape } from 'rc-form';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  InputItemField,
  EhadDurationField,
  PictureField,
  FormButtonsSaveCancel,
  List,
  Toast,
  WhiteSpace,
} from '/imports/ui/controls';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    form: formShape,
    createVisitor: PropTypes.func,
  };

  getEhadDateFromDuration = duration => {
    const currentDate = moment();
    const ehadDate = moment();
    ehadDate.year(currentDate.year() - duration[0]);
    ehadDate.month(currentDate.month() - duration[1]);
    return ehadDate;
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSave = () => {
    const { createVisitor, form } = this.props;
    form.validateFields(
      (
        error,
        {
          name,
          parentName,
          cnicNumber,
          ehadDate,
          referenceName,
          contactNumber1,
          city,
          country,
          imageData,
        }
      ) => {
        if (error) return;
        createVisitor({
          variables: {
            name,
            parentName,
            isMinor: false,
            cnicNumber: `${cnicNumber.slice(0, 5)}-${cnicNumber.slice(
              5,
              12
            )}-${cnicNumber.slice(12)}`,
            ehadDate: this.getEhadDateFromDuration(ehadDate),
            referenceName,
            contactNumber1: `${contactNumber1.slice(
              0,
              4
            )}-${contactNumber1.slice(4)}`,
            city,
            country,
            imageData,
          },
        })
          .then(() => {
            form.resetFields();
            Toast.info('Visitor information was saved.', 1);
          })
          .catch(() => {
            Toast.fail('Visitor information was not saved.', 1);
          });
      }
    );
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldError },
    } = this.props;

    return (
      <List>
        <InputItemField
          fieldName="name"
          placeholder="Name"
          getFieldError={getFieldError}
          getFieldDecorator={getFieldDecorator}
          required
        />
        <InputItemField
          fieldName="parentName"
          placeholder="Father's Name"
          getFieldError={getFieldError}
          getFieldDecorator={getFieldDecorator}
          required
        />
        <InputItemField
          fieldName="cnicNumber"
          placeholder="CNIC"
          getFieldError={getFieldError}
          getFieldDecorator={getFieldDecorator}
          type="number"
          maxLength={13}
          required
        />
        <InputItemField
          fieldName="contactNumber1"
          placeholder="Mobile No."
          getFieldError={getFieldError}
          getFieldDecorator={getFieldDecorator}
          type="number"
        />
        <InputItemField
          fieldName="city"
          placeholder="City"
          getFieldError={getFieldError}
          getFieldDecorator={getFieldDecorator}
          required
        />
        <InputItemField
          fieldName="country"
          placeholder="Country"
          initialValue="Pakistan"
          getFieldError={getFieldError}
          getFieldDecorator={getFieldDecorator}
          required
        />
        <EhadDurationField
          fieldName="ehadDate"
          getFieldDecorator={getFieldDecorator}
        />
        <InputItemField
          fieldName="referenceName"
          placeholder="Reference Of"
          getFieldError={getFieldError}
          getFieldDecorator={getFieldDecorator}
          required
        />
        <PictureField
          fieldName="imageData"
          getFieldDecorator={getFieldDecorator}
        />
        <WhiteSpace size="lg" />
        <FormButtonsSaveCancel
          handleSave={this.handleSave}
          handleCancel={this.handleCancel}
        />
      </List>
    );
  }
}

const formMutation = gql`
  mutation createVisitor(
    $name: String!
    $parentName: String!
    $isMinor: Boolean!
    $cnicNumber: String!
    $ehadDate: String!
    $referenceName: String!
    $contactNumber1: String
    $contactNumber2: String
    $address: String
    $city: String
    $country: String
    $imageData: String
  ) {
    createVisitor(
      name: $name
      parentName: $parentName
      isMinor: $isMinor
      cnicNumber: $cnicNumber
      ehadDate: $ehadDate
      referenceName: $referenceName
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      address: $address
      city: $city
      country: $country
      imageData: $imageData
    ) {
      _id
      name
      parentName
      isMinor
      cnicNumber
      ehadDate
      referenceName
      contactNumber1
      contactNumber2
      address
      city
      country
    }
  }
`;

export default flowRight(
  createForm(),
  graphql(formMutation, {
    name: 'createVisitor',
    options: {
      refetchQueries: ['pagedVisitors'],
    },
  })
)(NewForm);
