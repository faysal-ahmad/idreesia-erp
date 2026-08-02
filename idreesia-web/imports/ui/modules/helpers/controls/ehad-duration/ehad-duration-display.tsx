import React from 'react';
import dayjs, { type ConfigType } from 'dayjs';

interface Props {
  value?: ConfigType;
}

const EhadDurationDisplay = ({ value }: Props) => {
  const currentDate = dayjs().startOf('day');
  const diffInMonths = currentDate.diff(value, 'months');
  const yearValue =
    diffInMonths < 12 ? 0 : (diffInMonths - (diffInMonths % 12)) / 12;
  const monthValue = diffInMonths < 12 ? diffInMonths : diffInMonths % 12;

  return <div>{`${yearValue}y ${monthValue}m`}</div>;
};

export default EhadDurationDisplay;
