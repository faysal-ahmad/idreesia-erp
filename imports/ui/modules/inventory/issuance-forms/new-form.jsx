import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row, Select } from 'antd';

import { ItemsList } from '../common/items-list';
import { DateField, ProfileField, PhysicalStoreField } from '../common/fields';
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
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <DateField
          fieldName="issueDate"
          fieldLabel="Issue Date"
          required={true}
          requiredMessage="Please input an issue date."
          getFieldDecorator={getFieldDecorator}
        />
        <ProfileField
          fieldName="issuedBy"
          fieldLabel="Issued By"
          placeholder="Issued By"
          required={true}
          requiredMessage="Please input a name in issued by."
          getFieldDecorator={getFieldDecorator}
        />
        <ProfileField
          fieldName="issuedTo"
          fieldLabel="Issued To"
          placeholder="Issued To"
          required={true}
          requiredMessage="Please input a name in issued to."
          getFieldDecorator={getFieldDecorator}
        />
        <PhysicalStoreField
          fieldName="physicalStoreId"
          fieldLabel="Physical store"
          placeholder="Physical store"
          required={true}
          requiredMessage="Please select a physical store."
          getFieldDecorator={getFieldDecorator}
          initialValue={this.state.selectedPhysicalStoreId}
          handleValueChanged={this.handleStoreChanged}
        />
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
