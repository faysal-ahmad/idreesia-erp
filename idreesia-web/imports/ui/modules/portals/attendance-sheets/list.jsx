import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { keys, values } from 'meteor/idreesia-common/utilities/lodash';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import {
  usePortal,
  usePortalCities,
  usePortalCityMehfils,
} from 'meteor/idreesia-common/hooks/portals';
import { message } from 'antd';
import { KarkunsAttendanceList } from '/imports/ui/modules/common';

import {
  CREATE_PORTAL_ATTENDANCES,
  UPDATE_PORTAL_ATTENDANCE,
  DELETE_ALL_PORTAL_ATTENDANCES,
  DELETE_PORTAL_ATTENDANCES,
  PORTAL_ATTENDANCE_BY_MONTH,
} from './gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { portalId } = useParams();
  const { portal } = usePortal();
  const { portalCities, portalCitiesLoading } = usePortalCities();
  const {
    portalCityMehfils,
    portalCityMehfilsLoading,
  } = usePortalCityMehfils();
  const [createPortalAttendances] = useMutation(CREATE_PORTAL_ATTENDANCES);
  const [updatePortalAttendance] = useMutation(UPDATE_PORTAL_ATTENDANCE);
  const [deleteAllPortalAttendances] = useMutation(
    DELETE_ALL_PORTAL_ATTENDANCES
  );
  const [deletePortalAttendances] = useMutation(DELETE_PORTAL_ATTENDANCES);
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
  const { data, loading, refetch } = useQuery(PORTAL_ATTENDANCE_BY_MONTH, {
    variables: {
      portalId,
      month,
      cityId,
      cityMehfilId,
    },
  });

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs([
          'Mehfil Portal',
          portal.name,
          'Attendance Sheets',
          'List',
        ])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Attendance Sheets', 'List']));
    }
  }, [location, portal]);

  if (loading || portalCitiesLoading || portalCityMehfilsLoading) return null;
  const { portalAttendanceByMonth } = data;

  const handleCreateMissingAttendances = () => {
    createPortalAttendances({
      variables: {
        portalId,
        month,
      },
    })
      .then(response => {
        refetch();
        message.success(
          `${response.data.createPortalAttendances} missing attendance records have been created.`,
          5
        );
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleDeleteSelectedAttendances = selectedRows => {
    const ids = selectedRows.map(({ _id }) => _id);
    deletePortalAttendances({
      variables: {
        portalId,
        month,
        ids,
      },
    })
      .then(() => {
        refetch();
        message.success('Selected attendance records have been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleDeleteAllAttendances = () => {
    if (cityId) {
      deleteAllPortalAttendances({
        variables: {
          portalId,
          month,
          cityId,
          cityMehfilId,
        },
      })
        .then(() => {
          refetch();
          message.success(
            'All attendance records for the selected city/mehfil in the month have been deleted.',
            5
          );
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    }
  };

  const handleUpdateAttendanceDetails = updatedAttendances => {
    const attendanceIds = keys(updatedAttendances);

    const promises = attendanceIds.map(attendanceId => {
      const attendanceDetails = updatedAttendances[attendanceId];
      let presentCount = 0;
      let lateCount = 0;
      let absentCount = 0;
      let msVisitCount = 0;
      values(attendanceDetails).forEach(val => {
        if (val === 'pr') presentCount++;
        if (val === 'la') lateCount++;
        if (val === 'ab') absentCount++;
        if (val === 'ms') msVisitCount++;
      });

      const total = presentCount + lateCount + absentCount + msVisitCount;
      const percentage = Math.round(((presentCount + lateCount + msVisitCount) / total) * 100);

      return updatePortalAttendance({
        variables: {
          portalId,
          _id: attendanceId,
          attendanceDetails: JSON.stringify(attendanceDetails),
          presentCount,
          lateCount,
          absentCount,
          msVisitCount,
          percentage,
        },
      });
    });

    Promise.all(promises)
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  return (
    <KarkunsAttendanceList
      month={month}
      cityId={cityId}
      cityMehfilId={cityMehfilId}
      cities={portalCities}
      cityMehfils={portalCityMehfils}
      attendance={portalAttendanceByMonth}
      setPageParams={setPageParams}
      handleCreateMissingAttendances={handleCreateMissingAttendances}
      handleDeleteSelectedAttendances={handleDeleteSelectedAttendances}
      handleDeleteAllAttendances={handleDeleteAllAttendances}
      handleUpdateAttendanceDetails={handleUpdateAttendanceDetails}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
