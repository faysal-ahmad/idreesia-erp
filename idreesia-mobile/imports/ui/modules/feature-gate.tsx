import React from 'react';

import { useCurrentUser } from '../hooks';
import { NoAccess, Page, PageError, PageLoading } from '../layout';
import { canUseFeature } from './access';
import type { FeatureDefinition, ModuleDefinition } from './types';

interface Props {
  module: ModuleDefinition;
  feature: FeatureDefinition;
}

/**
 * Renders a feature only for users with one of its permissions, so deep
 * links can't open a feature the module screen would have hidden. The server
 * still enforces permissions on every query; this is for the UI.
 */
export const FeatureGate = ({ module, feature }: Props) => {
  const { user, userLoading, userError, refetchUser } = useCurrentUser();
  const Feature = feature.component;

  if (canUseFeature(user, feature)) return <Feature />;

  let content;
  if (userLoading && !user) content = <PageLoading />;
  else if (userError && !user) content = <PageError error={userError} onRetry={refetchUser} />;
  else content = <NoAccess />;

  return (
    <Page backTo={module.path} title={feature.title}>
      {content}
    </Page>
  );
};
