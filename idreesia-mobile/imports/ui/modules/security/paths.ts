import { ModulePaths } from 'meteor/idreesia-common/constants';

const visitors = `${ModulePaths.security}/visitors`;

export const SecurityPaths = {
  visitors,
  visitorsPhotoSearch: `${visitors}/photo-search`,
};
