import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import { withQuery } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { Divider, Form } from 'antd';

import { flowRight, noop } from 'meteor/idreesia-common/utilities/lodash';
import { ItemsList } from '../../common/items-list';
import {
  InputTextField,
  DateField,
  FormButtonsClose,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

const FormStyle = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

const ReactFragment = Fragment as any;
const AntDivider = Divider as any;
const AntForm = Form as any;
const AntFormItem = Form.Item as any;
const ItemsListComponent = ItemsList as any;
const TextField = InputTextField as any;
const PurchaseDateField = DateField as any;
const CloseButton = FormButtonsClose as any;
const TextAreaField = InputTextAreaField as any;
const AuditInfoComponent = AuditInfo as any;

interface HistoryLike {
  goBack(): void;
}

interface PurchaseForm {
  _id: string;
  purchaseDate: string;
  refVendor?: { name: string };
  refReceivedBy: { name: string };
  refPurchasedBy: { name: string };
  notes?: string;
  items: unknown[];
}

interface MatchLike {
  params: {
    formId: string;
  };
}

interface ViewFormProps {
  history: HistoryLike;
  match: MatchLike;
  physicalStoreId?: string;
  physicalStore?: { name: string };
  formDataLoading?: boolean;
  purchaseFormById?: PurchaseForm;
}

class ViewForm extends Component<ViewFormProps> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    formDataLoading: PropTypes.bool,
    purchaseFormById: PropTypes.object,
  };

  handleClose = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const { formDataLoading, purchaseFormById, physicalStoreId } = this.props;
    if (formDataLoading || !purchaseFormById) {
      return null;
    }

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    return (
      <ReactFragment>
        <AntForm layout="horizontal" style={FormStyle} onFinish={noop}>
          <PurchaseDateField
            fieldName="purchaseDate"
            fieldLabel="Purchase Date"
            initialValue={dayjs(Number(purchaseFormById.purchaseDate))}
            required
            requiredMessage="Please input a purchase date."
          />
          <TextField
            fieldName="vendorId"
            fieldLabel="Vendor"
            initialValue={
              purchaseFormById.refVendor ? purchaseFormById.refVendor.name : ''
            }
          />
          <TextField
            fieldName="receivedBy"
            fieldLabel="Received By"
            initialValue={purchaseFormById.refReceivedBy.name}
            required
            requiredMessage="Please input a name in received by."
          />
          <TextField
            fieldName="purchasedBy"
            fieldLabel="Purchased By"
            initialValue={purchaseFormById.refPurchasedBy.name}
            required
            requiredMessage="Please input a name in purchased by."
          />

          <TextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={purchaseFormById.notes}
          />

          <AntDivider orientation="left">Purchased / Returned Items</AntDivider>
          <AntFormItem
            name="items"
            initialValue={purchaseFormById.items}
            rules={rules}
            {...formItemExtendedLayout}
          >
            <ItemsListComponent
              readOnly
              defaultLabel="Purchased"
              inflowLabel="Purchased"
              outflowLabel="Returned"
              showPrice
              physicalStoreId={physicalStoreId}
            />
          </AntFormItem>

          <CloseButton handleClose={this.handleClose} />
        </AntForm>
        <AuditInfoComponent record={purchaseFormById} />
      </ReactFragment>
    );
  }
}

const formQuery = gql`
  query purchaseFormById($_id: String!, $physicalStoreId: String!) {
    purchaseFormById(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      physicalStoreId
      vendorId
      createdAt
      createdBy
      updatedAt
      updatedBy
      approvedOn
      approvedBy
      items {
        stockItemId
        quantity
        isInflow
        price
      }
      refReceivedBy {
        _id
        name
      }
      refPurchasedBy {
        _id
        name
      }
      refVendor {
        _id
        name
      }
      notes
    }
  }
`;

export default flowRight(
  withQuery(formQuery, {
    props: ({ data }: { data: Record<string, any> }) => ({
      formDataLoading: data.loading,
      ...data,
    }),
    options: ({ match }: { match?: MatchLike }) => {
      if (!match) return { variables: { _id: '' } };
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  })
)(ViewForm as any);
