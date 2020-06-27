import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import ReactToPrint from 'react-to-print';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { sortBy } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Divider } from '/imports/ui/controls';

import { ATTENDANCE_BY_MONTH } from '../../gql';
import KarkunList from './karkun-list';

const PrintView = ({ history, location }) => {
  const karkunsList = useRef(null);
  const dispatch = useDispatch();
  const { queryParams } = useQueryParams({ history, location });

  const { data, loading } = useQuery(ATTENDANCE_BY_MONTH, {
    variables: {
      month: queryParams.month,
      categoryId: queryParams.categoryId,
      subCategoryId: queryParams.subCategoryId,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Attendance Sheets', 'Print Karkuns']));
  }, [location]);

  if (loading) return null;

  const { attendanceByMonth } = data;
  const sortedAttendanceByMonth = sortBy(attendanceByMonth, 'karkun.name');

  return (
    <>
      <ReactToPrint
        content={() => karkunsList.current}
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
      <KarkunList
        ref={karkunsList}
        attendanceByMonth={sortedAttendanceByMonth}
      />
    </>
  );
};

PrintView.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default PrintView;
