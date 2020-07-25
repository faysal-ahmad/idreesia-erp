import React from 'react';
import PropTypes from 'prop-types';

import { Formats } from 'meteor/idreesia-common/constants';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import { ImdadRequestStatus } from 'meteor/idreesia-common/constants/imdad';
import { Collapse, Form, Icon, Tooltip } from '/imports/ui/controls';
import { SelectField } from '/imports/ui/modules/helpers/fields';

import {
  getCnicNumberFilterField,
  getUpdatedBetweenFilterField,
  getFormButtons,
} from '../field-helpers';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const ContainerStyle = {
  width: '500px',
};

const ListFilter = ({
  form,
  setPageParams,
  refreshData,

  cnicNumber,
  status,
  updatedBetween,
}) => {
  const handleSubmit = e => {
    e.preventDefault();
    const { validateFields } = form;
    validateFields((err, formValues) => {
      if (err) return;
      setPageParams({
        cnicNumber: formValues.cnicNumber,
        status: formValues.status,
        updatedBetween: JSON.stringify([
          formValues.updatedBetween[0]
            ? formValues.updatedBetween[0].format(Formats.DATE_FORMAT)
            : '',
          formValues.updatedBetween[1]
            ? formValues.updatedBetween[1].format(Formats.DATE_FORMAT)
            : '',
        ]),
        pageIndex: 0,
      });
    });
  };

  const handleReset = () => {
    setPageParams({
      cnicNumber: null,
      status: null,
      updatedBetween: JSON.stringify(['', '']),
      pageIndex: 0,
    });
  };

  const refreshButton = () => (
    <Tooltip title="Reload Data">
      <Icon
        type="sync"
        onClick={event => {
          event.stopPropagation();
          if (refreshData) refreshData();
        }}
      />
    </Tooltip>
  );

  const { getFieldDecorator } = form;
  const statusValues = values(ImdadRequestStatus);

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onSubmit={handleSubmit}>
          {getCnicNumberFilterField(cnicNumber, getFieldDecorator)}
          <SelectField
            fieldName="status"
            fieldLabel="Status"
            initialValue={status}
            data={statusValues}
            getDataValue={val => val}
            getDataText={val => val}
            fieldLayout={formItemLayout}
            getFieldDecorator={getFieldDecorator}
          />

          {getUpdatedBetweenFilterField(updatedBetween, getFieldDecorator)}
          {getFormButtons(handleReset, handleSubmit)}
        </Form>
      </Collapse.Panel>
    </Collapse>
  );
};

ListFilter.propTypes = {
  form: PropTypes.object,
  cnicNumber: PropTypes.string,
  status: PropTypes.string,
  updatedBetween: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default Form.create()(ListFilter);
