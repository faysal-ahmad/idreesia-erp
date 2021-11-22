import React from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import { DataSource } from 'meteor/idreesia-common/constants';

import { SelectField } from '/imports/ui/modules/helpers/fields';
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

  const handleSubmit = e => {
    e.preventDefault();
    const {
      setPageParams,
      form: { validateFields },
    } = props;
    validateFields((err, { dataSource }) => {
      if (err) return;
      setPageParams({
        dataSource,
        pageIndex: 0,
      });
    });
  };

  const handleReset = () => {
    const { setPageParams } = props;
    setPageParams({
      dataSource: null,
      pageIndex: 0,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const {
    dataSource,
  } = props;

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onSubmit={handleSubmit}>
          <SelectField
            fieldName="dataSource"
            fieldLabel="Data Source"
            required={false}
            data={[
              {
                label: 'Outstation',
                value: DataSource.OUTSTATION,
              },
              {
                label: 'Portals',
                value: DataSource.PORTAL,
              },
            ]}
            getDataValue={({ value }) => value}
            getDataText={({ label }) => label}
            initialValue={dataSource}
            fieldLayout={formItemLayout}
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
      </Collapse.Panel>
    </Collapse>
  );
};

ListFilter.propTypes = {
  form: PropTypes.object,

  dataSource: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
