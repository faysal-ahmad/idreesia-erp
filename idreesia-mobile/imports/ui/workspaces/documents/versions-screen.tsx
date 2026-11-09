import React, { useState } from 'react';
import { ActionSheet, Dialog, List, Tag } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import { ClockCircleOutline } from 'antd-mobile-icons';
import { useMutation, useQuery } from '@apollo/client/react';
import type { MobileWorkspaceDocumentVersionsQuery } from 'meteor/idreesia-common/types/client-operations';

import { useOnlineStatus } from '../../hooks';
import { PageEmpty, PageError, PageLoading, showError, showSuccess } from '../../layout';
import { useOfflineItem } from '../../offline';
import { DocumentPartPage, useDocumentPart } from './document-part';
import { byLine, formatSize } from './format';
import {
  MOBILE_WORKSPACE_DELETE_DOCUMENT_VERSION,
  MOBILE_WORKSPACE_DOCUMENT_VERSIONS,
  MOBILE_WORKSPACE_RESTORE_DOCUMENT_VERSION,
} from './gql';
import {
  hasId,
  isLockedByOther,
  OFFLINE_FEATURE,
  useDocumentPreview,
  useRefreshDocumentLists,
} from './use-documents';

type Version = NonNullable<NonNullable<MobileWorkspaceDocumentVersionsQuery['workspaceDocumentVersions']>[number]> & {
  _id: string;
};

/**
 * A document's versions, newest first. Any version can be opened or made
 * current again; coordinators can delete old ones.
 */
export const VersionsScreen = () => {
  const part = useDocumentPart();
  const { committeeId, documentId, canManage } = part;
  const refreshLists = useRefreshDocumentLists();
  const { open, previewElement } = useDocumentPreview(committeeId);
  const [selected, setSelected] = useState<Version | null>(null);
  // Changes need the server; offline the versions can only be read.
  const online = useOnlineStatus();
  const savedCopies = useOfflineItem(OFFLINE_FEATURE, documentId);

  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_DOCUMENT_VERSIONS, {
    variables: { committeeId, documentId },
    fetchPolicy: 'cache-and-network',
  });
  const [restoreVersion] = useMutation(MOBILE_WORKSPACE_RESTORE_DOCUMENT_VERSION);
  const [deleteVersion] = useMutation(MOBILE_WORKSPACE_DELETE_DOCUMENT_VERSION);

  const versions = (data?.workspaceDocumentVersions ?? []).filter(hasId);

  // The versions, the document (its current version) and the lists.
  const reload = () => Promise.all([refetch(), part.refetch(), refreshLists()]).catch(() => undefined);

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    try {
      await action();
      showSuccess(success);
      await reload();
    } catch (actionError) {
      showError(actionError, failure);
    }
  };

  const actionsFor = (version: Version, lockedByOther: boolean): Action[] => [
    {
      key: 'open',
      text: 'Open',
      onClick: () =>
        open(
          { _id: documentId, name: version.fileName, mimeType: version.mimeType },
          { id: version._id, number: version.versionNumber ?? 0 },
        ),
    },
    ...(!version.isCurrent
      ? [
          {
            key: 'restore',
            text: 'Make current',
            disabled: !online || lockedByOther,
            onClick: async () => {
              const confirmed = await Dialog.confirm({
                title: `Make version ${version.versionNumber} current?`,
                content: 'It is added again as the newest version.',
                confirmText: 'Restore',
                cancelText: 'Cancel',
              });
              if (!confirmed) return;
              run(
                () => restoreVersion({ variables: { committeeId, documentId, versionId: version._id } }),
                'Version restored.',
                'Could not restore the version.',
              );
            },
          },
        ]
      : []),
    ...(!version.isCurrent && canManage
      ? [
          {
            key: 'delete',
            text: 'Delete version',
            danger: true,
            disabled: !online || lockedByOther,
            onClick: async () => {
              const confirmed = await Dialog.confirm({
                content: `Delete version ${version.versionNumber} permanently?`,
                confirmText: <span className="documents-danger-text">Delete</span>,
                cancelText: 'Cancel',
              });
              if (!confirmed) return;
              run(
                () => deleteVersion({ variables: { committeeId, documentId, versionId: version._id } }),
                'Version deleted.',
                'Could not delete the version.',
              );
            },
          },
        ]
      : []),
  ];

  return (
    <DocumentPartPage part={part} title="Versions" onRefresh={reload}>
      {document => {
        if (loading && !data) return <PageLoading />;
        if (error && !data) return <PageError error={error} onRetry={() => refetch()} />;
        if (versions.length === 0) return <PageEmpty icon={<ClockCircleOutline />} title="No versions" />;
        return (
          <>
            <List mode="card">
              {versions.map(version => (
                <List.Item
                  key={version._id}
                  description={
                    <>
                      <div>
                        {[byLine(version.createdByName, version.createdAt), formatSize(version.size)]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                      {version.comment && <div className="documents-pre-wrap">{version.comment}</div>}
                    </>
                  }
                  extra={
                    <>
                      {savedCopies.some(copy => copy.version === version.versionNumber) && (
                        <Tag color="success" fill="outline">
                          Offline
                        </Tag>
                      )}
                      {version.isCurrent && (
                        <Tag color="primary" fill="outline">
                          Current
                        </Tag>
                      )}
                    </>
                  }
                  onClick={() => setSelected(version)}
                >
                  Version {version.versionNumber}
                </List.Item>
              ))}
            </List>
            <ActionSheet
              actions={selected ? actionsFor(selected, isLockedByOther(document)) : []}
              cancelText="Close"
              closeOnAction
              visible={!!selected}
              onClose={() => setSelected(null)}
            />
            {previewElement}
          </>
        );
      }}
    </DocumentPartPage>
  );
};
