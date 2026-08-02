import React from 'react';
import { type RouteComponentProps } from 'react-router';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { HrPeoplePagedHrKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List from './list';
import { type PageParams } from './list-filter';

type HrKarkunRow = NonNullable<
  NonNullable<
    NonNullable<HrPeoplePagedHrKarkunsQuery['pagedHrKarkuns']>['karkuns']
  >[number]
>;

type Props = RouteComponentProps;

const ListContainer = ({ history, location }: Props) => {
  useBreadcrumbs(['HR', 'People', 'List']);
  const { queryParams } = useQueryParams({ history, location });

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

    let showVolunteersVal;
    let showEmployeesVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'karkunType')) {
      showVolunteersVal =
        karkunType?.indexOf('volunteers') !== -1 ? 'true' : 'false';
      showEmployeesVal =
        karkunType?.indexOf('employees') !== -1 ? 'true' : 'false';
    } else {
      showVolunteersVal = String(queryParams.showVolunteers || 'true');
      showEmployeesVal = String(queryParams.showEmployees || 'true');
    }

    let nameVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'name')) {
      nameVal = name || '';
    } else {
      nameVal = String(queryParams.name || '');
    }

    let cnicNumberVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'cnicNumber')) {
      cnicNumberVal = cnicNumber || '';
    } else {
      cnicNumberVal = String(queryParams.cnicNumber || '');
    }

    let phoneNumberVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'phoneNumber')) {
      phoneNumberVal = phoneNumber || '';
    } else {
      phoneNumberVal = String(queryParams.phoneNumber || '');
    }

    let bloodGroupVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'bloodGroup')) {
      bloodGroupVal = bloodGroup || '';
    } else {
      bloodGroupVal = String(queryParams.bloodGroup || '');
    }

    let lastTarteebVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'lastTarteeb')) {
      lastTarteebVal = lastTarteeb || '';
    } else {
      lastTarteebVal = String(queryParams.lastTarteeb || '');
    }

    let jobIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'jobId')) {
      jobIdVal = jobId || '';
    } else {
      jobIdVal = String(queryParams.jobId || '');
    }

    let dutyIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'dutyId')) {
      dutyIdVal = dutyId || '';
    } else {
      dutyIdVal = String(queryParams.dutyId || '');
    }

    let dutyShiftIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'dutyShiftId')) {
      dutyShiftIdVal = dutyShiftId || '';
    } else {
      dutyShiftIdVal = String(queryParams.dutyShiftId || '');
    }

    let pageIndexVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageIndex')) {
      pageIndexVal = pageIndex ?? 0;
    } else {
      pageIndexVal = queryParams.pageIndex || 0;
    }

    let pageSizeVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageSize')) {
      pageSizeVal = pageSize ?? 20;
    } else {
      pageSizeVal = queryParams.pageSize || 20;
    }

    const path = `${location.pathname}?name=${nameVal}&cnicNumber=${cnicNumberVal}&phoneNumber=${phoneNumberVal}&bloodGroup=${bloodGroupVal}&lastTarteeb=${lastTarteebVal}&jobId=${jobIdVal}&dutyId=${dutyIdVal}&dutyShiftId=${dutyShiftIdVal}&showVolunteers=${showVolunteersVal}&showEmployees=${showEmployeesVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  const handleNewClicked = () => {
    history.push(paths.karkunsNewFormPath);
  };

  const handleScanClicked = () => {
    history.push(paths.karkunsScanCardPath);
  };

  const handlePrintClicked = (karkun: HrKarkunRow) => {
    if (!karkun._id) return;
    history.push(paths.karkunsPrintPath(karkun._id));
  };

  const handleAuditLogClicked = (karkun: HrKarkunRow) => {
    if (!karkun._id) return;
    history.push(`${paths.auditLogsPath}?entityId=${karkun._id}`);
  };

  const handleItemSelected = (karkun: HrKarkunRow) => {
    if (!karkun._id) return;
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  const handlePrintSelected = (karkuns: HrKarkunRow[]) => {
    const karkunIds = karkuns
      .map(karkun => karkun._id)
      .filter((id): id is string => Boolean(id));
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
      name={String(name || '')}
      cnicNumber={String(cnicNumber || '')}
      phoneNumber={String(phoneNumber || '')}
      bloodGroup={String(bloodGroup || '')}
      lastTarteeb={String(lastTarteeb || '')}
      jobId={String(jobId || '')}
      dutyId={String(dutyId || '')}
      dutyShiftId={String(dutyShiftId || '')}
      showVolunteers={String(showVolunteers || 'true')}
      showEmployees={String(showEmployees || 'true')}
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
