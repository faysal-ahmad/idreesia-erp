import React, { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useParams } from 'react-router-dom';

import { Formats } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  usePhysicalStore,
  usePhysicalStoreLocations,
} from '/imports/ui/modules/inventory/common/hooks';

import type { LocationsByPhysicalStoreIdQuery } from 'meteor/idreesia-common/types/client-operations';

import Report from './report';

interface RouteParams {
  physicalStoreId: string;
}

type LocationRow = NonNullable<
  NonNullable<LocationsByPhysicalStoreIdQuery['locationsByPhysicalStoreId']>[number]
> & { _id: string; name: string };

const ReportContainer = () => {
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore, physicalStoreLoading } = usePhysicalStore(physicalStoreId);
  const {
    locationsByPhysicalStoreId,
    locationsByPhysicalStoreIdLoading,
  } = usePhysicalStoreLocations(physicalStoreId);
  const [month, setMonth] = useState<Dayjs>(() => dayjs());

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name, 'Reports', 'Purchasing Report']
      : ['Inventory', 'Reports', 'Purchasing Report']
  );

  if (physicalStoreLoading || locationsByPhysicalStoreIdLoading) {
    return null;
  }

  const monthString = dayjs(month).startOf('month').format(Formats.DATE_FORMAT);

  return (
    <Report
      month={month}
      monthString={monthString}
      physicalStoreId={physicalStoreId}
      locations={(locationsByPhysicalStoreId ?? []).filter(
        (location): location is LocationRow =>
          location != null && location._id != null && location.name != null
      )}
      setPageParams={({ month: nextMonth }) => {
        if (nextMonth) {
          setMonth(nextMonth);
        }
      }}
    />
  );
};

export default ReportContainer;
