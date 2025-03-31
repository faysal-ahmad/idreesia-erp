import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
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

const PrintContainer = ({ history }) => {
  const dispatch = useDispatch();
  const printFormRef = useRef(null);
  const { formId, physicalStoreId } = useParams();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { data, loading } = useQuery(PURCHASE_FORM_BY_ID, {
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
  }, [physicalStoreId]);
  
  if (loading || !data) return null;
  const { purchaseFormById } = data; 

  return (
    <>
      <div style={ControlsContainer}>
        <div>
          <ReactToPrint
            content={() => printFormRef.current}
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
      <PrintForm
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
