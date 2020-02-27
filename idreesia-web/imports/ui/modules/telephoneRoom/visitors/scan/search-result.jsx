import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Col, Icon, Row, Spin, Tabs } from '/imports/ui/controls';
import { VisitorMulakaatsList } from '/imports/ui/modules/security/visitor-mulakaats';

import { TELEPHONE_ROOM_VISITOR_BY_CNIC } from '../gql';

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
  const { cnicNumbers, loading, telephoneRoomVisitorByCnic } = props;
  if (cnicNumbers.length === 0) return null;
  if (loading) return <Spin size="large" />;

  if (!telephoneRoomVisitorByCnic) {
    return (
      <Row type="flex" justify="start" align="middle" gutter={16}>
        <Col>
          <Icon
            style={NoRecordFoundStyle}
            type="exclamation-circle"
            theme="twoTone"
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
  } = telephoneRoomVisitorByCnic;

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
          text={moment(Number(ehadDate)).format('MMMM, YYYY')}
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
          <Tabs.TabPane tab="Mulakaat History" key="1">
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
  telephoneRoomVisitorByCnic: PropTypes.object,
};

export default flowRight(
  graphql(TELEPHONE_ROOM_VISITOR_BY_CNIC, {
    props: ({ data }) => ({ ...data }),
    options: ({ cnicNumbers }) => ({
      variables: { cnicNumbers },
      fetchPolicy: 'network-only',
    }),
  })
)(SearchResult);
