import React from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import { useAllPortals } from 'meteor/idreesia-common/hooks/portals';
import {
  CheckboxGroupField,
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

  const { allPortals, allPortalsLoading } = useAllPortals();
  if (allPortalsLoading) return null;

  const handleSubmit = e => {
    e.preventDefault();
    const {
      setPageParams,
      form: { validateFields },
    } = props;
    validateFields((err, { status, portalAccess }) => {
      if (err) return;
      setPageParams({
        showLocked: status.indexOf('locked') !== -1 ? 'true' : 'false',
        showUnlocked: status.indexOf('unlocked') !== -1 ? 'true' : 'false',
        portalAccess,
        pageIndex: '0',
      });
    });
  };

  const handleReset = () => {
    const { setPageParams } = props;
    setPageParams({
      showLocked: 'false',
      showUnlocked: 'true',
      portalAccess: '',
      pageIndex: '0',
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const {
    showLocked,
    showUnlocked,
    portalAccess,
  } = props;

  const status = [];
  if (showLocked === 'true') status.push('locked');
  if (showUnlocked === 'true') status.push('unlocked');

  const portalsData = allPortals.map(portal => ({
    value: portal._id,
    text: portal.name,
  }));

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onSubmit={handleSubmit}>
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
          <SelectField
            data={portalsData}
            getDataValue={({ value }) => value}
            getDataText={({ text }) => text}
            initialValue={portalAccess}
            fieldName="portalAccess"
            fieldLabel="Portal Access"
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
  showLocked: PropTypes.string,
  showUnlocked: PropTypes.string,
  portalAccess: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
