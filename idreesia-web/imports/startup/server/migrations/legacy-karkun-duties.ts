import { Mongo } from 'meteor/mongo';

// The KarkunDuties collection was removed from the app; migration 51 still
// reads it to attach duty locations to their duties, and migration 54 drops it.
export const LegacyKarkunDuties = new Mongo.Collection('hr-karkun-duties');
