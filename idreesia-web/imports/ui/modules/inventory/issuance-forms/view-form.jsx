import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Divider, Form } from 'antd';

import { flowRight, noop } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { ItemsList } from '../common/items-list';
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

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

class ViewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    formDataLoading: PropTypes.bool,
    issuanceFormById: PropTypes.object,
  };

  handleClose = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const { formDataLoading, issuanceFormById, physicalStoreId } = this.props;
    if (formDataLoading) {
      return null;
    }

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    return (
      <Fragment>
        <Form layout="horizontal" style={FormStyle} onFinish={noop}>
          <DateField
            fieldName="issueDate"
            fieldLabel="Issue Date"
            initialValue={moment(Number(issuanceFormById.issueDate))}
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
      </Fragment>
    );
  }
}

const formQuery = gql`
  query issuanceFormById($_id: String!) {
    issuanceFormById(_id: $_id) {
      _id
      issueDate
      issuedBy
      issuedTo
      handedOverTo
      physicalStoreId
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
      }
      refLocation {
        _id
        name
      }
      refIssuedBy {
        _id
        name
      }
      refIssuedTo {
        _id
        name
      }
      notes
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Issuance Forms, View`;
    }
    return `Inventory, Issuance Forms, View`;
  })
)(ViewForm);
