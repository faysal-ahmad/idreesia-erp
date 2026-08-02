import React, { useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { type History } from 'history';
import { type CSSProperties } from 'react';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import { PrintForm } from './print-form';
import { ISSUANCE_FORM_BY_ID } from '../gql';

const ControlsContainer: CSSProperties = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

type RouteParams = {
  formId: string;
  physicalStoreId: string;
};

interface Props {
  history: History;
}

const PrintContainer = ({ history }: Props) => {
  const printFormRef = useRef<HTMLDivElement>(null);
  const { formId, physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { data, loading } = useQuery(ISSUANCE_FORM_BY_ID, {
    skip: !formId,
    variables: {
      _id: formId,
      physicalStoreId,
    },
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name, 'Issuance Forms', 'Print']
      : ['Inventory', 'Issuance Forms', 'Print']
  );

  if (loading || !data?.issuanceFormById || !physicalStore) {
    return null;
  }

  return (
    <>
      <div style={ControlsContainer}>
        <div>
          <ReactToPrint
            content={() => printFormRef.current!}
            trigger={() => (
              <Button size="large" type="primary" icon={<PrinterOutlined />}>
                Print
              </Button>
            )}
          />
          &nbsp;
          <Button
            size="large"
            type="primary"
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </Button>
        </div>
      </div>
      <Divider />
      <div ref={printFormRef}>
        <PrintForm
          issuanceFormById={data.issuanceFormById}
          physicalStoreId={physicalStoreId}
          physicalStore={{ name: physicalStore.name ?? '' }}
        />
      </div>
    </>
  );
};

export default PrintContainer;
