import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { type History } from 'history';
import { type Location } from 'history';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';

import AttendanceSheet from './attendance-sheet';
import {
  SHEET_PARAM_NAMES,
  useSheetRows,
  type SheetParams,
} from '../use-sheet-rows';

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
    paramNames: SHEET_PARAM_NAMES,
  });

  const { rows, loading, error } = useSheetRows(queryParams as SheetParams);

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Attendance Report', 'Print Attendance Sheet']));
  }, [dispatch, location]);

  if (loading || error) return null;

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
        rows={rows}
      />
    </>
  );
};

export default AttendanceSheetContainer;
