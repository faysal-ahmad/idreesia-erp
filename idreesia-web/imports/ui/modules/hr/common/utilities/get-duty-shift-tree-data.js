import { filter } from 'meteor/idreesia-common/utilities/lodash';

export default function getDutyShiftTreeData(allMSDuties, allDutyShifts) {
  const data = allMSDuties.map(duty => {
    const dutyShifts = filter(
      allDutyShifts,
      dutyShift => dutyShift.dutyId === duty._id
    );
    const dataItem = {
      value: duty._id,
      title: duty.name,
      key: duty._id,
      children: dutyShifts.map(dutyShift => ({
        value: dutyShift._id,
        title: dutyShift.name,
        key: dutyShift._id,
      })),
    };

    return dataItem;
  });

  return data;
}
