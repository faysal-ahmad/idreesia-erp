import React, { type ReactNode } from 'react';

import { Page, PageEmpty, PageError, PageLoading } from '../../../layout';

interface Props {
  title: string;
  backTo: string;
  /** Whether the record has loaded (it may also be a cached copy). */
  found: boolean;
  loading: boolean;
  error?: unknown;
  refetch: () => Promise<unknown>;
  notFoundTitle: string;
  right?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** A detail screen's shell: pull to refresh, and the loading / error / not-found states. */
export const DocumentPage = ({
  title,
  backTo,
  found,
  loading,
  error,
  refetch,
  notFoundTitle,
  right,
  footer,
  children,
}: Props) => {
  let content: ReactNode;
  if (found) content = children;
  else if (loading) content = <PageLoading />;
  else if (error) content = <PageError error={error} onRetry={() => refetch().catch(() => undefined)} />;
  else content = <PageEmpty description="It may have been deleted." title={notFoundTitle} />;

  return (
    <Page
      backTo={backTo}
      footer={found ? footer : undefined}
      right={found ? right : undefined}
      title={title}
      onRefresh={refetch}
    >
      {content}
    </Page>
  );
};
