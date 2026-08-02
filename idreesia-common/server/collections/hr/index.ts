import { Mongo } from 'meteor/mongo';

export { default as Jobs } from './jobs';
export { default as Duties } from './duties';
export { default as DutyShifts } from './duty-shifts';
export { default as DutyLocations } from './duty-locations';
export { default as KarkunDuties } from './karkun-duties';
export { default as Attendances } from './attendances';
export { default as Salaries } from './salaries';

export const Karkuns = new Mongo.Collection<Record<string, any>>('hr-karkuns');
