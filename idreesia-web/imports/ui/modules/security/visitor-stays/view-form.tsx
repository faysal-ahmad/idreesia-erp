import React from 'react';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { List } from 'antd';

import { VIEW_VISITOR_STAY_BY_ID } from './gql';

interface ViewFormProps {
  visitorStayId: string;
}

const ViewForm = ({ visitorStayId }: ViewFormProps) => {
  const { data, loading } = useQuery(VIEW_VISITOR_STAY_BY_ID, {
    variables: { _id: visitorStayId },
  });
  const visitorStayById = data?.visitorStayById;

  if (loading || !visitorStayById) return null;

  const fromDate = dayjs(Number(visitorStayById.fromDate)).format('DD MMM, YYYY');
  const toDate = dayjs(Number(visitorStayById.toDate)).format('DD MMM, YYYY');
  const days = visitorStayById.numOfDays;

  let detail;
  if (days === 1) {
    detail = `1 day - [${fromDate}]`;
  } else {
    detail = `${days} days - [${fromDate} - ${toDate}]`;
  }

  let stayReason;
  if (visitorStayById.stayReason) {
    const reason = find(
      StayReasons,
      ({ _id }) => _id === visitorStayById.stayReason
    );
    stayReason = reason?.name;
  }

  return (
    <List>
      <List.Item>
        <b>Stay Detail:</b> {detail}
      </List.Item>
      <List.Item>
        <b>Stay Allowed By:</b> {visitorStayById.stayAllowedBy}
      </List.Item>
      <List.Item>
        <b>Stay Reason:</b> {stayReason}
      </List.Item>
      <List.Item>
        <b>Duty / Shift:</b> {visitorStayById.dutyShiftName}
      </List.Item>
    </List>
  );
};

export default ViewForm;
