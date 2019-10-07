import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { createForm, formShape } from 'rc-form';
import { useMutation } from '@apollo/react-hooks';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { CREATE_VISITOR } from 'meteor/idreesia-common/graphql/security';
import {
  InputItemField,
  EhadDurationField,
  PictureField,
  FormButtonsSaveCancel,
  List,
  Toast,
  WhiteSpace,
} from '/imports/ui/controls';

const NewForm = ({
  history,
  form: { getFieldDecorator, getFieldError, resetFields, validateFields },
}) => {
  const [createVisitor] = useMutation(CREATE_VISITOR);

  const getEhadDateFromDuration = duration => {
    const currentDate = moment();
    const ehadDate = moment();
    ehadDate.year(currentDate.year() - duration[0]);
    ehadDate.month(currentDate.month() - duration[1]);
    return ehadDate;
  };

  const handleCancel = () => {
    history.goBack();
  };

  const handleSave = () => {
    validateFields(
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
            ehadDate: getEhadDateFromDuration(ehadDate),
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
            resetFields();
            Toast.info('Visitor information was saved.', 2);
          })
          .catch(() => {
            Toast.fail('Visitor information was not saved.', 2);
          });
      }
    );
  };

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
        handleSave={handleSave}
        handleCancel={handleCancel}
      />
    </List>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  form: formShape,
};

export default flowRight(
  createForm(),
  WithBreadcrumbs(['Security', 'New Visitor Registration'])
)(NewForm);
