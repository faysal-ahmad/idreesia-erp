import React from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import { WithDistinctCities } from 'meteor/idreesia-common/composers/security';

import {
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

const AntButton = Button as any;
const AntCollapse = Collapse as any;
const AntForm = Form as any;
const AntFormItem = (Form as any).Item;
const AntRow = Row as any;
const TextField = InputTextField as any;
const CnicField = InputCnicField as any;
const MobileField = InputMobileField as any;
const SelectInputField = SelectField as any;
const RefreshControl = RefreshButton as any;
interface PageParams { pageIndex: string; name?: string; cnicNumber?: string; phoneNumber?: string; city?: string; }
interface Props { setPageParams(params: PageParams): void; refreshData?: () => void; name?: string; cnicNumber?: string; phoneNumber?: string; city?: string; distinctCitiesLoading?: boolean; distinctCities?: string[]; }

const ContainerStyle = {
  width: '500px',
};

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

const ListFilter = ({
  setPageParams,
  refreshData,
  name,
  cnicNumber,
  phoneNumber,
  city,
  distinctCities,
}: Props) => {
  const [form] = AntForm.useForm();

  const handleReset = () => {
    form.resetFields();
    setPageParams({
      pageIndex: '0',
      name: '',
      cnicNumber: '',
      phoneNumber: '',
      city: '',
    });
  };

  const handleFinish = (values: Partial<PageParams>) => {
    setPageParams({
      pageIndex: '0',
      name: values.name,
      cnicNumber: values.cnicNumber,
      phoneNumber: values.phoneNumber,
      city: values.city,
    });
  };

  const refreshButton = () => <RefreshControl refreshData={refreshData} />;

  return (
    <AntCollapse
      style={ContainerStyle as any}
      items={[
        {
          key: '1',
          label: 'Filter',
          extra: refreshButton(),
          children: (
            <AntForm form={form} layout="horizontal" onFinish={handleFinish}>
              <TextField
                fieldName="name"
                fieldLabel="Name"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={name}
              />
              <CnicField
                fieldName="cnicNumber"
                fieldLabel="CNIC Number"
                required={false}
                requiredMessage="Please input a valid CNIC number."
                fieldLayout={formItemLayout}
                initialValue={cnicNumber}
              />
              <MobileField
                fieldName="phoneNumber"
                fieldLabel="Phone Number"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={phoneNumber}
              />
              <SelectInputField
                data={distinctCities}
                getDataValue={(cityName: string) => cityName}
                getDataText={(cityName: string) => cityName}
                initialValue={city}
                fieldName="city"
                fieldLabel="City"
                fieldLayout={formItemLayout}
              />
              <AntFormItem {...buttonItemLayout}>
                <AntRow type="flex" justify="end">
                  <AntButton type="default" onClick={handleReset}>
                    Reset
                  </AntButton>
                  &nbsp;
                  <AntButton type="primary" htmlType="submit">
                    Search
                  </AntButton>
                </AntRow>
              </AntFormItem>
            </AntForm>
          ),
        },
      ]}
    />
  );
};

ListFilter.propTypes = {
  name: PropTypes.string,
  cnicNumber: PropTypes.string,
  phoneNumber: PropTypes.string,
  city: PropTypes.string,
  ehadDuration: PropTypes.string,
  updatedBetween: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,

  distinctCitiesLoading: PropTypes.bool,
  distinctCities: PropTypes.array,
};

ListFilter.defaultProps = {
  name: '',
  cnicNumber: '',
  phoneNumber: '',
  city: '',
  distinctCities: [],
};

export default WithDistinctCities()(ListFilter as any);
