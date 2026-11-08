// Visitor stays are created for the next day's date after 6 PM (see
// createVisitorStay), so "tonight" means tomorrow's date from 6 PM onwards.
const NIGHT_STARTS_AT_HOUR = 18;

/** The date of tonight's stays, at the start of that day (local time). */
export const getNightStayDate = (now: Date = new Date()): Date => {
  const date = new Date(now);
  if (date.getHours() >= NIGHT_STARTS_AT_HOUR) {
    date.setDate(date.getDate() + 1);
  }
  date.setHours(0, 0, 0, 0);
  return date;
};
