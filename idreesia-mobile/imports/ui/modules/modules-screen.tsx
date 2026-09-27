import React from 'react';
import { List } from 'antd-mobile';

import { useCurrentUser } from '../hooks';
import { Page, PageEmpty, PageError, PageLoading } from '../layout';
import { useHistory } from '../router';
import { getUsableModules } from './access';
import { modules } from './registry';

/** Home tab: the modules this user can use. */
export const ModulesScreen = () => {
  const history = useHistory();
  const { user, userLoading, userError, refetchUser } = useCurrentUser();

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
        <List header="Modules" mode="card">
          {usableModules.map(module => (
            <List.Item
              key={module.name}
              description={module.description}
              prefix={<span className="list-icon">{module.icon}</span>}
              onClick={() => history.push(module.path)}
            >
              {module.name}
            </List.Item>
          ))}
        </List>
      );
  }

  return <Page title="Idreesia">{content}</Page>;
};
