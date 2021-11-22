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
  const { refreshData } = props;

  const handleReset = () => {
    const { form, setPageParams } = props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      peripheryOf: null,
      region: null,
      portalId: null,
    });
  };

  const handleSubmit = () => {
    const { form, setPageParams } = props;

    form.validateFields((err, { peripheryOf, region, portalId }) => {
      if (err) return;
      setPageParams({
        pageIndex: 0,
        peripheryOf,
        region,
        portalId,
      });
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const {
    region,
    portalId,
    allCities,
    distinctRegions,
    allPortals,
  } = props;

  const nonPeripheryCities = filter(allCities, city => !city.peripheryOf);

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal">
          <SelectField
            fieldName="peripheryOf"
            fieldLabel="Periphery Of"
            required={false}
            data={nonPeripheryCities}
            getDataValue={({ _id }) => _id}
            getDataText={({ name: _name }) => _name}
            fieldLayout={formItemLayout}
            initialValue={portalId}
          />
          <AutoCompleteField
            fieldName="region"
            fieldLabel="Region"
            fieldLayout={formItemLayout}
            dataSource={distinctRegions}
            initialValue={region}
            required={false}
          />
          <SelectField
            fieldName="portalId"
            fieldLabel="Portal"
            required={false}
            data={allPortals}
            getDataValue={({ _id }) => _id}
            getDataText={({ name: _name }) => _name}
            fieldLayout={formItemLayout}
            initialValue={portalId}
          />
          <Form.Item {...buttonItemLayout}>
            <Row type="flex" justify="end">
              <Button type="default" onClick={handleReset}>
                Reset
              </Button>
              &nbsp;
              <Button type="primary" onClick={handleSubmit}>
                Search
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </Collapse.Panel>
    </Collapse>
  );
};

ListFilter.propTypes = {
  form: PropTypes.object,
  allCities: PropTypes.array,
  distinctRegions: PropTypes.array,
  allPortals: PropTypes.array,
  peripheryOf: PropTypes.string,
  region: PropTypes.string,
  portalId: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
