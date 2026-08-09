import React, { type CSSProperties } from 'react';
import { Button, Collapse, Form, Row } from 'antd';

import { filter } from 'meteor/idreesia-common/utilities/lodash';

import {
  AutoCompleteField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

interface City {
  _id: string;
  name?: string | null;
  peripheryOf?: string | null;
}

export interface CityListPageParams {
  pageIndex?: number;
  pageSize?: number;
  peripheryOf?: string | null;
  region?: string | null;
}

interface FormValues {
  peripheryOf?: string | null;
  region?: string | null;
}

interface Props {
  allCities?: City[];
  distinctRegions?: string[];
  peripheryOf?: string | null;
  region?: string | null;
  setPageParams(params: CityListPageParams): void;
  refreshData?: () => Promise<unknown>;
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

const ListFilter = (props: Props) => {
  const [form] = Form.useForm();
  const { refreshData, region, allCities, distinctRegions } = props;

  const handleReset = () => {
    const { setPageParams } = props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      peripheryOf: null,
      region: null,
    });
  };

  const handleFinish = ({ peripheryOf, region: regionValue }: FormValues) => {
    const { setPageParams } = props;
    setPageParams({
      pageIndex: 0,
      peripheryOf,
      region: regionValue,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const nonPeripheryCities = filter(allCities ?? [], (city: City) => !city.peripheryOf);

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
              <SelectField
                fieldName="peripheryOf"
                fieldLabel="Periphery Of"
                required={false}
                data={nonPeripheryCities}
                getDataValue={({ _id }: City) => _id}
                getDataText={({ name: cityName }: City) => cityName}
                fieldLayout={formItemLayout}
              />
              <AutoCompleteField
                fieldName="region"
                fieldLabel="Region"
                fieldLayout={formItemLayout}
                options={distinctRegions}
                initialValue={region}
                required={false}
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
