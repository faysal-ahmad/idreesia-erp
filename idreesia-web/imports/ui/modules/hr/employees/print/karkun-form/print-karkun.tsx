import React, { useRef, useState, type CSSProperties } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Checkbox, Divider, Spin } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

const ReactToPrintControl = ReactToPrint as any;

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import { HR_KARKUN_BY_ID } from '../../gql';
import { DetailedForm } from './detailed-form';
import { NonDetailedForm } from './non-detailed-form';

const ControlsContainer: CSSProperties = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

type Props = RouteComponentProps<{ employeeId: string }>;

const PrintView = ({ history, match }: Props) => {
  const [showDetails, setShowDetails] = useState(false);
  const printViewRef = useRef<HTMLDivElement | null>(null);
  const employeeId = match.params.employeeId;
  useDynamicBreadcrumbs(['HR', 'Employees', 'Print']);

  const { data, loading: formDataLoading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: employeeId },
  });

  const hrKarkunById = data?.hrKarkunById;
  if (formDataLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!hrKarkunById) return null;

  const form = showDetails ? (
    <DetailedForm hrKarkunById={hrKarkunById} />
  ) : (
    <NonDetailedForm hrKarkunById={hrKarkunById} />
  );

  return (
    <>
      <div style={ControlsContainer}>
        <div>
          <ReactToPrintControl
            content={() => printViewRef.current}
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
        <Checkbox
          checked={showDetails}
          onChange={event => setShowDetails(event.target.checked)}
        >
          Show Detailed Form
        </Checkbox>
      </div>
      <Divider />
      <div className="form-print-view" ref={printViewRef}>
        {form}
      </div>
    </>
  );
};

export default PrintView;
