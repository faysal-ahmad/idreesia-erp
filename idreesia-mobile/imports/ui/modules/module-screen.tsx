import React from 'react';
import { List } from 'antd-mobile';

import { useCurrentUser } from '../hooks';
import { NoAccess, Page, PageError, PageLoading } from '../layout';
import { useHistory } from '../router';
import { getUsableFeatures } from './access';
import type { ModuleDefinition } from './types';

interface Props {
  module: ModuleDefinition;
}

/** A module's landing screen: the features in it this user can use. */
export const ModuleScreen = ({ module }: Props) => {
  const history = useHistory();
  const { user, userLoading, userError, refetchUser } = useCurrentUser();

  let content;
  if (userLoading && !user) {
    content = <PageLoading />;
  } else if (userError && !user) {
    content = <PageError error={userError} onRetry={refetchUser} />;
  } else {
    const features = getUsableFeatures(user, module);
    content =
      features.length === 0 ? (
        <NoAccess />
      ) : (
        <List mode="card">
          {features.map(feature => (
            <List.Item
              key={feature.key}
              description={feature.description}
              prefix={<span className="list-icon">{feature.icon}</span>}
              onClick={() => history.push(feature.path)}
            >
              {feature.title}
            </List.Item>
          ))}
        </List>
      );
  }

  return (
    <Page backTo="/" title={module.name}>
      {content}
    </Page>
  );
};
