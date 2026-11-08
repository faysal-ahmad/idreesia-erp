import React, { useEffect, useState } from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { type DocumentPart, WorkspacesPaths } from '../paths';
import { DocumentActivityScreen } from './activity-screen';
import { DocumentScreen } from './document-screen';
import { FolderScreen } from './folder-screen';
import { TrashScreen } from './trash-screen';
import { VersionsScreen } from './versions-screen';

const PART_SCREENS: Array<[DocumentPart, React.ComponentType]> = [
  ['versions', VersionsScreen],
  ['activity', DocumentActivityScreen],
];

/**
 * Workspace → Documents. Owns every route under the documents path. The top
 * level stays mounted (KeepAlive) underneath everything, the folder last
 * browsed stays mounted under a document opened from it, and the document
 * under its versions and activity, so back returns to each as it was
 * (including a search).
 */
export const DocumentsFeature = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { pathname } = useLocation();
  const onRoot = Boolean(
    matchPath(pathname, { path: WorkspacesPaths.committeeDocumentsPattern, exact: true }),
  );
  const folderMatch = matchPath<{ folderId: string }>(pathname, {
    path: WorkspacesPaths.committeeDocumentFolderPattern,
    exact: true,
  });
  const documentMatch = matchPath<{ documentId: string }>(pathname, {
    path: WorkspacesPaths.committeeDocumentPattern,
  });

  // The folder (below the top level) the user was last in, kept under a document opened from it.
  const [lastFolderId, setLastFolderId] = useState<string | null>(null);
  const currentFolderId = folderMatch?.params.folderId ?? null;
  useEffect(() => {
    if (currentFolderId) setLastFolderId(currentFolderId);
    else if (onRoot) setLastFolderId(null);
  }, [currentFolderId, onRoot]);
  const keptFolderId = currentFolderId ?? (documentMatch ? lastFolderId : null);

  return (
    <>
      <KeepAlive active={onRoot}>
        <FolderScreen folderId={null} />
      </KeepAlive>
      {keptFolderId && (
        <KeepAlive key={keptFolderId} active={!!folderMatch}>
          <FolderScreen folderId={keptFolderId} />
        </KeepAlive>
      )}
      {documentMatch && (
        <KeepAlive key={documentMatch.params.documentId} active={documentMatch.isExact}>
          <DocumentScreen documentId={documentMatch.params.documentId} />
        </KeepAlive>
      )}
      <Switch>
        <Route exact path={WorkspacesPaths.committeeDocumentsPattern} render={() => null} />
        <Route exact path={WorkspacesPaths.committeeDocumentFolderPattern} render={() => null} />
        <Route exact component={TrashScreen} path={WorkspacesPaths.committeeDocumentTrashPattern} />
        <Route exact path={WorkspacesPaths.committeeDocumentPattern} render={() => null} />
        {PART_SCREENS.map(([part, component]) => (
          <Route
            key={part}
            exact
            component={component}
            path={WorkspacesPaths.committeeDocumentPartPattern(part)}
          />
        ))}
        <Redirect to={WorkspacesPaths.committeeDocuments(committeeId)} />
      </Switch>
    </>
  );
};
