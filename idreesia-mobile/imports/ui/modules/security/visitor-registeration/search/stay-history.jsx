import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import moment from 'moment';

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { List, WingBlank, WhiteSpace } from '/imports/ui/controls';

import PAGED_VISITOR_STAYS from '../gql/paged-visitor-stays';

const Item = List.Item;
const Brief = Item.Brief;

const formattedStayDetail = visitorStay => {
  const fromDate = moment(Number(visitorStay.fromDate));
  const toDate = moment(Number(visitorStay.toDate));
  const days = visitorStay.numOfDays;

  let formattedString;
  if (days === 1) {
    formattedString = `1 day - [${fromDate.format('DD MMM, YYYY')}]`;
  } else {
    formattedString = `${days} days - [${fromDate.format(
      'DD MMM, YYYY'
    )} - ${toDate.format('DD MMM, YYYY')}]`;
  }

  if (visitorStay.cancelledDate) {
    formattedString = `${formattedString} - Cancelled`;
  }

  return formattedString;
};

const StayHistory = ({ visitorId }) => {
  const { data, loading } = useQuery(PAGED_VISITOR_STAYS, {
    variables: {
      visitorId,
    },
  });

  if (loading) return null;
  const { pagedVisitorStaysByVisitorId: visitorStays } = data;

  const listNodes = visitorStays.data.map(visitorStay => {
    const reason = find(
      StayReasons,
      ({ _id }) => _id === visitorStay.stayReason
    );

    return (
      <Item key={visitorStay._id}>
        {formattedStayDetail(visitorStay)}
        <Brief>Stay Reason: {reason ? reason.name : ''}</Brief>
        <Brief>Stay Allowed By: {visitorStay.stayAllowedBy}</Brief>
      </Item>
    );
  });

  return <List>{listNodes}</List>;
};

StayHistory.propTypes = {
  visitorId: PropTypes.string,
};

export default StayHistory;
