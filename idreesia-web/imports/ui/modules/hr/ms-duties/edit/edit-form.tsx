import React from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Empty, Spin, Tabs } from 'antd';
import { type RouteComponentProps } from 'react-router';

import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type {
  DutyByIdQuery,
  DutyByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import GeneralInfo from './general-info';
import DutyShifts from './duty-shifts';

type Props = RouteComponentProps<{ dutyId: string }>;

const TAB_GENERAL = 'general';
const TAB_SHIFTS = 'shifts';

const VALID_TAB_KEYS = new Set([TAB_GENERAL, TAB_SHIFTS]);

const DUTY_BY_ID: TypedDocumentNode<DutyByIdQuery, DutyByIdQueryVariables> =
  gql`
    query dutyById($id: String!) {
      dutyById(id: $id) {
        _id
        name
        description
        attendanceSheet
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
    }
  `;

const normalizeTabKey = (key: string) => {
  if (key === TAB_GENERAL || key === '1') return TAB_GENERAL;
  if (key === TAB_SHIFTS || key === '2') return TAB_SHIFTS;
  return VALID_TAB_KEYS.has(key) ? key : TAB_GENERAL;
};

const EditForm = ({ match, location, history }: Props) => {
  const dutyId = match.params.dutyId;
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['default-active-tab'],
    paramDefaultValues: { 'default-active-tab': TAB_GENERAL },
  });

  const activeKey = normalizeTabKey(
    String(queryParams['default-active-tab'] || TAB_GENERAL)
  );

  const { data, loading } = useQuery(DUTY_BY_ID, {
    variables: { id: dutyId },
  });
  const duty = data?.dutyById;
  const dutyName = duty?.name?.trim();

  useDynamicBreadcrumbs(['HR', 'Duties & Shifts', dutyName || 'Edit']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!duty?._id) {
    return <Empty description="Duty not found" style={{ padding: '80px 0' }} />;
  }

  return (
    <Tabs
      activeKey={activeKey}
      onChange={key => {
        setPageParams({ 'default-active-tab': key });
      }}
      items={[
        {
          key: TAB_GENERAL,
          label: 'General Info',
          children: (
            <GeneralInfo history={history} dutyId={dutyId} duty={duty} />
          ),
        },
        {
          key: TAB_SHIFTS,
          label: 'Shifts',
          children: <DutyShifts dutyId={dutyId} />,
        },
      ]}
    />
  );
};

export default EditForm;
