import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';

import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';
import { KarkunAttendancesList } from '/imports/ui/modules/helpers/controls';

import { PAGED_OUTSTATION_ATTENDANCE_BY_KARKUN } from '../gql';

const getQueryString = (pageIndex, pageSize) =>
  `?pageIndex=${pageIndex}&pageSize=${pageSize}`;

const AttendanceSheets = ({ karkunId }) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const { data, loading } = useQuery(PAGED_OUTSTATION_ATTENDANCE_BY_KARKUN, {
    variables: {
      karkunId,
      queryString: getQueryString(pageIndex, pageSize),
    },
  });

  const onPageParamsChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  if (loading) return null;
  const { pagedOutstationAttendanceByKarkun } = data;

  return (
    <KarkunAttendancesList
      pageSize={pageSize}
      pageIndex={pageIndex}
      onPageParamsChange={onPageParamsChange}
      pagedAttendances={pagedOutstationAttendanceByKarkun}
    />
  );
};

AttendanceSheets.propTypes = {
  karkunId: PropTypes.string,
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default AttendanceSheets;
