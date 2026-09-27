import { ModulePaths } from 'meteor/idreesia-common/constants';

const visitors = `${ModulePaths.security}/visitors`;

export const SecurityPaths = {
  visitors,
  visitorsPhotoSearch: `${visitors}/photo-search`,
  /** Route pattern for a visitor's detail screen. */
  visitorDetailPattern: `${visitors}/:visitorId`,
  visitorDetail: (visitorId: string) => `${visitors}/${visitorId}`,
};
