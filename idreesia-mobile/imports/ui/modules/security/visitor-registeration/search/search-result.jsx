import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useQuery } from '@apollo/react-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';

import {
  ActivityIndicator,
  List,
  Result,
  Tabs,
  WingBlank,
  WhiteSpace,
  SearchResultRow,
} from '/imports/ui/controls';

import StayHistory from './stay-history';
import SECURITY_VISITOR_BY_CNIC_OR_CONTACT_NUMBER from '../gql/security-visitor-by-cnic-or-contact-number';

const IconStyle = { fontSize: 50, margin: 0, color: 'red' };
const TabContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: '#fff',
};

const tabs = [
  { title: 'Visitor Info' },
  { title: 'Picture' },
  { title: 'Stay History' },
];

const SearchResult = ({ cnicNumber, contactNumber }) => {
  const { data, loading } = useQuery(
    SECURITY_VISITOR_BY_CNIC_OR_CONTACT_NUMBER,
    {
      variables: {
        cnicNumber,
        contactNumber,
      },
    }
  );

  if (!cnicNumber && !contactNumber) return null;
  if (loading) {
    return <ActivityIndicator text="Loading..." />;
  }

  const { securityVisitorByCnicOrContactNumber: visitor } = data;
  if (!visitor) {
    return (
      <Result
        img={<FontAwesomeIcon icon={faTimesCircle} style={IconStyle} />}
        title="Not Found"
      />
    );
  }

  return (
    <WingBlank>
      <Tabs tabs={tabs} animated={false}>
        <div style={TabContainerStyle}>
          <List>
            <WhiteSpace size="sm" />
            <SearchResultRow label="Name" data={visitor.name} />
            <WhiteSpace size="sm" />
            <SearchResultRow label="CNIC" data={visitor.cnicNumber} />
            <WhiteSpace size="sm" />
            <SearchResultRow label="S/O" data={visitor.parentName} />
            <WhiteSpace size="sm" />
            <SearchResultRow
              label="Ehad Date"
              data={moment(Number(visitor.ehadDate)).format('MMMM, YYYY')}
            />
            <WhiteSpace size="sm" />
            <SearchResultRow label="R/O" data={visitor.referenceName} />
            <WhiteSpace size="sm" />
            <SearchResultRow label="Mobile No." data={visitor.contactNumber1} />
            <WhiteSpace size="sm" />
            <SearchResultRow label="Phone No." data={visitor.contactNumber2} />
            <WhiteSpace size="sm" />
            <SearchResultRow label="City" data={visitor.city} />
            <WhiteSpace size="sm" />
            <SearchResultRow label="Country" data={visitor.country} />
            <WhiteSpace size="lg" />
          </List>
        </div>
        <div style={TabContainerStyle}>
          <img src={getDownloadUrl(visitor.imageId)} />
        </div>
        <div style={TabContainerStyle}>
          <StayHistory visitorId={visitor._id} />
        </div>
      </Tabs>
    </WingBlank>
  );
};

SearchResult.propTypes = {
  cnicNumber: PropTypes.string,
  contactNumber: PropTypes.string,
};

export default SearchResult;
