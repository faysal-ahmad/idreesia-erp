import React, { useEffect, useState } from 'react';
import { SearchBar } from 'antd-mobile';
import { CameraOutline } from 'antd-mobile-icons';
import { ModulePaths } from 'meteor/idreesia-common/constants';

import { PagedList } from '../../../components';
import { usePagedQuery } from '../../../hooks';
import { Page } from '../../../layout';
import { useHistory } from '../../../router';
import { SecurityPaths } from '../paths';
import { MOBILE_PAGED_SECURITY_VISITORS } from './gql';
import { parseVisitorSearch } from './parse-search';
import { VisitorListItem } from './visitor-list-item';

const SEARCH_DEBOUNCE_MS = 350;

export const VisitorsListScreen = () => {
  const history = useHistory();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const search = parseVisitorSearch(debouncedSearch);
  // A partial number leaves the search out (and shows a hint) rather than
  // querying for something that can't match.
  const filter = {
    ...(search.kind === 'name' ? { name: search.name } : {}),
    ...(search.kind === 'cnic' ? { cnicNumber: search.cnicNumber } : {}),
    ...(search.kind === 'phone' ? { phoneNumber: search.phoneNumber } : {}),
  };

  const paged = usePagedQuery(MOBILE_PAGED_SECURITY_VISITORS, {
    filter,
    getPage: data => data.pagedSecurityVisitors,
    getKey: visitor => visitor._id,
  });

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
      </div>

      <PagedList
        emptyDescription={debouncedSearch ? 'Try a different name, CNIC or phone number.' : undefined}
        emptyTitle="No visitors found"
        getKey={visitor => visitor._id ?? ''}
        itemsLabel="visitors"
        paged={paged}
        renderItem={visitor => (
          <VisitorListItem
            visitor={visitor}
            onClick={() => visitor._id && history.push(SecurityPaths.visitorDetail(visitor._id))}
          />
        )}
      />
    </Page>
  );
};
