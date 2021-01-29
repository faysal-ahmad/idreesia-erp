import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import ReactToPrint from 'react-to-print';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { Button, Divider } from '/imports/ui/controls';

import { ATTENDANCE_BY_MONTH } from '../../gql';
import AttendanceSheet from './attendance-sheet';

const AttendanceSheetContainer = ({ history, location }) => {
  const attendanceSheet = useRef(null);
  const dispatch = useDispatch();
  const { queryParams } = useQueryParams({ history, location });

  const { data, loading, error } = useQuery(ATTENDANCE_BY_MONTH, {
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

  const { attendanceByMonth } = data;
  return (
    <>
      <ReactToPrint
        content={() => attendanceSheet.current}
        trigger={() => (
          <Button size="large" type="primary" icon="printer">
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
      <AttendanceSheet ref={attendanceSheet} month={queryParams.selectedMonth} attendanceByMonth={attendanceByMonth} />
    </>
  );
};

AttendanceSheetContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default AttendanceSheetContainer;
