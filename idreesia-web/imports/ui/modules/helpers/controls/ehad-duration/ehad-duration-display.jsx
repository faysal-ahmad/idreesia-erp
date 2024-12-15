import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const EhadDurationDisplay = ({ value }) => {
  const currentDate = dayjs().startOf('day');
  const diffInMonths = currentDate.diff(value, 'months');
  const yearValue =
    diffInMonths < 12 ? 0 : (diffInMonths - (diffInMonths % 12)) / 12;
  const monthValue = diffInMonths < 12 ? diffInMonths : diffInMonths % 12;

  return <div>{`${yearValue}y ${monthValue}m`}</div>;
};

EhadDurationDisplay.propTypes = {
  value: PropTypes.object,
};

export default EhadDurationDisplay;
