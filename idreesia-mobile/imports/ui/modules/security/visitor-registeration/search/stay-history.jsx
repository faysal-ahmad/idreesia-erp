import React from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed } from '@fortawesome/free-solid-svg-icons/faBed';

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { Button, List, Toast, WhiteSpace } from '/imports/ui/controls';

import PAGED_VISITOR_STAYS from '../gql/paged-visitor-stays';
import CREATE_VISITOR_STAY from '../gql/create-visitor-stay';

const Item = List.Item;
const Brief = Item.Brief;

const IconStyle = { fontSize: 20 };

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
  const [createVisitorStay] = useMutation(CREATE_VISITOR_STAY, {
    refetchQueries: ['pagedVisitorStaysByVisitorId'],
    awaitRefetchQueries: true,
  });
  const { data, loading } = useQuery(PAGED_VISITOR_STAYS, {
    variables: {
      visitorId,
    },
  });

  if (loading) return null;
  const { pagedVisitorStaysByVisitorId: visitorStays } = data;

  const handleAddStay = () => {
    createVisitorStay({
      variables: {
        visitorId,
        numOfDays: 1,
      },
    }).catch(err => {
      Toast.fail(err.message, 2);
    });
  };

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

  return (
    <List>
      <WhiteSpace />
      <Button
        type="primary"
        onClick={handleAddStay}
        icon={<FontAwesomeIcon icon={faBed} style={IconStyle} />}
      >
        Add Stay
      </Button>
      {listNodes}
    </List>
  );
};

StayHistory.propTypes = {
  visitorId: PropTypes.string,
};

export default StayHistory;
