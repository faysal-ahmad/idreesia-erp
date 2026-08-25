import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import {
  PersonGeneralList,
  PersonGeneralListFilter,
  PersonGeneralListFilterChips,
} from '/imports/ui/modules/common';
import type { PersonListItem } from '/imports/ui/modules/common/visitors/list';
import { ALL_PEOPLE_TAGS } from '/imports/ui/modules/admin/people-tags/gql';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import { PAGED_DELETED_PEOPLE } from './gql';

type Props = RouteComponentProps;

const List = ({ history, location }: Props) => {
  useBreadcrumbs(['Admin', 'Deleted Data', 'People']);

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'name',
      'cnicNumber',
      'phoneNumber',
      'city',
      'ehadDuration',
      'additionalInfo',
      'updatedBetween',
      'tagId',
      'pageIndex',
      'pageSize',
    ],
  });

  const { distinctCities, distinctCitiesRefetch } = useDistinctCities(
    'cache-first'
  );
  const { data: peopleTagsData } = useQuery(ALL_PEOPLE_TAGS);
  const { data, refetch } = useQuery(PAGED_DELETED_PEOPLE, {
    variables: { filter: queryParams },
  });

  const {
    name,
    cnicNumber,
    phoneNumber,
    city,
    ehadDuration,
    additionalInfo,
    updatedBetween,
    tagId,
    pageIndex,
    pageSize,
  } = queryParams;

  const filterTags = (peopleTagsData?.allPeopleTags ?? []).flatMap((tag) =>
    tag?._id ? [{ _id: tag._id, name: tag.name }] : []
  );

  const refreshData = async () => {
    await refetch();
    await distinctCitiesRefetch();
  };

  const handleFilterSetPageParams = (params: {
    pageIndex?: string | number;
    name?: string;
    cnicNumber?: string;
    phoneNumber?: string;
    city?: string;
    ehadDuration?: string;
    additionalInfo?: string;
    updatedBetween?: string;
    tagId?: string;
  }) => {
    setPageParams(params);
  };

  const handleListSetPageParams = (params: { pageIndex: string; pageSize: string }) => {
    setPageParams(params);
  };

  const handleSelectItem = (person: PersonListItem) => {
    history.push(paths.deletedPersonEditFormPath(person._id));
  };

  const filterProps = {
    name: name as string | undefined,
    cnicNumber: cnicNumber as string | undefined,
    phoneNumber: phoneNumber as string | undefined,
    city: city as string | undefined,
    ehadDuration: ehadDuration as string | undefined,
    additionalInfo: additionalInfo as string | undefined,
    updatedBetween: updatedBetween as string | undefined,
    tagId: tagId as string | undefined,
    showAdditionalInfoFilter: true,
    distinctCities: distinctCities ?? [],
    tags: filterTags,
    setPageParams: handleFilterSetPageParams,
    refreshData,
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section" />
      <div className="list-table-header-utilities">
        <PersonGeneralListFilter {...filterProps} />
        <PersonGeneralListFilterChips {...filterProps} />
      </div>
    </div>
  );

  const pagedData = data?.pagedDeletedPeople;
  const pagedDeletedPeople = {
    totalResults: pagedData?.totalResults ?? 0,
    data: (pagedData?.data ?? []).flatMap((person) =>
      person?._id
        ? [
            {
              _id: person._id,
              name: person.sharedData?.name,
              cnicNumber: person.sharedData?.cnicNumber,
              contactNumber1: person.sharedData?.contactNumber1,
              contactNumber2: person.sharedData?.contactNumber2,
              city: person.visitorData?.city,
              country: person.visitorData?.country,
              imageId: person.sharedData?.imageId,
              criminalRecord: person.visitorData?.criminalRecord,
              otherNotes: person.visitorData?.otherNotes,
              isKarkun: person.isKarkun,
              tags: person.sharedData?.tags,
            } as PersonListItem,
          ]
        : []
    ),
  };
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <PersonGeneralList
      showCnicColumn
      showPhoneNumbersColumn
      showCityCountryColumn
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      setPageParams={handleListSetPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedDeletedPeople}
    />
  );
};

export default List;
