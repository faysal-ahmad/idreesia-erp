import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import { PrintForm } from './print-form';
import { PURCHASE_FORM_BY_ID } from '../gql';

const ControlsContainer = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

const AntButton = Button as any;
const AntDivider = Divider as any;
const AntPrinterOutlined = PrinterOutlined as any;
const ReactToPrintComponent = ReactToPrint as any;
const PrintFormComponent = PrintForm as any;

interface RouteParams {
  formId: string;
  physicalStoreId: string;
}

interface HistoryLike {
  goBack(): void;
}

interface PrintContainerProps {
  history: HistoryLike;
}

interface PurchaseFormData {
  purchaseFormById: Record<string, unknown>;
}

const PrintContainer = ({ history }: PrintContainerProps) => {
  const dispatch = useDispatch();
  const printFormRef = useRef<any>(null);
  const { formId, physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { data, loading } = useQuery(PURCHASE_FORM_BY_ID as any, {
    skip: !formId,
    variables: {
      _id: formId,
    },
  });

  useEffect(() => {
    if (physicalStore) {
      dispatch(
        setBreadcrumbs(['Inventory', physicalStore.name, 'Purchase Forms', 'Print'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Purchase Forms', 'Print']));
    }
  }, [dispatch, physicalStore]);
  
  if (loading || !data) return null;
  const { purchaseFormById } = data as PurchaseFormData;

  return (
    <>
      <div style={ControlsContainer}>
        <div>
          <ReactToPrintComponent
            content={() => printFormRef.current}
            trigger={() => (
              <AntButton size="large" type="primary" icon={<AntPrinterOutlined />}>
                Print
              </AntButton>
            )}
          />
          &nbsp;
          <AntButton
            size="large"
            type="primary"
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </AntButton>
        </div>
      </div>
      <AntDivider />
      <PrintFormComponent
        ref={printFormRef}
        purchaseFormById={purchaseFormById}
        physicalStoreId={physicalStoreId}
        physicalStore={physicalStore}
      />
    </>
  );
};

PrintContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default PrintContainer;
