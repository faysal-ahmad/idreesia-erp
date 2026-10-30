import { Mongo } from 'meteor/mongo';

export { default as Mehfils } from './mehfils';
export { default as MehfilDuties } from './mehfil-duties';
export { default as MehfilKarkuns } from './mehfil-karkuns';
export { default as MehfilLangarDetails } from './mehfil-langar-details';
export { default as MehfilLangarDishes } from './mehfil-langar-dishes';
export { default as MehfilLangarLocations } from './mehfil-langar-locations';
export { default as VisitorStays } from './visitor-stays';
export { default as SecurityServerChannels } from './security-server-channels';
export { default as SecurityServerProfiles } from './security-server-profiles';
export { default as SecurityServerAlerts } from './security-server-alerts';
export {
  SecurityServerUsageServerStats,
  SecurityServerUsageChannelStats,
} from './security-server-usage-stats';
export type {
  SecurityServerUsageServerStatsDocument,
  SecurityServerUsageChannelStatsDocument,
} from './security-server-usage-stats';

export const Visitors = new Mongo.Collection<Record<string, any>>(
  'security-visitors'
) as Mongo.Collection<Record<string, any>> & {
  isCnicInUse(cnicNumber: string): Promise<boolean>;
  isContactNumberInUse(contactNumber: string): Promise<boolean>;
};
export const VisitorMulakaats = new Mongo.Collection(
  'security-visitor-mulakaats'
);
