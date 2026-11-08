import { Migrations } from 'meteor/quave:migrations';

import {
  PollBallots,
  Polls,
  PollsActivities,
} from 'meteor/idreesia-common/server/collections/polls';

Migrations.add({
  version: 62,
  async up() {
    const polls = Polls.rawCollection();
    await polls.createIndex(
      { workspaceId: 1, status: 1, closesAt: 1 },
      { background: true }
    );
    await polls.createIndex(
      { workspaceId: 1, createdAt: -1 },
      { background: true }
    );
    // Closing open polls whose end time has passed.
    await polls.createIndex({ status: 1, closesAt: 1 }, { background: true });
    // "Polls I can vote in" across workspaces.
    await polls.createIndex(
      { eligibleVoterIds: 1, closesAt: 1 },
      { background: true }
    );
    // Searches always name the workspace, so it prefixes the text index.
    await polls.createIndex(
      { workspaceId: 1, title: 'text', description: 'text', tags: 'text' },
      {
        name: 'polls_text',
        weights: { title: 10, tags: 5, description: 1 },
        // Titles mix languages; don't apply English stemming or stop words.
        default_language: 'none',
        background: true,
      }
    );

    const ballots = PollBallots.rawCollection();
    // One ballot per voter per poll.
    await ballots.createIndex(
      { pollId: 1, voterId: 1 },
      { unique: true, background: true }
    );
    await ballots.createIndex({ voterId: 1, pollId: 1 }, { background: true });
    await ballots.createIndex({ workspaceId: 1 }, { background: true });

    const activities = PollsActivities.rawCollection();
    await activities.createIndex(
      { workspaceId: 1, at: -1 },
      { background: true }
    );
    await activities.createIndex(
      { pollId: 1, at: -1 },
      { sparse: true, background: true }
    );
  },
});
