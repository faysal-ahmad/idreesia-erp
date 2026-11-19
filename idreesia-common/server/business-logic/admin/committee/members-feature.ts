import type { CommitteeFeatureHandler } from './types';

// The members list only reads the committee itself, so there is nothing to set
// up outside the ERP when it is turned on or off.
export const membersHandler: CommitteeFeatureHandler = {
  enable: () => Promise.resolve(),
  disable: () => Promise.resolve(),
};
