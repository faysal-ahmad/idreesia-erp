import { filter } from 'meteor/idreesia-common/utilities/lodash';

export default function getDutyShiftCascaderData(allMSDuties, allDutyShifts) {
  const data = allMSDuties.map(duty => {
    const dutyShifts = filter(
      allDutyShifts,
      dutyShift => dutyShift.dutyId === duty._id
    );
    const dataItem = {
      value: duty._id,
      label: duty.name,
      children: dutyShifts.map(dutyShift => ({
        value: dutyShift._id,
        label: dutyShift.name,
      })),
    };

    return dataItem;
  });

  return data;
}
