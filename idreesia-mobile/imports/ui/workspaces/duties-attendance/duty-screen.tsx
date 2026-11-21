import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { ActionSheet, Avatar, Button, CheckList, Dialog, List, Popup, PullToRefresh, Tag } from 'antd-mobile';
import { MoreOutline, UserAddOutline } from 'antd-mobile-icons';
import { toDeviceUrl } from '/imports/startup/backend';

import { useOnlineStatus } from '../../hooks';
import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess, useNavigateBack } from '../../layout';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { DAYS_OF_WEEK } from './dates';
import {
  MOBILE_DA_ADD_DUTY_MEMBER,
  MOBILE_DA_REMOVE_DUTY,
  MOBILE_DA_REMOVE_DUTY_MEMBER,
  MOBILE_DA_UPDATE_DUTY,
  MOBILE_DA_UPDATE_DUTY_MEMBER,
} from './gql';
import { useDaAccess, useDuties, type DutyMember } from './hooks';
import { InfoNote } from './info-note';
import { KarkunSearchPopup } from './karkun-search-popup';

const daysOf = (member: DutyMember) => (member.daysOfWeek ?? []).filter((day): day is string => day != null);

// "Every day", or the days in week order.
const formatDays = (member: DutyMember) => {
  const days = daysOf(member);
  if (days.length === 0) return 'Every day';
  return DAYS_OF_WEEK.filter(day => days.includes(day.value))
    .map(day => day.value)
    .join(', ');
};

/** One duty's roster: who is on it and on which days. Changes apply from tomorrow. */
export const DutyScreen = () => {
  const { locationId, dutyId } = useParams<{ locationId: string; dutyId: string }>();
  const online = useOnlineStatus();
  const goBack = useNavigateBack(WorkspacesPaths.duties(locationId));
  const { canManageDuties } = useDaAccess(locationId);
  const { duties, loading, error, refetch } = useDuties(locationId);
  const duty = duties.find(item => item._id === dutyId);
  const members = (duty?.members ?? [])
    .filter((member): member is DutyMember => member != null)
    .sort(
      (a, b) =>
        Number(Boolean(b.isCoordinator)) - Number(Boolean(a.isCoordinator)) ||
        (a.karkun?.sharedData?.name ?? '').localeCompare(b.karkun?.sharedData?.name ?? ''),
    );

  const [addMember] = useMutation(MOBILE_DA_ADD_DUTY_MEMBER);
  const [updateMember] = useMutation(MOBILE_DA_UPDATE_DUTY_MEMBER);
  const [removeMember] = useMutation(MOBILE_DA_REMOVE_DUTY_MEMBER);
  const [updateDuty] = useMutation(MOBILE_DA_UPDATE_DUTY);
  const [removeDuty] = useMutation(MOBILE_DA_REMOVE_DUTY);

  const [dutyActions, setDutyActions] = useState(false);
  const [selected, setSelected] = useState<DutyMember | null>(null);
  const [editingDays, setEditingDays] = useState<DutyMember | null>(null);
  const [days, setDays] = useState<string[]>([]);
  const [savingDays, setSavingDays] = useState(false);
  const [picking, setPicking] = useState(false);

  const refresh = () => refetch().then(() => undefined, () => undefined);
  const nameOf = (member: DutyMember) => member.karkun?.sharedData?.name ?? 'This person';

  const run = (action: Promise<unknown>, success: string, failure: string) =>
    action.then(
      () => {
        showSuccess(success);
        return refetch();
      },
      error_ => showError(error_, failure),
    );

  const addPerson = (karkun: { _id: string; name: string }) =>
    run(
      addMember({ variables: { locationId, dutyId, karkunId: karkun._id } }),
      `${karkun.name} added. Set their days if they are not on duty every day.`,
      `Could not add ${karkun.name}.`,
    );

  const toggleCoordinator = (member: DutyMember) =>
    run(
      updateMember({
        variables: {
          locationId,
          dutyId,
          karkunId: member.karkunId,
          isCoordinator: !member.isCoordinator,
          daysOfWeek: daysOf(member),
        },
      }),
      member.isCoordinator ? `${nameOf(member)} is no longer a coordinator.` : `${nameOf(member)} is now a coordinator.`,
      'Could not change the coordinator.',
    );

  const confirmRemove = async (member: DutyMember) => {
    const ok = await Dialog.confirm({
      cancelText: 'Cancel',
      confirmText: 'Remove',
      content: `Remove ${nameOf(member)} from this duty?`,
    });
    if (ok) {
      run(
        removeMember({ variables: { locationId, dutyId, karkunId: member.karkunId } }),
        'Member removed.',
        'Could not remove the member.',
      );
    }
  };

  const saveDays = async () => {
    if (!editingDays) return;
    setSavingDays(true);
    try {
      await updateMember({
        variables: {
          locationId,
          dutyId,
          karkunId: editingDays.karkunId,
          isCoordinator: Boolean(editingDays.isCoordinator),
          daysOfWeek: days,
        },
      });
      showSuccess('Days updated.');
      setEditingDays(null);
      await refetch();
    } catch (failure) {
      showError(failure, 'Could not update the days.');
    } finally {
      setSavingDays(false);
    }
  };

  const setActive = (isActive: boolean) =>
    run(
      updateDuty({ variables: { locationId, dutyId, isActive } }),
      isActive ? 'Duty made active.' : 'Duty made inactive.',
      'Could not change the duty.',
    );

  const confirmDelete = async () => {
    const ok = await Dialog.confirm({
      cancelText: 'Cancel',
      confirmText: 'Delete',
      content: "A duty that has had people on duty can't be deleted; make it inactive instead.",
      title: 'Delete this duty?',
    });
    if (!ok) return;
    try {
      await removeDuty({ variables: { locationId, dutyId } });
      showSuccess('Duty deleted.');
      goBack();
    } catch (failure) {
      showError(failure, 'Could not delete the duty.');
    }
  };

  let content;
  if (loading) {
    content = <PageLoading />;
  } else if (error) {
    content = <PageError error={error} onRetry={refresh} />;
  } else if (!duty) {
    content = <PageEmpty title="Duty not found" />;
  } else {
    content = (
      <PullToRefresh onRefresh={refresh}>
        <div className="da-summary">
          <Tag color={duty.isActive ? 'success' : 'default'} fill="outline">
            {duty.isActive ? 'Active' : 'Inactive'}
          </Tag>
          {duty.description && <p>{duty.description}</p>}
        </div>
        {canManageDuties && (
          <InfoNote>Roster changes apply from tomorrow; days up to today keep the roster they had.</InfoNote>
        )}
        {members.length === 0 ? (
          <PageEmpty title="No members added yet" />
        ) : (
          <List mode="card">
            {members.map(member => {
              const shared = member.karkun?.sharedData;
              return (
                <List.Item
                  key={member.karkunId}
                  clickable
                  arrowIcon={false}
                  description={[formatDays(member), shared?.contactNumber1].filter(Boolean).join(' · ')}
                  extra={
                    member.isCoordinator ? (
                      <Tag color="primary" fill="outline">
                        CO
                      </Tag>
                    ) : undefined
                  }
                  prefix={<Avatar src={toDeviceUrl(shared?.imageThumbnailUrl ?? shared?.imageUrl) ?? ''} />}
                  onClick={() => setSelected(member)}
                >
                  {shared?.name}
                </List.Item>
              );
            })}
          </List>
        )}
      </PullToRefresh>
    );
  }

  const phones = selected
    ? [selected.karkun?.sharedData?.contactNumber1, selected.karkun?.sharedData?.contactNumber2].filter(
        (phone): phone is string => Boolean(phone),
      )
    : [];
  const manage = canManageDuties && online;

  return (
    <Page
      backTo={WorkspacesPaths.duties(locationId)}
      footer={
        duty && manage ? (
          <Button block color="primary" onClick={() => setPicking(true)}>
            <UserAddOutline /> Add member
          </Button>
        ) : undefined
      }
      right={duty && manage ? <MoreOutline aria-label="More" onClick={() => setDutyActions(true)} /> : undefined}
      title={duty?.name ?? 'Duty'}
    >
      {content}
      <ActionSheet
        actions={[
          { key: 'toggle', text: duty?.isActive ? 'Make inactive' : 'Make active', onClick: () => setActive(!duty?.isActive) },
          { key: 'delete', text: 'Delete duty', danger: true, onClick: confirmDelete },
        ]}
        cancelText="Cancel"
        visible={dutyActions}
        onClose={() => setDutyActions(false)}
      />
      <ActionSheet
        actions={
          selected
            ? [
                ...phones.map(phone => ({
                  key: `call-${phone}`,
                  text: `Call ${phone}`,
                  onClick: () => {
                    window.location.href = `tel:${phone}`;
                  },
                })),
                ...(manage
                  ? [
                      {
                        key: 'days',
                        text: 'Days on duty',
                        onClick: () => {
                          setDays(daysOf(selected));
                          setEditingDays(selected);
                        },
                      },
                      {
                        key: 'coordinator',
                        text: selected.isCoordinator ? 'Remove as Coordinator' : 'Make Coordinator',
                        onClick: () => toggleCoordinator(selected),
                      },
                      { key: 'remove', text: 'Remove from duty', danger: true, onClick: () => confirmRemove(selected) },
                    ]
                  : []),
              ]
            : []
        }
        cancelText="Cancel"
        extra={selected ? nameOf(selected) : undefined}
        visible={selected != null}
        onClose={() => setSelected(null)}
      />
      <Popup bodyClassName="da-popup" position="bottom" visible={editingDays != null} onMaskClick={() => setEditingDays(null)}>
        <div className="da-popup-header">
          <span className="da-popup-title">Days on duty{editingDays ? ` · ${nameOf(editingDays)}` : ''}</span>
        </div>
        <p className="da-popup-hint">Leave all unchecked for every day.</p>
        <div className="da-popup-body">
          <CheckList multiple value={days} onChange={values => setDays(values as string[])}>
            {DAYS_OF_WEEK.map(day => (
              <CheckList.Item key={day.value} value={day.value}>
                {day.label}
              </CheckList.Item>
            ))}
          </CheckList>
        </div>
        <div className="da-popup-footer">
          <Button block color="primary" loading={savingDays} onClick={saveDays}>
            Save days
          </Button>
        </div>
      </Popup>
      <KarkunSearchPopup
        locationId={locationId}
        selectedIds={members.map(member => member.karkunId)}
        selectedLabel="Member"
        title={`Add member${duty ? ` · ${duty.name}` : ''}`}
        visible={picking}
        onClose={() => setPicking(false)}
        onPick={addPerson}
      />
    </Page>
  );
};
