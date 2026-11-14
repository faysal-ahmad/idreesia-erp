import React, { useState } from 'react';
import { ActionSheet, Dialog, List } from 'antd-mobile';
import { AddOutline, TeamOutline } from 'antd-mobile-icons';
import { useApolloClient, useMutation } from '@apollo/client/react';

import { useOnlineStatus } from '../../hooks';
import { PageEmpty, showError, showSuccess } from '../../layout';
import { isProjectOpen } from './format';
import { MOBILE_ADD_PROJECT_PARTICIPANTS, MOBILE_REMOVE_PROJECT_PARTICIPANT } from './gql';
import { MemberPickerPopup } from './member-picker-popup';
import { ProjectPartPage, useProjectPart } from './project-part';

/**
 * A project's participants: who is in it and its private chat. Coordinators
 * add and remove people.
 */
export const ProjectParticipantsScreen = () => {
  const part = useProjectPart();
  const { committeeId, projectId, project, members } = part;
  const online = useOnlineStatus();
  const client = useApolloClient();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<{ personId: string; name: string } | null>(null);
  const [addParticipants, { loading: adding }] = useMutation(MOBILE_ADD_PROJECT_PARTICIPANTS);
  const [removeParticipant] = useMutation(MOBILE_REMOVE_PROJECT_PARTICIPANT);

  const participantIds = (project?.participants ?? []).map(participant => participant?.personId).filter(Boolean) as string[];
  const canEdit = !!project?.canManage && isProjectOpen(project.status);

  const add = async (ids: string[]) => {
    const added = ids.filter(id => !participantIds.includes(id));
    if (!added.length) {
      setPickerOpen(false);
      return;
    }
    try {
      await addParticipants({ variables: { committeeId, projectId, personIds: added } });
      showSuccess(added.length === 1 ? 'Participant added.' : `${added.length} participants added.`);
      setPickerOpen(false);
      client.refetchQueries({ include: ['mobileWorkspaceProjects'] });
    } catch (addError) {
      showError(addError, 'Could not add the participants.');
    }
  };

  const remove = async (personId: string, name: string, unassignTasks: boolean) => {
    try {
      await removeParticipant({ variables: { committeeId, projectId, personId, unassignTasks } });
      showSuccess(`${name} removed.`);
      client.refetchQueries({ include: ['mobileWorkspaceTasks'] });
    } catch (removeError) {
      showError(removeError, `Could not remove ${name}.`);
    }
  };

  const confirmRemove = async (personId: string, name: string) => {
    const confirmed = await Dialog.confirm({
      title: `Remove ${name}?`,
      content: 'They lose access to the project chat, and their open tasks in this project become unassigned.',
      confirmText: <span className="project-danger-text">Remove</span>,
      cancelText: 'Cancel',
    });
    if (confirmed) remove(personId, name, true);
  };

  return (
    <ProjectPartPage
      part={part}
      title="Participants"
      right={
        canEdit && online ? (
          <div className="page-nav-actions">
            <AddOutline aria-label="Add participants" className="page-nav-action" onClick={() => setPickerOpen(true)} />
          </div>
        ) : undefined
      }
    >
      {current => {
        const people = (current.participants ?? []).filter((participant): participant is NonNullable<typeof participant> & { personId: string } => !!participant?.personId);
        if (!people.length) return <PageEmpty icon={<TeamOutline />} title="No participants" />;
        return (
          <>
            <p className="paged-list-count">
              {people.length} participant{people.length === 1 ? '' : 's'}. Only they can read and post in the project chat.
            </p>
            <List mode="card">
              {people.map(person => (
                <List.Item
                  key={person.personId}
                  onClick={
                    canEdit && online
                      ? () => setSelected({ personId: person.personId, name: person.name ?? person.personId })
                      : undefined
                  }
                >
                  {person.name ?? person.personId}
                </List.Item>
              ))}
            </List>

            <ActionSheet
              actions={
                selected
                  ? [
                      {
                        key: 'remove',
                        text: 'Remove from project',
                        danger: true,
                        onClick: () => confirmRemove(selected.personId, selected.name),
                      },
                    ]
                  : []
              }
              cancelText="Close"
              closeOnAction
              extra={selected?.name}
              visible={!!selected}
              onClose={() => setSelected(null)}
            />

            <MemberPickerPopup
              multiple
              confirmLoading={adding}
              confirmText="Add participants"
              lockedIds={participantIds}
              members={members}
              note="People who are already participants stay in the project."
              selectedIds={participantIds}
              title="Participants"
              visible={pickerOpen}
              onClose={() => setPickerOpen(false)}
              onConfirm={add}
            />
          </>
        );
      }}
    </ProjectPartPage>
  );
};
