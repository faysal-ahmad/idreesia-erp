import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { type History } from 'history';
import { type Location } from 'history';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';

import { ATTENDANCE_BY_MONTH } from '../../gql';
import AttendanceSheet from './attendance-sheet';

interface ContainerProps {
  history: History;
  location: Location;
}

const AttendanceSheetContainer = ({ history, location }: ContainerProps) => {
  const attendanceSheetRef = useRef<any>(null);
  const dispatch = useDispatch();
  const { queryParams } = useQueryParams({
    history,
    location,
    paramNames: ['selectedMonth', 'selectedCategoryId', 'selectedSubCategoryId'],
  });

  const { data, loading, error } = useQuery(ATTENDANCE_BY_MONTH, {
    variables: {
      month: `01-${queryParams.selectedMonth}`,
      categoryId: queryParams.selectedCategoryId as string | undefined,
      subCategoryId: queryParams.selectedSubCategoryId as string | undefined,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Attendance Sheets', 'Print Attendance Sheet']));
  }, [dispatch, location]);

  if (loading || error) return null;

  const attendanceByMonth = (data?.attendanceByMonth ?? []).filter(row => row != null);

  return (
    <>
      <ReactToPrint
        content={() => attendanceSheetRef.current}
        trigger={() => (
          <Button size="large" type="primary" icon={<PrinterOutlined />}>
            Print Data
          </Button>
        )}
      />
      &nbsp;
      <Button
        size="large"
        type="primary"
        onClick={() => {
          history.goBack();
        }}
      >
        Back
      </Button>
      <Divider />
      <AttendanceSheet
        ref={attendanceSheetRef}
        month={queryParams.selectedMonth as string | undefined}
        attendanceByMonth={attendanceByMonth}
      />
    </>
  );
};

export default AttendanceSheetContainer;
