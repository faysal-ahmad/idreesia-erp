import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';

import { ATTENDANCE_BY_MONTH } from '../../gql';
import AttendanceSheet from './attendance-sheet';

const PrintControl = ReactToPrint as any;
const PrintButton = Button as any;
const AntDivider = Divider as any;
const AntPrinterOutlined = PrinterOutlined as any;
const AttendanceSheetView = AttendanceSheet as any;
interface HistoryLike { goBack(): void; push(path: string): void; }
interface LocationLike { pathname: string; search: string; }
interface ContainerProps { history: HistoryLike; location: LocationLike; }
interface QueryData { attendanceByMonth?: unknown[]; }

const AttendanceSheetContainer = ({ history, location }: ContainerProps) => {
  const attendanceSheet = useRef<any>(null);
  const dispatch = useDispatch<any>();
  const { queryParams } = useQueryParams({ history, location });

  const { data, loading, error } = useQuery(ATTENDANCE_BY_MONTH as any, {
    variables: {
      month: `01-${queryParams.selectedMonth}`,
      categoryId: queryParams.selectedCategoryId,
      subCategoryId: queryParams.selectedSubCategoryId,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Attendance Sheets', 'Print Attendance Sheet']));
  }, [location]);

  if (loading || error) return null;

  const { attendanceByMonth = [] } = (data ?? {}) as QueryData;
  return (
    <>
      <PrintControl
        content={() => attendanceSheet.current}
        trigger={() => (
          <PrintButton size="large" type="primary" icon={<AntPrinterOutlined />}>
            Print Data
          </PrintButton>
        )}
      />
      &nbsp;
      <PrintButton
        size="large"
        type="primary"
        onClick={() => {
          history.goBack();
        }}
      >
        Back
      </PrintButton>
      <AntDivider />
      <AttendanceSheetView ref={attendanceSheet} month={queryParams.selectedMonth} attendanceByMonth={attendanceByMonth} />
    </>
  );
};

AttendanceSheetContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default AttendanceSheetContainer;
