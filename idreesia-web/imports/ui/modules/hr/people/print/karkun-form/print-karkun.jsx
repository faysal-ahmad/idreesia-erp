import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Checkbox, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';

import { HR_KARKUN_BY_ID } from '../../gql';
import { DetailedForm } from './detailed-form';
import { NonDetailedForm } from './non-detailed-form';

const ControlsContainer = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

const PrintView = ({ history, match }) => {
  const [showDetails, setShowDetails] = useState(false);
  const printViewRef = useRef(null);
  const { karkunId } = match.params;
  const { data = {}, loading: formDataLoading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: karkunId },
  });

  const { hrKarkunById } = data;
  if (formDataLoading || !hrKarkunById) return null;

  const form = showDetails ? (
    <DetailedForm hrKarkunById={hrKarkunById} />
  ) : (
    <NonDetailedForm hrKarkunById={hrKarkunById} />
  );

  return (
    <>
      <div style={ControlsContainer}>
        <div>
          <ReactToPrint
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
          onChange={e => setShowDetails(e.target.checked)}
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

PrintView.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Karkuns', 'Print Karkun'])(PrintView);
