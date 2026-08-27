import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Empty, Spin, Tabs } from 'antd';

import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';

import GeneralInfo from './general-info';
import AttachmentsList from './attachments-list';
import EmploymentInfo from './employment-info';
import SalarySheets from './salary-sheets';
import { HR_KARKUN_BY_ID } from '../gql';

type Props = RouteComponentProps<{ employeeId: string }>;

const TAB_GENERAL = 'general';
const TAB_ATTACHMENTS = 'attachments';
const TAB_EMPLOYMENT = 'employment';
const TAB_SALARIES = 'salaries';

const VALID_TAB_KEYS = new Set([
  TAB_GENERAL,
  TAB_ATTACHMENTS,
  TAB_EMPLOYMENT,
  TAB_SALARIES,
]);

const normalizeTabKey = (key: string) => {
  // Current keys, plus legacy numeric / removed-tab URLs
  if (
    key === TAB_GENERAL ||
    key === '1' ||
    key === '2' ||
    key === '3' ||
    key === '4' ||
    key === '5' ||
    key === 'wazaif' ||
    key === 'duties' ||
    key === 'attendance'
  ) {
    return TAB_GENERAL;
  }
  if (key === TAB_ATTACHMENTS || key === '6') return TAB_ATTACHMENTS;
  if (key === TAB_EMPLOYMENT || key === '7') return TAB_EMPLOYMENT;
  if (key === TAB_SALARIES || key === '8') return TAB_SALARIES;
  return VALID_TAB_KEYS.has(key) ? key : TAB_GENERAL;
};

const EditForm = ({ match, location, history }: Props) => {
  const employeeId = match.params.employeeId;
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['default-active-tab'],
    paramDefaultValues: { 'default-active-tab': TAB_GENERAL },
  });

  const activeKey = normalizeTabKey(
    String(queryParams['default-active-tab'] || TAB_GENERAL)
  );

  const { data, loading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: employeeId },
  });

  const employee = data?.hrKarkunById;
  const employeeName = employee?.sharedData?.name?.trim();

  useDynamicBreadcrumbs(['HR', 'Employees', employeeName || 'Edit']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!employee) {
    return (
      <Empty description="Employee not found" style={{ padding: '80px 0' }} />
    );
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
            <GeneralInfo
              history={history}
              employeeId={employeeId}
              employee={employee}
            />
          ),
        },
        {
          key: TAB_EMPLOYMENT,
          label: 'Employment Info',
          children: (
            <EmploymentInfo employeeId={employeeId} history={history} />
          ),
        },
        {
          key: TAB_SALARIES,
          label: 'Salary Sheets',
          children: <SalarySheets employeeId={employeeId} />,
        },
        {
          key: TAB_ATTACHMENTS,
          label: 'File Attachments',
          children: <AttachmentsList employeeId={employeeId} />,
        },
      ]}
    />
  );
};

export default EditForm;
