import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import moment from 'moment';
import { get } from 'lodash';
import { AutoComplete, DatePicker, Form, Input, Button, Row, Select } from 'antd';

import { ItemsList } from '../common/items-list';
import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { Profiles } from '/imports/lib/collections/admin';
import { IssuanceForms, PhysicalStores } from '/imports/lib/collections/inventory';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    profiles: PropTypes.array,
    physicalStores: PropTypes.array
  };

  formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 }
  };

  formItemExtendedLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  };

  buttonItemLayout = {
    wrapperCol: { span: 18, offset: 6 }
  };

  constructor(props) {
    super(props);
    const { physicalStores } = this.props;
    const physicalStoreId =
      physicalStores && physicalStores.length > 0 ? physicalStores[0]._id : null;

    this.state = {
      selectedPhysicalStoreId: physicalStoreId
    };
  }

  handleStoreChanged = value => {
    const state = Object.assign({}, this.state, {
      selectedPhysicalStoreId: value
    });
    this.setState(state);
  };

  handleCancel = () => {
    const { history } = this.props;
    const issuanceFormsListPath = paths.issuanceFormsListPath.replace(':pageId', '1');
    history.push(issuanceFormsListPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      debugger;
      if (err) return;

      const doc = {
        issueDate: fieldsValue.issueDate.toDate(),
        issuedBy: fieldsValue.issuedBy,
        issuedTo: fieldsValue.issuedTo,
        physicalStoreId: fieldsValue.physicalStoreId,
        items: fieldsValue.items
      };

      Meteor.call('inventory/issuanceForms.create', { doc }, (error, result) => {
        if (error) return;
        const { history } = this.props;
        history.push(paths.issuanceFormsListPath);
      });
    });
  };

  getIssueDateField() {
    const { getFieldDecorator } = this.props.form;
    const initialValue = moment();
    const rules = [
      {
        required: true,
        message: 'Please input an issue date.'
      }
    ];
    return getFieldDecorator('issueDate', { initialValue, rules })(
      <DatePicker format="DD MMM, YYYY" />
    );
  }

  getIssuedToField() {
    const { profiles } = this.props;
    const { getFieldDecorator } = this.props.form;
    const children = [];

    profiles.forEach(profile => {
      children.push(
        <AutoComplete.Option key={profile._id} value={profile._id} text={profile.name}>
          {profile.name}
        </AutoComplete.Option>
      );
    });

    const rules = [
      {
        required: true,
        message: 'Please input a name in issued to.'
      }
    ];

    const filterOption = (inputValue, option) => {
      const optionText = get(option, ['props', 'text'], '');
      return optionText.indexOf(inputValue) !== -1;
    };

    return getFieldDecorator('issuedTo', { rules })(
      <AutoComplete
        placeholder="Issued to"
        filterOption={true}
        optionLabelProp="text"
        backfill={true}
        filterOption={filterOption}
      >
        {children}
      </AutoComplete>
    );
  }

  getIssuedByField() {
    const { profiles } = this.props;
    const { getFieldDecorator } = this.props.form;
    const children = [];

    profiles.forEach(profile => {
      children.push(
        <AutoComplete.Option key={profile._id} value={profile._id} text={profile.name}>
          {profile.name}
        </AutoComplete.Option>
      );
    });

    const rules = [
      {
        required: true,
        message: 'Please input a name in issued by.'
      }
    ];

    const filterOption = (inputValue, option) => {
      const optionText = get(option, ['props', 'text'], '');
      return optionText.indexOf(inputValue) !== -1;
    };

    return getFieldDecorator('issuedBy', { rules })(
      <AutoComplete
        placeholder="Issued by"
        filterOption={true}
        optionLabelProp="text"
        backfill={true}
        filterOption={filterOption}
      >
        {children}
      </AutoComplete>
    );
  }

  getPhysicalStoreField() {
    const { physicalStores } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = this.state.selectedPhysicalStoreId;
    const rules = [
      {
        required: true,
        message: 'Please select a physical store.'
      }
    ];
    const options = [];
    physicalStores.forEach(physicalStore => {
      options.push(
        <Select.Option key={physicalStore._id} value={physicalStore._id}>
          {physicalStore.name}
        </Select.Option>
      );
    });

    return getFieldDecorator('physicalStoreId', { rules, initialValue })(
      <Select placeholder="Physical store" onChange={this.handleStoreChanged}>
        {options}
      </Select>
    );
  }

  getItemsField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please add some items.'
      }
    ];
    return getFieldDecorator('items', { rules })(
      <ItemsList physicalStoreId={this.state.selectedPhysicalStoreId} />
    );
  }

  render() {
    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <Form.Item label="Issue Date" {...this.formItemLayout}>
          {this.getIssueDateField()}
        </Form.Item>
        <Form.Item label="Issued By" {...this.formItemLayout}>
          {this.getIssuedByField()}
        </Form.Item>
        <Form.Item label="Issued To" {...this.formItemLayout}>
          {this.getIssuedToField()}
        </Form.Item>
        <Form.Item label="Physical Store" {...this.formItemLayout}>
          {this.getPhysicalStoreField()}
        </Form.Item>
        <Form.Item label="Issued Items" {...this.formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>
        <Form.Item {...this.buttonItemLayout}>
          <Row type="flex" justify="end">
            <Button type="secondary" onClick={this.handleCancel}>
              Cancel
            </Button>
            &nbsp;
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Row>
        </Form.Item>
      </Form>
    );
  }
}

function dataLoader(props, onData) {
  const profilesSubscription = Meteor.subscribe('admin/profiles#all');
  const physicalStoresSubscription = Meteor.subscribe('inventory/physicalStores#all');
  if (profilesSubscription.ready() && physicalStoresSubscription.ready()) {
    const profiles = Profiles.find({}).fetch();
    const physicalStores = PhysicalStores.find({}).fetch();
    onData(null, { profiles, physicalStores });
  }
}

export default merge(
  Form.create(),
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Inventory', 'Forms', 'Issuance Forms', 'New'])
)(NewForm);
