import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Button,
  Flex,
  InputItem,
  List,
  Picker,
  Toast,
  WingBlank,
  WhiteSpace,
} from 'antd-mobile';
import { createForm, formShape } from 'rc-form';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

class NewForm extends Component {
  static propTypes = {
    form: formShape,
    createVisitor: PropTypes.func,
  };

  state = {
    imageData: null,
  };

  getDurationDataOptions = () => {
    const yearOptions = [];
    for (let i = 0; i <= 40; i++) {
      yearOptions.push({
        label: i === 1 ? `${i} Year` : `${i} Years`,
        value: i,
      });
    }

    const monthOptions = [];
    for (let i = 0; i <= 11; i++) {
      monthOptions.push({
        label: i === 1 ? `${i} Month` : `${i} Months`,
        value: i,
      });
    }

    return [yearOptions, monthOptions];
  };

  getEhadDateFromDuration(duration) {
    const currentDate = moment();
    const ehadDate = moment();
    ehadDate.year(currentDate.year() - duration[0]);
    ehadDate.month(currentDate.month() - duration[1]);
    return ehadDate;
  }

  handleSubmit = () => {
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
        }
      ) => {
        if (error) return;
        createVisitor({
          variables: {
            name,
            parentName,
            isMinor: false,
            cnicNumber,
            ehadDate: this.getEhadDateFromDuration(ehadDate),
            referenceName,
            contactNumber1,
            city,
            country,
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

  takePicture = () => {
    const cameraOptions = {
      width: 300,
      quality: 100,
      allowEdit: false,
      targetWidth: 300,
      targetHeight: 300,
      destinationType: window.navigator.camera.DestinationType.DATA_URL,
    };

    navigator.camera.getPicture(this.onSuccess, this.onFail, cameraOptions);
  };

  onSuccess = imageData => {
    this.setState({ imageData });
  };

  onFail = () => {
    Toast.fail('Failed to take picture.', 1);
  };

  render() {
    const { imageData } = this.state;
    const {
      form: { getFieldProps, getFieldError },
    } = this.props;
    const errors = getFieldError('required');

    const image = imageData ? (
      <Flex justify="center" style={{ width: '100%' }}>
        <img src={`data:image/jpeg;base64,${imageData}`} />
      </Flex>
    ) : null;

    return (
      <List>
        <InputItem
          {...getFieldProps('name', {
            rules: [{ required: true }],
          })}
          placeholder="Name"
        />
        <InputItem
          {...getFieldProps('parentName', {
            rules: [{ required: true }],
          })}
          placeholder="Father's Name"
        />
        <InputItem
          {...getFieldProps('cnicNumber', {
            rules: [{ required: true }],
          })}
          placeholder="CNIC"
          type="number"
          maxLength={13}
        />
        <InputItem
          {...getFieldProps('contactNumber1')}
          placeholder="Mobile No."
          type="number"
          maxLength={11}
        />
        <InputItem
          {...getFieldProps('city', {
            rules: [{ required: true }],
          })}
          placeholder="City"
        />
        <InputItem
          {...getFieldProps('country', {
            rules: [{ required: true }],
            initialValue: 'Pakistan',
          })}
          placeholder="Country"
        />
        <Picker
          {...getFieldProps('ehadDate', {
            rules: [{ required: true }],
            initialValue: [0, 0],
          })}
          data={this.getDurationDataOptions()}
          cascade={false}
          okText="OK"
          dismissText="Cancel"
        >
          <List.Item arrow="horizontal">Ehad Duration</List.Item>
        </Picker>
        <InputItem
          {...getFieldProps('referenceName', {
            rules: [{ required: true }],
          })}
          placeholder="Reference Of"
        />
        {errors ? errors.join(',') : null}
        <WhiteSpace size="lg" />
        <Flex direction="row" justify="center">
          <Button
            type="primary"
            style={{ width: '40%' }}
            onClick={this.takePicture}
          >
            Take Picture
          </Button>
          <WingBlank />
          <Button
            type="primary"
            style={{ width: '40%' }}
            onClick={this.handleSubmit}
          >
            Submit
          </Button>
        </Flex>

        <WhiteSpace size="lg" />
        {image}
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
