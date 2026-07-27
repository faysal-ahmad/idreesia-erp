import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import { withQuery } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { Form } from 'antd';

import { flowRight, noop } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';
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

const AntForm = Form as any;
const TextField = InputTextField as any;
const AdjustmentDateField = DateField as any;
const TextAreaField = InputTextAreaField as any;
const CloseButton = FormButtonsClose as any;
const AuditInfoComponent = AuditInfo as any;

interface PhysicalStore {
  name: string;
}

interface HistoryLike {
  goBack(): void;
}

interface MatchLike {
  params: {
    formId: string;
  };
}

interface StockAdjustment {
  _id: string;
  physicalStoreId: string;
  adjustmentDate: string;
  quantity: number;
  isInflow: boolean;
  adjustmentReason?: string;
  refStockItem: {
    formattedName: string;
  };
  refAdjustedBy: {
    name: string;
  };
}

interface ViewFormProps {
  history: HistoryLike;
  match: MatchLike;
  physicalStoreId?: string;
  physicalStore?: PhysicalStore;
  formDataLoading?: boolean;
  stockAdjustmentById?: StockAdjustment;
}

class ViewForm extends Component<ViewFormProps> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    formDataLoading: PropTypes.bool,
    stockAdjustmentById: PropTypes.object,
  };

  handleClose = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const { formDataLoading, stockAdjustmentById } = this.props;
    if (formDataLoading || !stockAdjustmentById) {
      return null;
    }

    let adjustment;
    if (stockAdjustmentById.isInflow) {
      adjustment = `Increased by ${stockAdjustmentById.quantity}`;
    } else {
      adjustment = `Decreased by ${stockAdjustmentById.quantity}`;
    }

    return (
      <>
        <AntForm layout="horizontal" style={FormStyle} onFinish={noop}>
          <TextField
            fieldName="stockItemId"
            fieldLabel="Stock Item Name"
            initialValue={stockAdjustmentById.refStockItem.formattedName}
          />
          <TextField
            fieldName="adjustment"
            fieldLabel="Adjustment"
            initialValue={adjustment}
          />
          <TextField
            fieldName="adjustedBy"
            fieldLabel="Adjusted By"
            initialValue={stockAdjustmentById.refAdjustedBy.name}
          />
          <AdjustmentDateField
            fieldName="adjustedDate"
            fieldLabel="Adjusted Date"
            initialValue={dayjs(Number(stockAdjustmentById.adjustmentDate))}
          />

          <TextAreaField
            fieldName="adjustmentReason"
            fieldLabel="Adjustment Reason"
            initialValue={stockAdjustmentById.adjustmentReason}
          />

          <CloseButton handleClose={this.handleClose} />
        </AntForm>
        <AuditInfoComponent record={stockAdjustmentById} />
      </>
    );
  }
}

const formQuery = gql`
  query viewStockAdjustmentById($_id: String!, $physicalStoreId: String!) {
    stockAdjustmentById(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      physicalStoreId
      stockItemId
      adjustmentDate
      adjustedBy
      quantity
      isInflow
      adjustmentReason
      createdAt
      createdBy
      updatedAt
      updatedBy
      approvedOn
      approvedBy
      refStockItem {
        _id
        name
        formattedName
      }
      refAdjustedBy {
        _id
        name
      }
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  withQuery(formQuery, {
    props: ({ data }: { data: Record<string, any> }) => ({
      formDataLoading: data.loading,
      ...data,
    }),
    options: ({
      match,
      physicalStoreId,
    }: {
      match?: MatchLike;
      physicalStoreId?: string;
    }) => {
      if (!match) return { variables: { _id: '', physicalStoreId } };
      const { formId } = match.params;
      return { variables: { _id: formId, physicalStoreId } };
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }: { physicalStore?: PhysicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Adjustments, View`;
    }
    return `Inventory, Stock Adjustments, View`;
  })
)(ViewForm as any);
