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

const AntDivider = Divider as any;
const AntForm = Form as any;
const AntFormItem = Form.Item as any;
const TextField = InputTextField as any;
const IssueDateField = DateField as any;
const CloseButton = FormButtonsClose as any;
const TextAreaField = InputTextAreaField as any;
const AuditInfoComponent = AuditInfo as any;
const ItemsListComponent = ItemsList as any;
interface HistoryLike { goBack(): void; }
interface IssuanceForm {
  issueDate: string;
  refIssuedBy: { name: string };
  refIssuedTo: { name: string };
  handedOverTo?: string;
  refLocation?: { name: string };
  notes?: string;
  items: unknown[];
}
interface IssuanceDetailsProps {
  history: HistoryLike;
  physicalStoreId?: string;
  issuanceFormById: IssuanceForm;
}

export class IssuanceDetails extends Component<IssuanceDetailsProps> {
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
        <AntForm layout="horizontal" style={FormStyle} onFinish={noop}>
          <IssueDateField
            fieldName="issueDate"
            fieldLabel="Issue Date"
            initialValue={dayjs(Number(issuanceFormById.issueDate))}
            required
            requiredMessage="Please input an issue date."
          />
          <TextField
            fieldName="issuedBy"
            fieldLabel="Issued By"
            initialValue={issuanceFormById.refIssuedBy.name}
            required
            requiredMessage="Please input a name in issued by."
          />
          <TextField
            fieldName="issuedTo"
            fieldLabel="Issued To"
            initialValue={issuanceFormById.refIssuedTo.name}
            required
            requiredMessage="Please input a name in issued to."
          />
          <TextField
            fieldName="handedOverTo"
            fieldLabel="Handed Over To / By"
            initialValue={issuanceFormById.handedOverTo}
          />
          <TextField
            fieldName="locationId"
            fieldLabel="For Location"
            initialValue={
              issuanceFormById.refLocation
                ? issuanceFormById.refLocation.name
                : null
            }
          />
          <TextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={issuanceFormById.notes}
          />

          <AntDivider orientation="left">Issued / Returned Items</AntDivider>
          <AntFormItem name="items" initialValue={issuanceFormById.items} rules={rules} {...formItemExtendedLayout}>
            <ItemsListComponent
              readOnly
              defaultLabel="Issued"
              inflowLabel="Returned"
              outflowLabel="Issued"
              physicalStoreId={physicalStoreId}
            />
          </AntFormItem>

          <CloseButton handleClose={this.handleClose} />
        </AntForm>
        <AuditInfoComponent record={issuanceFormById} />
      </>
    );
  }
}
