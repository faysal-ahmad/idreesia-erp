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
      dutyId,
      dutyShiftId,
      pageIndex,
      pageSize,
    } = newParams;

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
      ? toSafeInteger(pageIndex) || 0
      : toSafeInteger(queryParams.pageIndex) || 0;

    const pageSizeVal = Object.prototype.hasOwnProperty.call(
      newParams,
      'pageSize'
    )
      ? toSafeInteger(pageSize) || 20
      : toSafeInteger(queryParams.pageSize) || 20;

    const path = `${location.pathname}?name=${nameVal}&cnicNumber=${cnicNumberVal}&phoneNumber=${phoneNumberVal}&bloodGroup=${bloodGroupVal}&dutyId=${dutyIdVal}&dutyShiftId=${dutyShiftIdVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  const handleNewClicked = () => {
    history.push(paths.karkunsNewFormPath);
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
    const karkunIds = karkuns.map(karkun => karkun._id);
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
    dutyId,
    dutyShiftId,
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
      dutyId={String(dutyId || '')}
      dutyShiftId={String(dutyShiftId || '')}
      setPageParams={setPageParams}
      handleItemSelected={handleItemSelected}
      showNewButton
      showDownloadButton
      showSelectionColumn
      showPhoneNumbersColumn
      showDutiesColumn
      showActionsColumn
      handleNewClicked={handleNewClicked}
      handlePrintClicked={handlePrintClicked}
      handleAuditLogClicked={handleAuditLogClicked}
      handlePrintSelected={handlePrintSelected}
    />
  );
};

export default ListContainer;
