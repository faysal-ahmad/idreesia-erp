import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import dayjs from 'dayjs';
import { Col, Divider, Row, Spin, Tabs } from 'antd';
import { CheckCircleTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { VisitorImdadRequestsList } from '/imports/ui/modules/operations/visitor-imdad-requests';

import { OPERATIONS_VISITORS_BY_CNIC } from '../gql';

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 22,
};

const DataStyle = {
  fontSize: 22,
};

const NoRecordFoundStyle = {
  color: 'orange',
  fontSize: 36,
};

const RecordFoundStyle = {
  color: 'green',
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

const SearchResult = ({ visitor }) => {
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
  } = visitor;

  const url = getDownloadUrl(imageId);
  const image = url ? <img src={url} style={{ width: '250px' }} /> : null;

  return (
    <Row type="flex" justify="space-between" gutter={16}>
      <Col order={1}>
        {image}
        <SearchResultRow label="Name" text={name} dataStyle={DataStyle} />
        <SearchResultRow label="CNIC" text={cnicNumber} dataStyle={DataStyle} />
        <SearchResultRow label="S/O" text={parentName} dataStyle={DataStyle} />
        <SearchResultRow
          label="Ehad Date"
          text={dayjs(Number(ehadDate)).format('MMMM, YYYY')}
          dataStyle={DataStyle}
        />
        <SearchResultRow
          label="R/O"
          text={referenceName}
          dataStyle={DataStyle}
        />
        <SearchResultRow
          label="Phone"
          text={contactNumber1}
          dataStyle={DataStyle}
        />
        <SearchResultRow label="City" text={city} dataStyle={DataStyle} />
        <SearchResultRow label="Country" text={country} dataStyle={DataStyle} />
      </Col>
      <Col order={2} span={16}>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Imdad Requests" key="1">
            <VisitorImdadRequestsList visitorId={_id} />
          </Tabs.TabPane>
        </Tabs>
      </Col>
    </Row>
  );
};

SearchResult.propTypes = {
  visitor: PropTypes.object,
};

const SearchResults = props => {
  const {
    cnicNumbers,
    partialCnicNumber,
    loading,
    operationsVisitorsByCnic: visitors,
  } = props;

  if (cnicNumbers.length === 0 && !partialCnicNumber) return null;
  if (loading) return <Spin size="large" />;

  if (visitors.length === 0) {
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
            {'No records found against CNIC.'}
          </div>
        </Col>
      </Row>
    );
  }

  const resultNodes = [
    <Row type="flex" justify="center" align="middle" gutter={16}>
      <Col>
        <CheckCircleTwoTone
          style={RecordFoundStyle}
          twoToneColor={RecordFoundStyle.color}
        />
      </Col>
      <Col>
        <div style={RecordFoundStyle}>
          {visitors.length === 1
            ? '1 record found against CNIC.'
            : `${visitors.length} records found against CNIC.`}
        </div>
      </Col>
    </Row>,
  ];

  visitors.forEach(visitor => {
    resultNodes.push(<Divider />);
    resultNodes.push(<SearchResult key={visitor._id} visitor={visitor} />);
  });

  return resultNodes;
};

SearchResults.propTypes = {
  loading: PropTypes.bool,
  cnicNumbers: PropTypes.array,
  partialCnicNumber: PropTypes.string,
  operationsVisitorsByCnic: PropTypes.array,
};

export default flowRight(
  graphql(OPERATIONS_VISITORS_BY_CNIC, {
    props: ({ data }) => ({ ...data }),
    options: ({ cnicNumbers, partialCnicNumber }) => ({
      variables: { cnicNumbers, partialCnicNumber },
      fetchPolicy: 'network-only',
    }),
  })
)(SearchResults);
