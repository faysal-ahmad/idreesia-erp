import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { ExclamationCircleTwoTone } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Col, Row, Spin, Tabs } from 'antd';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';

import { SECURITY_VISITOR_BY_CNIC } from '../gql';

const AntExclamationCircleTwoTone = ExclamationCircleTwoTone as any;
const AntCol = Col as any;
const AntRow = Row as any;
const AntSpin = Spin as any;
const AntTabs = Tabs as any;
const AntTabPane = (Tabs as any).TabPane;
const VisitorStaysListComponent = VisitorStaysList as any;

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 22,
};

const DataStyle = {
  fontSize: 22,
};

const WarningDataStyle = {
  fontSize: 22,
  color: 'orange',
};

const ErrorDataStyle = {
  fontSize: 22,
  color: 'red',
};

const NoRecordFoundStyle = {
  color: 'orange',
  fontSize: 36,
};

interface SearchResultRowProps {
  label: string;
  text?: string;
  dataStyle: Record<string, string | number>;
}

const SearchResultRow = ({ label, text, dataStyle }: SearchResultRowProps) => (
  <AntRow type="flex" gutter={16}>
    <AntCol order={1}>
      <span style={LabelStyle}>{label}:</span>
    </AntCol>
    <AntCol order={2}>
      <span style={dataStyle}>{text}</span>
    </AntCol>
  </AntRow>
);

SearchResultRow.propTypes = {
  label: PropTypes.string,
  text: PropTypes.string,
  dataStyle: PropTypes.object,
};

interface SecurityVisitor {
  _id: string;
  name?: string;
  parentName?: string;
  cnicNumber?: string;
  ehadDate?: string | number;
  referenceName?: string;
  contactNumber1?: string;
  city?: string;
  country?: string;
  imageId?: string;
  criminalRecord?: string | null;
  otherNotes?: string | null;
}

interface SecurityVisitorData {
  securityVisitorByCnic?: SecurityVisitor | null;
}

interface SearchResultProps {
  cnicNumbers: string[];
}

const SearchResult = (props: SearchResultProps) => {
  const { cnicNumbers } = props;
  const { data = {}, loading } = useQuery(SECURITY_VISITOR_BY_CNIC as any, {
    variables: { cnicNumbers },
    fetchPolicy: 'network-only',
  });
  const { securityVisitorByCnic } = data as SecurityVisitorData;
  if (cnicNumbers.length === 0) return null;
  if (loading) return <AntSpin size="large" />;

  if (!securityVisitorByCnic) {
    return (
      <AntRow type="flex" justify="start" align="middle" gutter={16}>
        <AntCol>
          <AntExclamationCircleTwoTone
            style={NoRecordFoundStyle}
            twoToneColor={NoRecordFoundStyle.color}
          />
        </AntCol>
        <AntCol>
          <div style={NoRecordFoundStyle}>
            {'No records found against scanned CNIC.'}
          </div>
        </AntCol>
      </AntRow>
    );
  }

  const {
    _id,
    name,
    parentName,
    cnicNumber,
    ehadDate,
    referenceName,
    contactNumber1,
    city,
    country,
    imageId,
    criminalRecord,
    otherNotes,
  } = securityVisitorByCnic;

  const url = getDownloadUrl(imageId);
  const image = url ? <img src={url} style={{ width: '250px' }} alt={name} /> : null;

  let dataStyle = DataStyle;
  if (otherNotes) dataStyle = WarningDataStyle;
  if (criminalRecord) dataStyle = ErrorDataStyle;

  return (
    <AntRow type="flex" justify="space-between" gutter={16}>
      <AntCol order={1}>
        {image}
        <SearchResultRow label="Name" text={name} dataStyle={dataStyle} />
        <SearchResultRow label="CNIC" text={cnicNumber} dataStyle={dataStyle} />
        <SearchResultRow label="S/O" text={parentName} dataStyle={dataStyle} />
        <SearchResultRow
          label="Ehad Date"
          text={dayjs(Number(ehadDate)).format('MMMM, YYYY')}
          dataStyle={dataStyle}
        />
        <SearchResultRow
          label="R/O"
          text={referenceName}
          dataStyle={dataStyle}
        />
        <SearchResultRow
          label="Phone"
          text={contactNumber1}
          dataStyle={dataStyle}
        />
        <SearchResultRow label="City" text={city} dataStyle={dataStyle} />
        <SearchResultRow label="Country" text={country} dataStyle={dataStyle} />
      </AntCol>
      <AntCol order={2} span={16}>
        <AntTabs defaultActiveKey="1">
          <AntTabPane tab="Stay History" key="1">
            <VisitorStaysListComponent
              visitorId={_id}
              showDutyColumn
              showNewButton
              showActionsColumn
            />
          </AntTabPane>
        </AntTabs>
      </AntCol>
    </AntRow>
  );
};

SearchResult.propTypes = {
  cnicNumbers: PropTypes.array,
};

export default SearchResult;
