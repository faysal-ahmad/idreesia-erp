import React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { type History } from 'history';
import { type Location } from 'history';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { Spin } from 'antd';
import {
  useAllMSDuties,
  useAllDutyLocations,
  useAllDutyShifts,
} from '/imports/ui/modules/hr/common/hooks';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List, { type AttendanceListRow, type ListProps } from './list';

export interface AttendanceReportPageParams {
  selectedMonth?: string;
  dutyId?: string;
  locationId?: string;
  shiftId?: string;
}

type SelectionParams = Omit<AttendanceReportPageParams, 'selectedMonth'>;

interface ListContainerProps {
  history: History;
  location: Location;
}

// Query string shared by the list and the print pages.
export const sheetQueryString = (params: AttendanceReportPageParams) =>
  new URLSearchParams({
    selectedMonth: params.selectedMonth ?? '',
    dutyId: params.dutyId ?? '',
    locationId: params.locationId ?? '',
    shiftId: params.shiftId ?? '',
  }).toString();

const ListContainer = ({ history, location }: ListContainerProps) => {
  const { queryParams } = useQueryParams({
    history,
    location,
    paramNames: ['selectedMonth', 'dutyId', 'locationId', 'shiftId'],
  });
  useBreadcrumbs(['HR', 'Attendance Report', 'List']);

  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allDutyLocations, allDutyLocationsLoading } = useAllDutyLocations();
  const { allDutyShifts, allDutyShiftsLoading } = useAllDutyShifts();

  const pageParams = queryParams as AttendanceReportPageParams;
  const selectedMonth = pageParams.selectedMonth
    ? dayjs(`01-${pageParams.selectedMonth}`, Formats.DATE_FORMAT)
    : dayjs();
  const currentParams: AttendanceReportPageParams = {
    ...pageParams,
    selectedMonth: selectedMonth.format('MM-YYYY'),
  };

  const handleMonthChange = (month: Dayjs) => {
    history.push(
      `${location.pathname}?${sheetQueryString({
        ...currentParams,
        selectedMonth: month.format('MM-YYYY'),
      })}`
    );
  };

  const handleSelectionChange = (selection: SelectionParams) => {
    history.push(
      `${location.pathname}?${sheetQueryString({
        selectedMonth: currentParams.selectedMonth,
        ...selection,
      })}`
    );
  };

  // One card per karkun: the barcode identifies a karkun for the month.
  const selectedKarkunIds = (rows: AttendanceListRow[]) =>
    [...new Set(rows.map(row => row.karkunId))].join(',');

  const handleViewMeetingCards = (rows: AttendanceListRow[], cardType: string) => {
    if (rows.length === 0) return;
    history.push(
      `${paths.attendanceReportMeetingCardsPath}?${sheetQueryString(
        currentParams
      )}&cardType=${cardType}&karkunIds=${selectedKarkunIds(rows)}`
    );
  };

  const handleViewKarkunCards = (rows: AttendanceListRow[]) => {
    if (rows.length === 0) return;
    history.push(
      `${paths.attendanceReportKarkunCardsPath}?${sheetQueryString(
        currentParams
      )}&karkunIds=${selectedKarkunIds(rows)}`
    );
  };

  const handlePrintKarkunsList = (rows: AttendanceListRow[]) => {
    if (rows.length === 0) return;
    history.push(
      `${paths.karkunsPrintListPath}?karkunIds=${selectedKarkunIds(rows)}`
    );
  };

  const handlePrintAttendanceSheet = () => {
    history.push(
      `${paths.attendanceReportPrintSheetPath}?${sheetQueryString(
        currentParams
      )}`
    );
  };

  const handleItemSelected = (karkun: { _id: string }) => {
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  if (allMSDutiesLoading || allDutyLocationsLoading || allDutyShiftsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const msDuties = (allMSDuties ?? []).filter(
    row => row != null && row._id != null && row.name != null
  ) as ListProps['allMSDuties'];
  const dutyLocations = (allDutyLocations ?? []).filter(
    row => row != null && row._id != null && row.name != null && row.dutyId != null
  ) as ListProps['allDutyLocations'];
  const dutyShifts = (allDutyShifts ?? []).filter(
    row => row != null && row._id != null && row.name != null && row.dutyId != null
  ) as ListProps['allDutyShifts'];

  return (
    <List
      selectedMonth={selectedMonth}
      dutyId={pageParams.dutyId || undefined}
      locationId={pageParams.locationId || undefined}
      shiftId={pageParams.shiftId || undefined}
      onMonthChange={handleMonthChange}
      onSelectionChange={handleSelectionChange}
      handleViewMeetingCards={handleViewMeetingCards}
      handleViewKarkunCards={handleViewKarkunCards}
      handlePrintKarkunsList={handlePrintKarkunsList}
      handlePrintAttendanceSheet={handlePrintAttendanceSheet}
      handleItemSelected={handleItemSelected}
      allMSDuties={msDuties}
      allDutyLocations={dutyLocations}
      allDutyShifts={dutyShifts}
    />
  );
};

export default ListContainer;
