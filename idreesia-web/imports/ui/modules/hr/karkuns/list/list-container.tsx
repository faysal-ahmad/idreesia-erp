import React from 'react';
import { type RouteComponentProps } from 'react-router';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List from './list';
import type { PageParams } from './list-filter';

type Props = RouteComponentProps;

const ListContainer = ({ history, location }: Props) => {
  const { queryParams } = useQueryParams({ history, location });
  useBreadcrumbs(['HR', 'Karkuns', 'List']);

  const setPageParams = (newParams: PageParams) => {
    const {
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      lastTarteeb,
      jobId,
      dutyId,
      dutyShiftId,
      karkunType,
      pageIndex,
      pageSize,
    } = newParams;

    let showVolunteersVal: string;
    let showEmployeesVal: string;
    if (Object.prototype.hasOwnProperty.call(newParams, 'karkunType')) {
      showVolunteersVal =
        karkunType?.indexOf('volunteers') !== -1 ? 'true' : 'false';
      showEmployeesVal =
        karkunType?.indexOf('employees') !== -1 ? 'true' : 'false';
    } else {
      showVolunteersVal = (queryParams.showVolunteers as string) || 'true';
      showEmployeesVal = (queryParams.showEmployees as string) || 'true';
    }

    const nameVal = Object.prototype.hasOwnProperty.call(newParams, 'name')
      ? name || ''
      : (queryParams.name as string) || '';

    const cnicNumberVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'cnicNumber'
    )
      ? cnicNumber || ''
      : (queryParams.cnicNumber as string) || '';

    const phoneNumberVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'phoneNumber'
    )
      ? phoneNumber || ''
      : (queryParams.phoneNumber as string) || '';

    const bloodGroupVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'bloodGroup'
    )
      ? bloodGroup || ''
      : (queryParams.bloodGroup as string) || '';

    const lastTarteebVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'lastTarteeb'
    )
      ? lastTarteeb || ''
      : (queryParams.lastTarteeb as string) || '';

    const jobIdVal = Object.prototype.hasOwnProperty.call(newParams, 'jobId')
      ? jobId || ''
      : (queryParams.jobId as string) || '';

    const dutyIdVal = Object.prototype.hasOwnProperty.call(newParams, 'dutyId')
      ? dutyId || ''
      : (queryParams.dutyId as string) || '';

    const dutyShiftIdVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'dutyShiftId'
    )
      ? dutyShiftId || ''
      : (queryParams.dutyShiftId as string) || '';

    const pageIndexVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'pageIndex'
    )
      ? pageIndex ?? 0
      : toSafeInteger(queryParams.pageIndex) || 0;

    const pageSizeVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'pageSize'
    )
      ? pageSize ?? 20
      : toSafeInteger(queryParams.pageSize) || 20;

    const path = `${location.pathname}?name=${nameVal}&cnicNumber=${cnicNumberVal}&phoneNumber=${phoneNumberVal}&bloodGroup=${bloodGroupVal}&lastTarteeb=${lastTarteebVal}&jobId=${jobIdVal}&dutyId=${dutyIdVal}&dutyShiftId=${dutyShiftIdVal}&showVolunteers=${showVolunteersVal}&showEmployees=${showEmployeesVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  const handleNewClicked = () => {
    history.push(paths.karkunsNewFormPath);
  };

  const handleScanClicked = () => {
    history.push(paths.karkunsScanCardPath);
  };

  const handlePrintClicked = (karkun: { _id?: string | null }) => {
    history.push(paths.karkunsPrintPath(karkun._id ?? ''));
  };

  const handleAuditLogClicked = (karkun: { _id?: string | null }) => {
    history.push(`${paths.auditLogsPath}?entityId=${karkun._id}`);
  };

  const handleItemSelected = (karkun: { _id?: string | null }) => {
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  const handlePrintSelected = (karkuns: Array<{ _id?: string | null }>) => {
    const karkunIds = karkuns.map((karkun) => karkun._id);
    history.push(
      `${paths.karkunsPrintListPath}?karkunIds=${karkunIds.join(',')}`
    );
  };

  const {
    pageIndex,
    pageSize,
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    lastTarteeb,
    jobId,
    dutyId,
    dutyShiftId,
    showVolunteers,
    showEmployees,
  } = queryParams;

  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <List
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      name={name as string}
      cnicNumber={cnicNumber as string}
      phoneNumber={phoneNumber as string}
      bloodGroup={bloodGroup as string}
      lastTarteeb={lastTarteeb as string}
      jobId={jobId as string}
      dutyId={dutyId as string}
      dutyShiftId={dutyShiftId as string}
      showVolunteers={(showVolunteers as string) || 'true'}
      showEmployees={(showEmployees as string) || 'true'}
      setPageParams={setPageParams}
      handleItemSelected={handleItemSelected}
      showNewButton
      showDownloadButton
      showSelectionColumn
      showPhoneNumbersColumn
      showDutiesColumn
      showActionsColumn
      handleNewClicked={handleNewClicked}
      handleScanClicked={handleScanClicked}
      handlePrintClicked={handlePrintClicked}
      handleAuditLogClicked={handleAuditLogClicked}
      handlePrintSelected={handlePrintSelected}
    />
  );
};

export default ListContainer;
