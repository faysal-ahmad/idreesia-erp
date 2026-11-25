import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import type { HelperPagedAdminKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import { useReferenceMsDuties } from 'meteor/idreesia-common/hooks/reference-data';
import {
  KarkunsFilterChips,
  KarkunsList,
  KarkunsListFilter,
} from '/imports/ui/modules/common';

import { ADMIN_KARKUN_LOCATIONS, PAGED_ADMIN_KARKUNS } from './gql';

type KarkunRow = NonNullable<
  NonNullable<
    NonNullable<HelperPagedAdminKarkunsQuery['pagedAdminKarkuns']>['data']
  >[number]
>;

interface PageParams {
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  cityLocationId?: string | null;
  mehfilLocationId?: string | null;
  pageIndex?: string;
  pageSize?: string;
}

interface Props {
  handleSelectItem?(item: KarkunRow): void;
}

const List = ({ handleSelectItem }: Props) => {
  const [name, setName] = useState<string | null>(null);
  const [cnicNumber, setCnicNumber] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [cityLocationId, setCityLocationId] = useState<string | null>(null);
  const [mehfilLocationId, setMehfilLocationId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('20');

  const setPageParams = (values: PageParams) => {
    if (Object.prototype.hasOwnProperty.call(values, 'name')) setName(values.name ?? null);
    if (Object.prototype.hasOwnProperty.call(values, 'cnicNumber')) setCnicNumber(values.cnicNumber ?? null);
    if (Object.prototype.hasOwnProperty.call(values, 'phoneNumber'))
      setPhoneNumber(values.phoneNumber ?? null);
    if (Object.prototype.hasOwnProperty.call(values, 'cityLocationId'))
      setCityLocationId(values.cityLocationId ?? null);
    if (Object.prototype.hasOwnProperty.call(values, 'mehfilLocationId'))
      setMehfilLocationId(values.mehfilLocationId ?? null);
    if (Object.prototype.hasOwnProperty.call(values, 'pageIndex')) setPageIndex(values.pageIndex ?? '0');
    if (Object.prototype.hasOwnProperty.call(values, 'pageSize')) setPageSize(values.pageSize ?? '20');
  };

  const { referenceMsDuties: allMSDuties, referenceMsDutiesLoading: allMSDutiesLoading } =
    useReferenceMsDuties();
  const { data: locationsData } = useQuery(ADMIN_KARKUN_LOCATIONS);
  const orgLocations = (locationsData?.adminKarkunLocations ?? []).filter(
    (location) => location != null
  );
  const { data, loading, refetch } = useQuery(PAGED_ADMIN_KARKUNS, {
    variables: {
      filter: {
        name,
        cnicNumber,
        phoneNumber,
        cityLocationId,
        mehfilLocationId,
        pageIndex,
        pageSize,
      },
    },
  });

  if (loading) return null;
  const pagedAdminKarkuns = data?.pagedAdminKarkuns;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getListFilter = () => {
    if (allMSDutiesLoading) {
      return null;
    }

    return (
      <KarkunsListFilter
        showBloodGroupFilter={false}
        showLastTarteebFilter={false}
        showMehfilDutyFilter={false}
        showCityMehfilFilter
        showRegionFilter={false}
        showUpdatedBetweenFilter={false}
        mehfilDuties={(allMSDuties ?? []).filter((item) => item != null)}
        name={name ?? undefined}
        cnicNumber={cnicNumber ?? undefined}
        phoneNumber={phoneNumber ?? undefined}
        cityLocationId={cityLocationId}
        mehfilLocationId={mehfilLocationId}
        orgLocations={orgLocations}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    );
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-utilities">
        {getListFilter()}
        <KarkunsFilterChips
          name={name ?? undefined}
          cnicNumber={cnicNumber ?? undefined}
          phoneNumber={phoneNumber ?? undefined}
          cityLocationId={cityLocationId}
          mehfilLocationId={mehfilLocationId}
          orgLocations={orgLocations}
          setPageParams={setPageParams}
        />
      </div>
    </div>
  );

  return (
    <KarkunsList
      showSelectionColumn={false}
      showCnicColumn
      showPhoneNumbersColumn
      showMehfilCityColumn={false}
      showDutiesColumn={false}
      showDeleteAction={false}
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedAdminKarkuns ?? undefined}
    />
  );
};

export default List;
