import React from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import { filter } from 'meteor/idreesia-common/utilities/lodash';

import {
  AutoCompleteField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

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

const ListFilter = props => {
  const [form] = Form.useForm();
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

  const handleFinish = ({ peripheryOf, region }) => {
    const { setPageParams } = props;
    setPageParams({
      pageIndex: 0,
      peripheryOf,
      region,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const {
    region,
    allCities,
    distinctRegions,
  } = props;

  const nonPeripheryCities = filter(allCities, city => !city.peripheryOf);

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
                getDataValue={({ _id }) => _id}
                getDataText={({ name: _name }) => _name}
                fieldLayout={formItemLayout}
              />
              <AutoCompleteField
                fieldName="region"
                fieldLabel="Region"
                fieldLayout={formItemLayout}
                dataSource={distinctRegions}
                initialValue={region}
                required={false}
              />
              <Form.Item {...buttonItemLayout}>
                <Row type="flex" justify="end">
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

ListFilter.propTypes = {
  allCities: PropTypes.array,
  distinctRegions: PropTypes.array,
  peripheryOf: PropTypes.string,
  region: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
