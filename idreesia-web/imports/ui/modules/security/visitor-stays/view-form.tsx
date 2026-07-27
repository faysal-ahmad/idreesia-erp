import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { List } from 'antd';

const AntList = List as any;
interface VisitorStay { fromDate: string | number; toDate: string | number; numOfDays: number; stayReason?: string; stayAllowedBy?: string; dutyShiftName?: string; }
interface VisitorStayData { visitorStayById?: VisitorStay | null; }
interface ViewFormProps { visitorStayId: string; }

const ViewForm = ({ visitorStayId }: ViewFormProps) => {
  const { data = {}, loading } = useQuery(formQuery as any, {
    variables: { _id: visitorStayId },
  });
  const { visitorStayById } = data as VisitorStayData;
  const formDataLoading = loading;
  if (formDataLoading || !visitorStayById) return null;

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
      ({ _id }: { _id: string }) => _id === visitorStayById.stayReason
    );
    stayReason = (reason as { name?: string } | undefined)?.name;
  }

  return (
    <AntList>
      <AntList.Item>
        <b>Stay Detail:</b> {detail}
      </AntList.Item>
      <AntList.Item>
        <b>Stay Allowed By:</b> {visitorStayById.stayAllowedBy}
      </AntList.Item>
      <AntList.Item>
        <b>Stay Reason:</b> {stayReason}
      </AntList.Item>
      <AntList.Item>
        <b>Duty / Shift:</b> {visitorStayById.dutyShiftName}
      </AntList.Item>
    </AntList>
  );
};

ViewForm.propTypes = {
  visitorStayId: PropTypes.string,
  formDataLoading: PropTypes.bool,
  visitorStayById: PropTypes.object,
};

const formQuery = gql`
  query visitorStayById($_id: String!) {
    visitorStayById(_id: $_id) {
      _id
      visitorId
      fromDate
      toDate
      numOfDays
      stayReason
      stayAllowedBy
      dutyShiftName
    }
  }
`;

export default ViewForm;
