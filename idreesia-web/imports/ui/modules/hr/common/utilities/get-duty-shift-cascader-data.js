import { filter } from "lodash";

export default function getDutyShiftCascaderData(allDuties, allDutyShifts) {
  const data = allDuties.map(duty => {
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
