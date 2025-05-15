import React from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import { CheckboxGroupField } from '/imports/ui/modules/helpers/fields';
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

  const handleFinish = ({ status }) => {
    const { setPageParams } = props;
    setPageParams({
      showLocked: status.indexOf('locked') !== -1 ? 'true' : 'false',
      showUnlocked: status.indexOf('unlocked') !== -1 ? 'true' : 'false',
      pageIndex: '0',
    });
  };

  const handleReset = () => {
    const { setPageParams } = props;
    setPageParams({
      showLocked: 'true',
      showUnlocked: 'true',
      pageIndex: '0',
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const { showLocked, showUnlocked } = props;
  const status = [];
  if (showLocked === 'true') status.push('locked');
  if (showUnlocked === 'true') status.push('unlocked');

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onFinish={handleFinish}>
          <CheckboxGroupField
            fieldName="status"
            fieldLabel="Status"
            fieldLayout={formItemLayout}
            options={[
              { label: 'Locked Users', value: 'locked' },
              { label: 'Unlocked Users', value: 'unlocked' },
            ]}
            initialValue={status}
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
  showLocked: PropTypes.string,
  showUnlocked: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
