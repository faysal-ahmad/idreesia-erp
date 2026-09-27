import React, { useEffect, useState } from 'react';
import { Badge, SearchBar, Tag } from 'antd-mobile';
import { CameraOutline, CloseOutline, FilterOutline } from 'antd-mobile-icons';
import { useQuery } from '@apollo/client/react';
import { ModulePaths } from 'meteor/idreesia-common/constants';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';

import { PagedList } from '../../../components';
import { usePagedQuery } from '../../../hooks';
import { Page } from '../../../layout';
import { useHistory } from '../../../router';
import { SecurityPaths } from '../paths';
import { MOBILE_ALL_PEOPLE_TAGS, MOBILE_PAGED_SECURITY_VISITORS } from './gql';
import { parseVisitorSearch } from './parse-search';
import { type VisitorFilters, VisitorFiltersPopup } from './visitor-filters-popup';
import { VisitorListItem } from './visitor-list-item';

const SEARCH_DEBOUNCE_MS = 350;

export const VisitorsListScreen = () => {
  const history = useHistory();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<VisitorFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { distinctCities } = useDistinctCities('cache-first');
  const { data: tagsData } = useQuery(MOBILE_ALL_PEOPLE_TAGS);
  const tags = (tagsData?.allPeopleTags ?? []).flatMap(tag =>
    tag?._id ? [{ _id: tag._id, name: tag.name ?? '' }] : []
  );

  const search = parseVisitorSearch(debouncedSearch);
  // A partial number leaves the search out (and shows a hint) rather than
  // querying for something that can't match.
  const filter = {
    ...filters,
    ...(search.kind === 'name' ? { name: search.name } : {}),
    ...(search.kind === 'cnic' ? { cnicNumber: search.cnicNumber } : {}),
    ...(search.kind === 'phone' ? { phoneNumber: search.phoneNumber } : {}),
  };

  const paged = usePagedQuery(MOBILE_PAGED_SECURITY_VISITORS, {
    filter,
    getPage: data => data.pagedSecurityVisitors,
    getKey: visitor => visitor._id,
  });

  const activeFilterCount = [filters.city, filters.tagId].filter(Boolean).length;
  const tagName = tags.find(tag => tag._id === filters.tagId)?.name;

  return (
    <Page
      backTo={ModulePaths.security}
      right={
        <div className="page-nav-actions">
          <CameraOutline
            aria-label="Search by photo"
            className="page-nav-action"
            onClick={() => history.push(SecurityPaths.visitorsPhotoSearch)}
          />
          <Badge content={activeFilterCount || null}>
            <FilterOutline
              aria-label="Filters"
              className="page-nav-action"
              onClick={() => setShowFilters(true)}
            />
          </Badge>
        </div>
      }
      title="Visitors"
    >
      <div className="list-toolbar">
        <SearchBar
          clearable
          placeholder="Name, CNIC or phone number"
          value={searchText}
          onChange={setSearchText}
          onClear={() => setDebouncedSearch('')}
          onSearch={() => setDebouncedSearch(searchText)}
        />
        {search.kind === 'partialNumber' && (
          <p className="list-toolbar-hint">
            Enter the full CNIC (13 digits) or phone number (11 digits).
          </p>
        )}
        {activeFilterCount > 0 && (
          <div className="list-filter-chips">
            {filters.city && (
              <Tag
                color="primary"
                fill="outline"
                onClick={() => setFilters(f => ({ ...f, city: undefined }))}
              >
                {filters.city} <CloseOutline />
              </Tag>
            )}
            {filters.tagId && (
              <Tag
                color="primary"
                fill="outline"
                onClick={() => setFilters(f => ({ ...f, tagId: undefined }))}
              >
                {tagName ?? 'Tag'} <CloseOutline />
              </Tag>
            )}
          </div>
        )}
      </div>

      <PagedList
        emptyDescription={
          debouncedSearch || activeFilterCount
            ? 'Try a different search or clear the filters.'
            : undefined
        }
        emptyTitle="No visitors found"
        getKey={visitor => visitor._id ?? ''}
        itemsLabel="visitors"
        paged={paged}
        renderItem={visitor => <VisitorListItem visitor={visitor} />}
      />

      <VisitorFiltersPopup
        cities={distinctCities ?? []}
        tags={tags}
        value={filters}
        visible={showFilters}
        onApply={value => {
          setFilters(value);
          setShowFilters(false);
        }}
        onClose={() => setShowFilters(false)}
      />
    </Page>
  );
};
