export function separateDutyAndShifts(
  dutyIdShiftIds,
  allMSDuties,
  allMSDutyShifts
) {
  // Iterate through the dutyIdShiftIds and separate out
  // dutyIds from the shiftIds
  const dutyIds = [];
  const dutyShiftIds = [];
  dutyIdShiftIds.forEach(dutyIdShiftId => {
    const duty = allMSDuties.find(msDuty => msDuty._id === dutyIdShiftId);
    if (duty) {
      dutyIds.push(duty._id);
    } else {
      const shift = allMSDutyShifts.find(
        msDutyShift => msDutyShift._id === dutyIdShiftId
      );
      if (shift) {
        dutyShiftIds.push(shift._id);
      }
    }
  });

  return {
    dutyIds,
    dutyShiftIds,
  };
}
