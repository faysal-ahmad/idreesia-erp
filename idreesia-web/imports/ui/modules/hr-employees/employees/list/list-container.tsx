import React from 'react';
import { type RouteComponentProps } from 'react-router';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { PagedHrEmployeesQuery } from 'meteor/idreesia-common/types/client-operations';
import { HrEmployeesSubModulePaths as paths } from '/imports/ui/modules/hr-employees';

import List from './list';
import { type PageParams } from './list-filter';

type HrKarkunRow = NonNullable<
  NonNullable<
    NonNullable<PagedHrEmployeesQuery['pagedHrEmployees']>['data']
  >[number]
>;

type Props = RouteComponentProps;

const ListContainer = ({ history, location }: Props) => {
  useBreadcrumbs(['HR - Employees', 'Employees', 'List']);
  const { queryParams } = useQueryParams({ history, location });

  const setPageParams = (newParams: PageParams) => {
    const {
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      jobId,
      status,
      pageIndex,
      pageSize,
    } = newParams;

    const nameVal = Object.prototype.hasOwnProperty.call(newParams, 'name')
      ? name || ''
      : String(queryParams.name || '');

    const cnicNumberVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'cnicNumber'
    )
      ? cnicNumber || ''
      : String(queryParams.cnicNumber || '');

    const phoneNumberVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'phoneNumber'
    )
      ? phoneNumber || ''
      : String(queryParams.phoneNumber || '');

    const bloodGroupVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'bloodGroup'
    )
      ? bloodGroup || ''
      : String(queryParams.bloodGroup || '');

    const jobIdVal = Object.prototype.hasOwnProperty.call(newParams, 'jobId')
      ? jobId || ''
      : String(queryParams.jobId || '');

    const statusVal = Object.prototype.hasOwnProperty.call(newParams, 'status')
      ? status || ''
      : String(queryParams.status || '');

    const pageIndexVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'pageIndex'
    )
      ? toSafeInteger(pageIndex) || 0
      : toSafeInteger(queryParams.pageIndex) || 0;

    const pageSizeVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'pageSize'
    )
      ? toSafeInteger(pageSize) || 20
      : toSafeInteger(queryParams.pageSize) || 20;

    const path = `${location.pathname}?name=${nameVal}&cnicNumber=${cnicNumberVal}&phoneNumber=${phoneNumberVal}&bloodGroup=${bloodGroupVal}&jobId=${jobIdVal}&status=${statusVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  const handlePrintClicked = (employee: HrKarkunRow) => {
    if (!employee._id) return;
    history.push(paths.employeePrintPath(employee._id));
  };

  const handleAuditLogClicked = (employee: HrKarkunRow) => {
    if (!employee._id) return;
    history.push(`${paths.auditLogsPath}?entityId=${employee._id}`);
  };

  const handleItemSelected = (employee: HrKarkunRow) => {
    if (!employee._id) return;
    history.push(paths.employeeEditFormPath(employee._id));
  };

  const handlePrintSelected = (employees: HrKarkunRow[]) => {
    const employeeIds = employees
      .map(employee => employee._id)
      .filter((id): id is string => Boolean(id));
    history.push(
      `${paths.employeesPrintListPath}?karkunIds=${employeeIds.join(',')}`
    );
  };

  const {
    pageIndex,
    pageSize,
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    jobId,
    status,
  } = queryParams;

  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <List
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      name={String(name || '')}
      cnicNumber={String(cnicNumber || '')}
      phoneNumber={String(phoneNumber || '')}
      bloodGroup={String(bloodGroup || '')}
      jobId={String(jobId || '')}
      status={String(status || '')}
      setPageParams={setPageParams}
      handleItemSelected={handleItemSelected}
      showAddEmployeeButton
      showDownloadButton
      showSelectionColumn
      showPhoneNumbersColumn
      showDutiesColumn
      showActionsColumn
      handlePrintClicked={handlePrintClicked}
      handleAuditLogClicked={handleAuditLogClicked}
      handlePrintSelected={handlePrintSelected}
    />
  );
};

export default ListContainer;
