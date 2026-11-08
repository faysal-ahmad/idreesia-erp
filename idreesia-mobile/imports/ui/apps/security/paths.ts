import { ModulePaths } from 'meteor/idreesia-common/constants';

const visitors = `${ModulePaths.security}/visitors`;
const stayReport = `${ModulePaths.security}/stay-report`;

export const SecurityPaths = {
  visitors,
  visitorsPhotoSearch: `${visitors}/photo-search`,
  /** Route pattern for a visitor's detail screen. */
  visitorDetailPattern: `${visitors}/:visitorId`,
  visitorDetail: (visitorId: string) => `${visitors}/${visitorId}`,
  stayReport,
  /** A visitor opened from the stay report; kept under the report so back returns to it. */
  stayReportVisitorPattern: `${stayReport}/:visitorId`,
  stayReportVisitor: (visitorId: string) => `${stayReport}/${visitorId}`,
};
