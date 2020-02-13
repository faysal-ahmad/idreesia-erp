import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { KarkunsAttendanceList } from '/imports/ui/modules/helpers/controls';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';

import {
  useAllCities,
  useAllCityMehfils,
} from '/imports/ui/modules/outstation/common/hooks';
import { OUTSTATION_ATTENDANCE_BY_MONTH } from './gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['month', 'cityId', 'cityMehfilId'],
    paramDefaultValues: {
      month: moment()
        .startOf('month')
        .format(Formats.MONTH_FORMAT),
    },
  });

  const { month, cityId, cityMehfilId } = queryParams;
  const { data, loading } = useQuery(OUTSTATION_ATTENDANCE_BY_MONTH, {
    variables: {
      month,
      cityId,
      cityMehfilId,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Attendance Sheets', 'List']));
  }, [location]);

  if (loading || allCitiesLoading || allCityMehfilsLoading) return null;
  const { outstationAttendanceByMonth } = data;

  const handleKarkunSelected = ({ karkun }) => {
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  return (
    <KarkunsAttendanceList
      readOnly
      month={month}
      cityId={cityId}
      cityMehfilId={cityMehfilId}
      cities={allCities}
      cityMehfils={allCityMehfils}
      attendance={outstationAttendanceByMonth}
      handleKarkunSelected={handleKarkunSelected}
      setPageParams={setPageParams}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
