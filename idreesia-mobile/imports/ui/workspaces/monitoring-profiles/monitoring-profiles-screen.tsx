import React, { useEffect, useState } from 'react';
import { Checkbox, Image, List, SearchBar, Tag } from 'antd-mobile';
import { toDeviceUrl } from '/imports/startup/backend';

import { PagedList } from '../../components';
import { usePagedQuery } from '../../hooks';
import { Page } from '../../layout';
import { useHistory, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { MOBILE_WORKSPACE_MONITORING_PROFILES } from './gql';

const SEARCH_DEBOUNCE_MS = 350;

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/**
 * Workspace → Monitoring Profiles: the people the security server
 * watches for, by name. Tapping a profile opens it for editing.
 */
export const MonitoringProfilesScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [includeTest, setIncludeTest] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const name = debouncedSearch.trim();
  const paged = usePagedQuery(MOBILE_WORKSPACE_MONITORING_PROFILES, {
    filter: { committeeId, includeTest, ...(name ? { name } : {}) },
    toVariables: (filter, paging) => ({ ...filter, ...paging }),
    getPage: data => data.workspaceMonitoringProfiles,
    getKey: profile => profile._id,
  });

  return (
    <Page backTo={WorkspacesPaths.root} title="Monitoring Profiles">
      <div className="list-toolbar">
        <SearchBar
          clearable
          placeholder="Name"
          value={searchText}
          onChange={setSearchText}
          onClear={() => setDebouncedSearch('')}
          onSearch={() => setDebouncedSearch(searchText)}
        />
      </div>

      <PagedList
        emptyDescription={name ? 'Try a different name.' : undefined}
        emptyTitle="No profiles found"
        getKey={profile => profile._id ?? ''}
        countExtra={
          <Checkbox
            checked={includeTest}
            className="monitoring-profiles-test-toggle"
            onChange={setIncludeTest}
          >
            Show test
          </Checkbox>
        }
        itemsLabel="profiles"
        paged={paged}
        renderItem={profile => {
          // The default photo is first.
          const photos = (profile.photos ?? []).filter(photo => photo?.imageUrl);
          const [firstPhoto] = photos;
          const thumbnailUrl =
            toDeviceUrl(firstPhoto?.thumbnailUrl) ?? toDeviceUrl(firstPhoto?.imageUrl);

          return (
            <List.Item
              description={[plural(photos.length, 'photo'), plural(profile.alertsCount ?? 0, 'alert')].join(' · ')}
              prefix={
                <Image
                  className="monitoring-profile-thumb"
                  fit="cover"
                  src={thumbnailUrl ?? ''}
                />
              }
              onClick={() =>
                profile._id &&
                history.push(WorkspacesPaths.committeeMonitoringProfile(committeeId, profile._id))
              }
            >
              {profile.name}
              {profile.isTest && (
                <Tag className="monitoring-profile-test-tag" fill="outline">
                  Test
                </Tag>
              )}
            </List.Item>
          );
        }}
      />
    </Page>
  );
};
