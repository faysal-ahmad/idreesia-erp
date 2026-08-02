import React, { type CSSProperties } from 'react';
import { Button, Collapse, Form, Row } from 'antd';

import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';

import {
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

interface PageParams { pageIndex: string; name?: string; cnicNumber?: string; phoneNumber?: string; city?: string; }
interface Props {
  setPageParams(params: PageParams): void;
  refreshData?: () => Promise<unknown>;
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
}

const ContainerStyle: CSSProperties = {
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
  name = '',
  cnicNumber = '',
  phoneNumber = '',
  city = '',
}: Props) => {
  const [form] = Form.useForm();
  const { distinctCities, distinctCitiesLoading } = useDistinctCities();

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

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  if (distinctCitiesLoading) return null;

  return (
    <Collapse
      style={ContainerStyle}
      items={[
        {
          key: '1',
          label: 'Filter',
          extra: refreshButton(),
          children: (
            <Form form={form} layout="horizontal" onFinish={handleFinish}>
              <InputTextField
                fieldName="name"
                fieldLabel="Name"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={name}
              />
              <InputCnicField
                fieldName="cnicNumber"
                fieldLabel="CNIC Number"
                required={false}
                requiredMessage="Please input a valid CNIC number."
                fieldLayout={formItemLayout}
                initialValue={cnicNumber}
              />
              <InputMobileField
                fieldName="phoneNumber"
                fieldLabel="Phone Number"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={phoneNumber}
              />
              <SelectField
                data={(distinctCities ?? []) as any}
                getDataValue={((cityName: string) => cityName) as any}
                getDataText={((cityName: string) => cityName) as any}
                initialValue={city}
                fieldName="city"
                fieldLabel="City"
                fieldLayout={formItemLayout}
              />
              <Form.Item {...buttonItemLayout}>
                <Row justify="end">
                  <Button type="default" onClick={handleReset}>
                    Reset
                  </Button>
                  &nbsp;
                  <Button type="primary" htmlType="submit">
                    Search
                  </Button>
                </Row>
              </Form.Item>
            </Form>
          ),
        },
      ]}
    />
  );
};

export default ListFilter;
