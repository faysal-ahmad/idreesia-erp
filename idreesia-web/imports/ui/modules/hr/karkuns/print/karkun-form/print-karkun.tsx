import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Checkbox, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
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

const ReactToPrintControl = ReactToPrint as any;
const AntButton = Button as any;
const AntCheckbox = Checkbox as any;
const AntDivider = Divider as any;
const AntPrinterOutlined = PrinterOutlined as any;
const DetailedKarkunForm = DetailedForm as any;
const NonDetailedKarkunForm = NonDetailedForm as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { goBack(): void; }
interface MatchLike { params: { karkunId: string; }; }
interface QueryData { hrKarkunById?: AnyRecord | null; }
interface Props { history: HistoryLike; match: MatchLike; }

const PrintView = ({ history, match }: Props) => {
  const printViewRef = useRef<HTMLDivElement | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { data, loading: formDataLoading } = useQuery(HR_KARKUN_BY_ID as any, {
    variables: { _id: match.params.karkunId },
  });

  if (formDataLoading) return null;

  const { hrKarkunById } = (data ?? {}) as QueryData;
  const form = showDetails ? (
    <DetailedKarkunForm hrKarkunById={hrKarkunById} />
  ) : (
    <NonDetailedKarkunForm hrKarkunById={hrKarkunById} />
  );

  return (
    <>
      <div style={ControlsContainer as any}>
        <div>
          <ReactToPrintControl
            content={() => printViewRef.current}
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
        <AntCheckbox
          checked={showDetails}
          onChange={(e: any) => setShowDetails(e.target.checked)}
        >
          Show Detailed Form
        </AntCheckbox>
      </div>
      <AntDivider />
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

  karkunId: PropTypes.string,
};

export default flowRight(
  WithBreadcrumbs(['HR', 'Karkuns', 'Print Karkun'])
)(PrintView as any);
