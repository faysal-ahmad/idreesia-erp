import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { VisitorStays } from 'meteor/idreesia-common/server/collections/security';
import { getVisitorStays } from 'meteor/idreesia-common/server/graphql-api/security/visitor-stay/queries';

import type { CommitteeFeatureHandler } from './types';

// The report only reads Security's visitor stays, so there is nothing to set
// up outside the ERP when it is turned on or off.
export const nightStayReportHandler: CommitteeFeatureHandler = {
  enable: () => Promise.resolve(),
  disable: () => Promise.resolve(),
};

export interface NightStaysFilter {
  // DD-MM-YYYY (Formats.DATE_FORMAT). Stays covering this date are returned,
  // including ones that started on an earlier day.
  stayDate: string;
  name?: string | null;
  city?: string | null;
  stayReason?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

interface StayVisitor {
  sharedData?: {
    name?: string;
    imageId?: string;
    imageThumbnailId?: string;
    imageKey?: string;
    imageThumbnailKey?: string;
  };
  visitorData?: {
    city?: string;
    country?: string;
  };
}

interface StayRow {
  _id: string;
  visitorId: string;
  fromDate?: Date;
  toDate?: Date;
  numOfDays?: number;
  stayReason?: string;
  stayAllowedBy?: string;
  // From the $lookup in getVisitorStays.
  visitor?: StayVisitor[];
}

// Only the fields the report shows: no CNIC, contact details, criminal record
// or notes, since committee members aren't Security staff.
const toNightStay = (stay: StayRow, visitor: StayVisitor | null | undefined) => {
  const images = getPersonImageUrls(visitor?.sharedData);
  return {
    _id: stay._id,
    visitorId: stay.visitorId,
    fromDate: stay.fromDate,
    toDate: stay.toDate,
    numOfDays: stay.numOfDays,
    stayReason: stay.stayReason,
    stayAllowedBy: stay.stayAllowedBy,
    visitorName: visitor?.sharedData?.name,
    visitorImageUrl: images.imageUrl,
    visitorImageThumbnailUrl: images.imageThumbnailUrl,
    city: visitor?.visitorData?.city,
    country: visitor?.visitorData?.country,
  };
};

/**
 * The visitor stays for one night (cancelled ones left out), for committees
 * with the Night Stay Report feature.
 */
export const getNightStays = async (filter: NightStaysFilter) => {
  // Cancelled stays aren't part of the report.
  const params = new URLSearchParams({ excludeCancelled: 'true' });
  Object.entries(filter).forEach(([key, value]) => {
    if (value != null && value !== '') params.set(key, String(value));
  });

  const { data, totalResults } = (await getVisitorStays(
    `?${params.toString()}`
  )) as unknown as { data: StayRow[]; totalResults: number };

  return {
    totalResults,
    data: data.map(stay => toNightStay(stay, stay.visitor?.[0])),
  };
};

const STAY_HISTORY_SIZE = 5;

/**
 * A visitor's latest stays, newest first, not counting `excludeStayId` (the
 * stay on show) or cancelled stays. Dates and reason only.
 */
export const getNightStayHistory = async (
  visitorId: string,
  excludeStayId: string
) => {
  const stays = (await VisitorStays.find(
    {
      visitorId: { $eq: visitorId },
      _id: { $ne: excludeStayId },
      cancelledDate: { $exists: false },
    },
    { sort: { fromDate: -1, _id: 1 }, limit: STAY_HISTORY_SIZE }
  ).fetchAsync()) as unknown as StayRow[];

  return stays.map(stay => ({
    _id: stay._id,
    fromDate: stay.fromDate,
    toDate: stay.toDate,
    numOfDays: stay.numOfDays,
    stayReason: stay.stayReason,
  }));
};

/** One stay from the report, or null if it doesn't exist or was cancelled. */
export const getNightStayById = async (stayId: string) => {
  const stay = (await VisitorStays.findOneAsync({
    _id: { $eq: stayId },
    cancelledDate: { $exists: false },
  })) as StayRow | undefined;
  if (!stay) return null;

  const visitor = (await People.findOneAsync({
    _id: { $eq: stay.visitorId },
  })) as StayVisitor | undefined;
  return toNightStay(stay, visitor);
};
