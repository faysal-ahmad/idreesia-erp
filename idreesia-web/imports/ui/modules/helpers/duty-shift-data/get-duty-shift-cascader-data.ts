import { filter } from 'meteor/idreesia-common/utilities/lodash';

interface Duty {
  _id?: string | null;
  name?: string | null;
}

interface DutyShift {
  _id?: string | null;
  name?: string | null;
  dutyId?: string | null;
}

export default function getDutyShiftCascaderData(
  allMSDuties: Duty[],
  allDutyShifts: DutyShift[]
) {
  const data = allMSDuties
    .filter((duty): duty is Duty & { _id: string } => Boolean(duty._id))
    .map(duty => {
      const dutyShifts = filter(
        allDutyShifts,
        (dutyShift: DutyShift) => dutyShift.dutyId === duty._id && Boolean(dutyShift._id)
      );
      const dataItem = {
        value: duty._id,
        label: duty.name ?? '',
        children: dutyShifts.map(dutyShift => ({
          value: dutyShift._id as string,
          label: dutyShift.name ?? '',
        })),
      };

      return dataItem;
    });

  return data;
}
