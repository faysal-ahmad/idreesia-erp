import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Divider, Form } from 'antd';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  InputTextField,
  DateField,
  FormButtonsClose,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';
import { ItemsList } from '../../common/items-list';

const FormStyle = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

export class IssuanceDetails extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    issuanceFormById: PropTypes.object,
  };

  handleClose = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const { issuanceFormById, physicalStoreId } = this.props;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    return (
      <>
        <Form layout="horizontal" style={FormStyle} onFinish={noop}>
          <DateField
            fieldName="issueDate"
            fieldLabel="Issue Date"
            initialValue={dayjs(Number(issuanceFormById.issueDate))}
            required
            requiredMessage="Please input an issue date."
          />
          <InputTextField
            fieldName="issuedBy"
            fieldLabel="Issued By"
            initialValue={issuanceFormById.refIssuedBy.name}
            required
            requiredMessage="Please input a name in issued by."
          />
          <InputTextField
            fieldName="issuedTo"
            fieldLabel="Issued To"
            initialValue={issuanceFormById.refIssuedTo.name}
            required
            requiredMessage="Please input a name in issued to."
          />
          <InputTextField
            fieldName="handedOverTo"
            fieldLabel="Handed Over To / By"
            initialValue={issuanceFormById.handedOverTo}
          />
          <InputTextField
            fieldName="locationId"
            fieldLabel="For Location"
            initialValue={
              issuanceFormById.refLocation
                ? issuanceFormById.refLocation.name
                : null
            }
          />
          <InputTextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={issuanceFormById.notes}
          />

          <Divider orientation="left">Issued / Returned Items</Divider>
          <Form.Item name="items" initialValue={issuanceFormById.items} rules={rules} {...formItemExtendedLayout}>
            <ItemsList
              readOnly
              defaultLabel="Issued"
              inflowLabel="Returned"
              outflowLabel="Issued"
              physicalStoreId={physicalStoreId}
            />
          </Form.Item>

          <FormButtonsClose handleClose={this.handleClose} />
        </Form>
        <AuditInfo record={issuanceFormById} />
      </>
    );
  }
}
