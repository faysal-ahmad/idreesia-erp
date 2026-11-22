import React from 'react';
import { List } from 'antd-mobile';

import { CollapsibleSection } from '../components/collapsible-section';
import { useCurrentUser } from '../hooks';
import { Page, PageEmpty, PageError, PageLoading } from '../layout';
import { useHistory } from '../router';
import { getUsableFeatures, getUsableModules } from './access';
import { modules } from './registry';

/** Apps tab: one section per module this user can use, with its features listed under it. */
export const ModulesScreen = () => {
  const history = useHistory();
  const { user, userLoading, userError, refetchUser, refreshUser } = useCurrentUser();

  let content;
  if (userLoading && !user) {
    content = <PageLoading />;
  } else if (userError && !user) {
    content = <PageError error={userError} onRetry={refetchUser} />;
  } else {
    const usableModules = getUsableModules(user, modules);
    content =
      usableModules.length === 0 ? (
        <PageEmpty
          description="Your account doesn't have access to any mobile features yet. Ask an administrator if you need access."
          title="Nothing here yet"
        />
      ) : (
        <>
          {usableModules.map(module => {
            const features = getUsableFeatures(user, module);
            return (
              <CollapsibleSection key={module.name} count={features.length} title={module.name}>
                {features.map(feature => (
                  <List.Item
                    key={feature.key}
                    description={feature.description}
                    prefix={<span className={feature.iconClassName ?? 'list-icon'}>{feature.icon}</span>}
                    onClick={feature.comingSoon ? undefined : () => history.push(feature.path)}
                  >
                    {feature.title}
                  </List.Item>
                ))}
              </CollapsibleSection>
            );
          })}
        </>
      );
  }

  return <Page title="Apps" onRefresh={refreshUser}>{content}</Page>;
};
