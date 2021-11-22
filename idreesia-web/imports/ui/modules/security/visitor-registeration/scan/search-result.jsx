import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';
import { ExclamationCircleTwoTone } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Col, Row, Spin, Tabs } from 'antd';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';
import { VisitorMulakaatsList } from '/imports/ui/modules/security/visitor-mulakaats';

import { SECURITY_VISITOR_BY_CNIC } from '../gql';

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

const SearchResultRow = ({ label, text, dataStyle }) => (
  <Row type="flex" gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      <span style={dataStyle}>{text}</span>
    </Col>
  </Row>
);

SearchResultRow.propTypes = {
  label: PropTypes.string,
  text: PropTypes.string,
  dataStyle: PropTypes.object,
};

const SearchResult = props => {
  const { cnicNumbers, loading, securityVisitorByCnic } = props;
  if (cnicNumbers.length === 0) return null;
  if (loading) return <Spin size="large" />;

  if (!securityVisitorByCnic) {
    return (
      <Row type="flex" justify="start" align="middle" gutter={16}>
        <Col>
          <ExclamationCircleTwoTone
            style={NoRecordFoundStyle}
            twoToneColor={NoRecordFoundStyle.color}
          />
        </Col>
        <Col>
          <div style={NoRecordFoundStyle}>
            {'No records found against scanned CNIC.'}
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
  const image = url ? <img src={url} style={{ width: '250px' }} /> : null;

  let dataStyle = DataStyle;
  if (otherNotes) dataStyle = WarningDataStyle;
  if (criminalRecord) dataStyle = ErrorDataStyle;

  return (
    <Row type="flex" justify="space-between" gutter={16}>
      <Col order={1}>
        {image}
        <SearchResultRow label="Name" text={name} dataStyle={dataStyle} />
        <SearchResultRow label="CNIC" text={cnicNumber} dataStyle={dataStyle} />
        <SearchResultRow label="S/O" text={parentName} dataStyle={dataStyle} />
        <SearchResultRow
          label="Ehad Date"
          text={moment(Number(ehadDate)).format('MMMM, YYYY')}
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
          <Tabs.TabPane tab="Stay History" key="1">
            <VisitorStaysList
              visitorId={_id}
              showDutyColumn
              showNewButton
              showActionsColumn
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Mulakaat History" key="2">
            <VisitorMulakaatsList
              visitorId={_id}
              showNewButton
              showActionsColumn
            />
          </Tabs.TabPane>
        </Tabs>
      </Col>
    </Row>
  );
};

SearchResult.propTypes = {
  loading: PropTypes.bool,
  cnicNumbers: PropTypes.array,
  securityVisitorByCnic: PropTypes.object,
};

export default flowRight(
  graphql(SECURITY_VISITOR_BY_CNIC, {
    props: ({ data }) => ({ ...data }),
    options: ({ cnicNumbers }) => ({
      variables: { cnicNumbers },
      fetchPolicy: 'network-only',
    }),
  })
)(SearchResult);
