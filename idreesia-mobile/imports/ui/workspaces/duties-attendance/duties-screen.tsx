import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, CheckList, List, Popup, PullToRefresh, Tag } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';

import { useOnlineStatus } from '../../hooks';
import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess } from '../../layout';
import { useHistory, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { MOBILE_DA_ADD_DUTIES, MOBILE_DA_MEHFIL_DUTIES } from './gql';
import { useDaAccess, useDuties } from './hooks';

/** Workspace → Duties & Attendance → Duties: the mehfil's duties; tap one for its roster. */
export const DutiesScreen = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const history = useHistory();
  const online = useOnlineStatus();
  const { canManageDuties } = useDaAccess(locationId);
  const { duties, loading, error, refetch } = useDuties(locationId);
  const [adding, setAdding] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // The duties the administrators defined; only asked for while adding.
  const { data: templates, loading: templatesLoading } = useQuery(MOBILE_DA_MEHFIL_DUTIES, {
    variables: { locationId },
    skip: !adding,
    fetchPolicy: 'cache-and-network',
  });
  const [addDuties] = useMutation(MOBILE_DA_ADD_DUTIES);

  // A duty the location already has can't be chosen again.
  const used = new Set(duties.map(duty => duty.mehfilDutyId));
  const available = (templates?.workspaceDaMehfilDuties ?? []).filter(
    (duty): duty is NonNullable<typeof duty> => duty != null && !used.has(duty._id),
  );

  const closeAdd = () => {
    setAdding(false);
    setChosen([]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await addDuties({ variables: { locationId, mehfilDutyIds: chosen } });
      showSuccess(chosen.length === 1 ? 'Duty added.' : `${chosen.length} duties added.`);
      closeAdd();
      await refetch();
    } catch (failure) {
      showError(failure, 'Could not add the duties.');
    } finally {
      setSaving(false);
    }
  };

  let content;
  if (loading) {
    content = <PageLoading />;
  } else if (error) {
    content = <PageError error={error} onRetry={() => refetch()} />;
  } else {
    content = (
      <PullToRefresh onRefresh={() => refetch().then(() => undefined, () => undefined)}>
        {duties.length === 0 ? (
          <PageEmpty
            description={canManageDuties ? 'Tap + to add the duties this mehfil uses.' : undefined}
            title="No duties yet"
          />
        ) : (
          <List mode="card">
            {duties.map(duty => (
              <List.Item
                key={duty._id}
                description={[
                  `${(duty.members ?? []).length} members`,
                  duty.description,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                extra={
                  <Tag color={duty.isActive ? 'success' : 'default'} fill="outline">
                    {duty.isActive ? 'Active' : 'Inactive'}
                  </Tag>
                }
                onClick={() => duty._id && history.push(WorkspacesPaths.duty(locationId, duty._id))}
              >
                {duty.name}
              </List.Item>
            ))}
          </List>
        )}
      </PullToRefresh>
    );
  }

  return (
    <Page
      backTo={WorkspacesPaths.root}
      right={canManageDuties && online ? <AddOutline aria-label="Add duty" onClick={() => setAdding(true)} /> : undefined}
      title="Duties"
    >
      {content}
      <Popup bodyClassName="da-popup" position="bottom" visible={adding} onMaskClick={closeAdd}>
        <div className="da-popup-header">
          <span className="da-popup-title">Add duties</span>
        </div>
        <p className="da-popup-hint">Duties are defined by the administrators. Choose the ones this mehfil uses.</p>
        <div className="da-popup-body">
          {templatesLoading && !templates ? (
            <PageLoading />
          ) : available.length === 0 ? (
            <PageEmpty title="No more duties to add" />
          ) : (
            <CheckList multiple value={chosen} onChange={values => setChosen(values as string[])}>
              {available.map(duty => (
                <CheckList.Item key={duty._id} description={duty.description ?? undefined} value={duty._id}>
                  {duty.name}
                </CheckList.Item>
              ))}
            </CheckList>
          )}
        </div>
        <div className="da-popup-footer">
          <Button block color="primary" disabled={chosen.length === 0} loading={saving} onClick={save}>
            {chosen.length > 1 ? `Add ${chosen.length} duties` : 'Add duty'}
          </Button>
        </div>
      </Popup>
    </Page>
  );
};
