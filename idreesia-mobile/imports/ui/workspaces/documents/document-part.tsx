import React, { type ReactNode } from 'react';
import { FileOutline } from 'antd-mobile-icons';
import { useQuery } from '@apollo/client/react';

import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { MOBILE_WORKSPACE_DOCUMENT_BY_ID } from './gql';
import { type DocumentItem, useDocumentsInfo } from './use-documents';

/** One document. The document screen and the screens under it read it from here. */
export const useDocument = (committeeId: string, documentId: string) => {
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_DOCUMENT_BY_ID, {
    variables: { committeeId, documentId },
    fetchPolicy: 'cache-and-network',
  });
  const document = data?.workspaceDocumentById?._id ? (data.workspaceDocumentById as DocumentItem) : null;
  return {
    document,
    loading: loading && !document,
    error: document ? undefined : error,
    refetch: () =>
      refetch().then(
        () => undefined,
        () => undefined,
      ),
  };
};

/** What a screen under one document (versions, activity) needs. */
export const useDocumentPart = () => {
  const { committeeId, documentId } = useParams<{ committeeId: string; documentId: string }>();
  const info = useDocumentsInfo(committeeId);
  const state = useDocument(committeeId, documentId);
  return {
    committeeId,
    documentId,
    ...info,
    ...state,
    backTo: WorkspacesPaths.committeeDocument(committeeId, documentId),
  };
};

interface PageProps {
  title: string;
  part: ReturnType<typeof useDocumentPart>;
  right?: ReactNode;
  onRefresh?: () => Promise<unknown>;
  children: (document: DocumentItem) => ReactNode;
}

/** The screen shell, with the loading / error / not-found states. */
export const DocumentPartPage = ({ title, part, right, onRefresh, children }: PageProps) => {
  const { document, loading, error, refetch, backTo } = part;
  let body: ReactNode;
  if (loading) body = <PageLoading />;
  else if (error) body = <PageError error={error} onRetry={refetch} />;
  else if (!document) body = <DocumentNotFound />;
  else body = children(document);

  return (
    <Page
      backTo={backTo}
      right={document ? right : undefined}
      title={title}
      onRefresh={document ? (onRefresh ?? refetch) : undefined}
    >
      {body}
    </Page>
  );
};

export const DocumentNotFound = () => (
  <PageEmpty
    description="It may have been moved to the trash."
    icon={<FileOutline />}
    title="Document not found"
  />
);
