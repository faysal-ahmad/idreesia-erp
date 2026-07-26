import { filter } from 'meteor/idreesia-common/utilities/lodash';

interface Duty {
  _id: string;
  name: string;
}

interface DutyShift {
  _id: string;
  name: string;
  dutyId: string;
}

export default function getDutyShiftTreeData(
  allMSDuties: Duty[],
  allDutyShifts: DutyShift[]
) {
  const data = allMSDuties.map(duty => {
    const dutyShifts = filter(
      allDutyShifts,
      (dutyShift: DutyShift) => dutyShift.dutyId === duty._id
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
