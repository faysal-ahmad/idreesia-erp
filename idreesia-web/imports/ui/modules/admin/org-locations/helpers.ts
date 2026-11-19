import type { OrgLocationType } from 'meteor/idreesia-common/constants/organization';
import type { AllOrgLocationsQuery } from 'meteor/idreesia-common/types/client-operations';

import type { LocationFormValues } from './location-form';
import type { LocationRecord } from './org-location-types';

export const toLocationRecords = (
  rows: AllOrgLocationsQuery['allOrgLocations'] | undefined
): LocationRecord[] =>
  (rows ?? []).flatMap(row =>
    row?._id && row.name && row.type
      ? [
          {
            _id: row._id,
            name: row.name,
            type: row.type as OrgLocationType,
            parentId: row.parentId,
            allParentIds: (row.allParentIds ?? []).filter(
              (id): id is string => id != null
            ),
            observerCount: (row.observerKarkunIds ?? []).length,
            committees: (row.committees ?? []).flatMap(committee =>
              committee?._id && committee.name
                ? [{ _id: committee._id, name: committee.name }]
                : []
            ),
          },
        ]
      : []
  );

export const toMehfilDetails = (values: LocationFormValues) => ({
  address: values.address,
  mehfilStartYear: values.mehfilStartYear,
  timingDetails: values.timingDetails,
  lcdAvailability: !!values.lcdAvailability,
  tabAvailability: !!values.tabAvailability,
  otherMehfilDetails: values.otherMehfilDetails,
});
