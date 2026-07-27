import React from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import { filter } from 'meteor/idreesia-common/utilities/lodash';

import {
  AutoCompleteField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

const AntButton = Button as any;
const AntCollapse = Collapse as any;
const AntForm = Form as any;
const AntFormItem = (Form as any).Item;
const AntRow = Row as any;
const AutoCompleteInputField = AutoCompleteField as any;
const SelectInputField = SelectField as any;
const RefreshControl = RefreshButton as any;
interface City { _id: string; name?: string; peripheryOf?: string | null; }
interface Props { allCities?: City[]; distinctRegions?: string[]; peripheryOf?: string | null; region?: string | null; setPageParams(params: Record<string, unknown>): void; refreshData?: () => Promise<unknown>; }
interface FormValues { peripheryOf?: string | null; region?: string | null; }

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

const ListFilter = (props: Props) => {
  const [form] = AntForm.useForm();
  const { refreshData } = props;

  const handleReset = () => {
    const { setPageParams } = props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      peripheryOf: null,
      region: null,
    });
  };

  const handleFinish = ({ peripheryOf, region }: FormValues) => {
    const { setPageParams } = props;
    setPageParams({
      pageIndex: 0,
      peripheryOf,
      region,
    });
  };

  const refreshButton = () => <RefreshControl refreshData={refreshData} />;

  const {
    region,
    allCities,
    distinctRegions,
  } = props;

  const nonPeripheryCities = filter(allCities ?? [], (city: City) => !city.peripheryOf);

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
              <SelectInputField
                fieldName="peripheryOf"
                fieldLabel="Periphery Of"
                required={false}
                data={nonPeripheryCities}
                getDataValue={({ _id }: City) => _id}
                getDataText={({ name: _name }: City) => _name}
                fieldLayout={formItemLayout}
              />
              <AutoCompleteInputField
                fieldName="region"
                fieldLabel="Region"
                fieldLayout={formItemLayout}
                dataSource={distinctRegions}
                initialValue={region}
                required={false}
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
  allCities: PropTypes.array,
  distinctRegions: PropTypes.array,
  peripheryOf: PropTypes.string,
  region: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
