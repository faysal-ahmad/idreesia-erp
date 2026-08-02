import React, { type CSSProperties } from 'react';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { ExclamationCircleTwoTone } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Col, Row, Spin, Tabs } from 'antd';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';

import { SECURITY_VISITOR_BY_CNIC } from '../gql';

const TabPane = Tabs.TabPane;

const LabelStyle: CSSProperties = {
  fontWeight: 'bold',
  fontSize: 22,
};

const DataStyle: CSSProperties = {
  fontSize: 22,
};

const WarningDataStyle: CSSProperties = {
  fontSize: 22,
  color: 'orange',
};

const ErrorDataStyle: CSSProperties = {
  fontSize: 22,
  color: 'red',
};

const NoRecordFoundStyle: CSSProperties = {
  color: 'orange',
  fontSize: 36,
};

interface SearchResultRowProps {
  label: string;
  text?: string | null;
  dataStyle: CSSProperties;
}

const SearchResultRow = ({ label, text, dataStyle }: SearchResultRowProps) => (
  <Row gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      <span style={dataStyle}>{text}</span>
    </Col>
  </Row>
);

interface SearchResultProps {
  cnicNumbers: string[];
}

const SearchResult = ({ cnicNumbers }: SearchResultProps) => {
  const { data, loading } = useQuery(SECURITY_VISITOR_BY_CNIC, {
    variables: { cnicNumbers },
    fetchPolicy: 'network-only',
  });
  const securityVisitorByCnic = data?.securityVisitorByCnic;

  if (cnicNumbers.length === 0) return null;
  if (loading) return <Spin size="large" />;

  if (!securityVisitorByCnic) {
    return (
      <Row justify="start" align="middle" gutter={16}>
        <Col>
          <ExclamationCircleTwoTone
            style={NoRecordFoundStyle}
            twoToneColor={NoRecordFoundStyle.color}
          />
        </Col>
        <Col>
          <div style={NoRecordFoundStyle}>
            No records found against scanned CNIC.
          </div>
        </Col>
      </Row>
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
  const image = url ? (
    <img src={url} style={{ width: '250px' }} alt={name ?? 'Visitor'} />
  ) : null;

  let dataStyle: CSSProperties = DataStyle;
  if (otherNotes) dataStyle = WarningDataStyle;
  if (criminalRecord) dataStyle = ErrorDataStyle;

  return (
    <Row justify="space-between" gutter={16}>
      <Col order={1}>
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
      </Col>
      <Col order={2} span={16}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Stay History" key="1">
            <VisitorStaysList
              visitorId={_id ?? ''}
              showDutyColumn
              showNewButton
              showActionsColumn
            />
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  );
};

export default SearchResult;
