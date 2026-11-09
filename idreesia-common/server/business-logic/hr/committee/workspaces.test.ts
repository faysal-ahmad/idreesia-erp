import { describe, expect, it } from 'vitest';

import Committees from 'meteor/idreesia-common/server/collections/hr/committees';

import { getPersonNotificationScope } from './workspaces';

const committee = (overrides: Record<string, unknown>) =>
  Committees.insertAsync({
    name: 'Committee',
    members: [{ karkunId: 'p1' }],
    features: [],
    ...overrides,
  } as any);

describe('getPersonNotificationScope', () => {
  it('lists the enabled modules of the person\'s committees, with the committee', async () => {
    const id = await committee({
      features: ['discussions', 'documents', 'members'],
      discussionsWorkspaceId: 'disc1',
      dmsWorkspaceId: 'dms1',
    });

    const scope = await getPersonNotificationScope('p1');

    expect(scope).toEqual(
      expect.arrayContaining([
        { committeeId: id, module: 'discussions' },
        { committeeId: id, module: 'dms' },
        { committeeId: id, module: 'members' },
      ])
    );
    expect(scope).toHaveLength(3);
  });

  it('leaves out features that are not enabled, even if a workspace is remembered', async () => {
    await committee({
      features: ['documents'],
      discussionsWorkspaceId: 'disc1',
      dmsWorkspaceId: 'dms1',
    });

    const scope = await getPersonNotificationScope('p1');

    expect(scope.map(entry => entry.module)).toEqual(['dms']);
  });

  it('leaves out committees the person does not belong to', async () => {
    await committee({
      members: [{ karkunId: 'someone-else' }],
      features: ['documents', 'members'],
      dmsWorkspaceId: 'dms1',
    });

    expect(await getPersonNotificationScope('p1')).toEqual([]);
  });

  it('combines the modules of several committees', async () => {
    const a = await committee({ features: ['documents'], dmsWorkspaceId: 'dmsA' });
    const b = await committee({ features: ['members'] });

    expect(await getPersonNotificationScope('p1')).toEqual(
      expect.arrayContaining([
        { committeeId: a, module: 'dms' },
        { committeeId: b, module: 'members' },
      ])
    );
  });
});
