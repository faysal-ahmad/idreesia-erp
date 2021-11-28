import React from 'react';
import PropTypes from 'prop-types';
import { Collapse, Form } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import { ImdadRequestStatus } from 'meteor/idreesia-common/constants/imdad';
import { SelectField } from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

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
  setPageParams,
  refreshData,

  cnicNumber,
  status,
  updatedBetween,
}) => {
  const handleFinish = formValues => {
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
  };

  const handleReset = () => {
    setPageParams({
      cnicNumber: null,
      status: null,
      updatedBetween: JSON.stringify(['', '']),
      pageIndex: 0,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const statusValues = values(ImdadRequestStatus);

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onFinish={handleFinish}>
          {getCnicNumberFilterField(cnicNumber)}
          <SelectField
            fieldName="status"
            fieldLabel="Status"
            initialValue={status}
            data={statusValues}
            getDataValue={val => val}
            getDataText={val => val}
            fieldLayout={formItemLayout}
          />

          {getUpdatedBetweenFilterField(updatedBetween)}
          {getFormButtons(handleReset)}
        </Form>
      </Collapse.Panel>
    </Collapse>
  );
};

ListFilter.propTypes = {
  cnicNumber: PropTypes.string,
  status: PropTypes.string,
  updatedBetween: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
