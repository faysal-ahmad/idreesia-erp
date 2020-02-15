import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Collapse,
  Form,
  Icon,
  Row,
  Tooltip,
} from '/imports/ui/controls';
import {
  AutoCompleteField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

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
  const handleReset = () => {
    const { form, setPageParams } = props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      region: null,
      portalId: null,
    });
  };

  const handleSubmit = () => {
    const { form, setPageParams } = props;

    form.validateFields((err, { region, portalId }) => {
      if (err) return;
      setPageParams({
        pageIndex: 0,
        region,
        portalId,
      });
    });
  };

  const refreshButton = () => {
    const { refreshData } = props;

    return (
      <Tooltip title="Reload Data">
        <Icon
          type="sync"
          onClick={event => {
            event.stopPropagation();
            if (refreshData) refreshData();
          }}
        />
      </Tooltip>
    );
  };

  const {
    region,
    portalId,
    distinctRegions,
    allPortals,
    form: { getFieldDecorator },
  } = props;

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal">
          <AutoCompleteField
            fieldName="region"
            fieldLabel="Region"
            fieldLayout={formItemLayout}
            dataSource={distinctRegions}
            initialValue={region}
            required={false}
            getFieldDecorator={getFieldDecorator}
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
            getFieldDecorator={getFieldDecorator}
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
  distinctRegions: PropTypes.array,
  allPortals: PropTypes.array,
  region: PropTypes.string,
  portalId: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default Form.create({ name: 'citiesListFilter' })(ListFilter);
