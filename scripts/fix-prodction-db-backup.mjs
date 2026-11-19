#!/usr/bin/env node
/*
 * Repairs the chat links of an ERP database that was restored from another
 * environment (e.g. a production backup restored locally), whose chat user
 * and group ids do not exist in the chat server it now points at.
 *
 *   1. Every ERP user with a chatUserId: checks the chat user exists. If not,
 *      links the chat user with the same username, or creates one, and stores
 *      the new id (dropping the stored chat token, which belonged to the old
 *      account).
 *   2. Every committee with Discussions enabled: checks the chat group behind
 *      its discussions workspace exists. If not, creates a new group, stores
 *      its id on the workspace and adds every committee member that has a
 *      chat account.
 *
 * Dry run by default; pass --apply to make changes. Safe to re-run.
 *
 * Run it from the repository root, inside the local idreesia-web container
 * (where the docker-compose host names `mongo` / `rocketchat` resolve). It
 * reads its settings from idreesia-web/.env:
 *
 *   docker compose exec idreesia-web meteor yarn fix:prod-backup          # dry run
 *   docker compose exec idreesia-web meteor yarn fix:prod-backup:apply    # make the changes
 *
 * Outside the container, override MONGO_URL and ROCKETCHAT_URL with
 * localhost addresses (variables already set in the environment win over the
 * file).
 */
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const envFileIndex = args.indexOf('--env-file');
if (envFileIndex !== -1) {
  const envFile = args[envFileIndex + 1];
  if (!envFile || !existsSync(envFile)) {
    console.error(`--env-file: file not found: ${envFile}`);
    process.exit(1);
  }
  dotenv.config({ path: envFile, quiet: true });
}

const required = ['MONGO_URL', 'ROCKETCHAT_URL', 'ROCKETCHAT_USER_ID', 'ROCKETCHAT_AUTH_TOKEN'];
const missing = required.filter(name => !process.env[name]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const chatUrl = process.env.ROCKETCHAT_URL.replace(/\/+$/, '');
const PLACEHOLDER_EMAIL_DOMAIN = 'users.idreesia.local';
const DISCUSSIONS_FEATURE = 'discussions';

// ---------------------------------------------------------------------------
// Chat REST client (the same calls the ERP makes, see idreesia-common/server/chat)
// ---------------------------------------------------------------------------

class ChatError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const chatRequest = async (method, path, { query, body } = {}) => {
  const url = new URL(`${chatUrl}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const response = await fetch(url, {
    method,
    headers: {
      'X-User-Id': process.env.ROCKETCHAT_USER_ID,
      'X-Auth-Token': process.env.ROCKETCHAT_AUTH_TOKEN,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30_000),
  });
  let json = null;
  try {
    json = await response.json();
  } catch {
    // handled below
  }
  if (!response.ok || json?.success === false) {
    throw new ChatError(
      response.ok ? 502 : response.status,
      json?.error ?? json?.message ?? `Chat request failed (${response.status})`
    );
  }
  return json;
};

// The chat server answers an unknown user or group with a 400 or 404.
const orNullWhenUnknown = async request => {
  try {
    return await request();
  } catch (error) {
    if (error instanceof ChatError && (error.statusCode === 400 || error.statusCode === 404)) {
      return null;
    }
    throw error;
  }
};

const findChatUser = ({ userId, username }) =>
  orNullWhenUnknown(async () =>
    (await chatRequest('GET', '/api/v1/users.info', { query: userId ? { userId } : { username } })).user ?? null
  );

const findChatGroup = roomId =>
  orNullWhenUnknown(async () => (await chatRequest('GET', '/api/v1/groups.info', { query: { roomId } })).group ?? null);

const createChatUser = async ({ username, name, email }) => {
  const create = emailAddress =>
    chatRequest('POST', '/api/v1/users.create', {
      body: {
        username,
        name,
        email: emailAddress,
        password: randomBytes(24).toString('hex'),
        verified: true,
        requirePasswordChange: false,
        joinDefaultChannels: true,
        sendWelcomeEmail: false,
        roles: ['user'],
      },
    });
  try {
    return (await create(email || `${username}@${PLACEHOLDER_EMAIL_DOMAIN}`)).user._id;
  } catch (error) {
    // Restored data can share an email with another chat account; retry with
    // the placeholder address rather than skipping the user.
    if (email && error instanceof ChatError && /email/i.test(error.message)) {
      return (await create(`${username}@${PLACEHOLDER_EMAIL_DOMAIN}`)).user._id;
    }
    throw error;
  }
};

// Same naming rules as the ERP (business-logic/discussions/workspaces.ts).
const chatGroupName = name => {
  const slug = String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `discussions-${slug || 'group'}-${randomBytes(3).toString('hex')}`;
};

// ---------------------------------------------------------------------------

const summary = {
  usersChecked: 0,
  usersValid: 0,
  usersLinked: 0,
  usersCreated: 0,
  usersSkipped: 0,
  usersFailed: 0,
  groupsChecked: 0,
  groupsValid: 0,
  groupsCreated: 0,
  groupsSkipped: 0,
  groupsFailed: 0,
  membersAdded: 0,
};

const repairUsers = async users => {
  const staleCandidates = await users.find({ chatUserId: { $exists: true, $nin: [null, ''] } }).toArray();
  console.log(`\n== Users with a chat account: ${staleCandidates.length}`);

  for (const user of staleCandidates) {
    summary.usersChecked += 1;
    const label = `${user.username ?? user._id}`;
    try {
      if (await findChatUser({ userId: user.chatUserId })) {
        summary.usersValid += 1;
        continue;
      }

      const username = user.username?.trim();
      const name = user.profile?.name?.trim();
      if (!username || !name) {
        console.log(`  SKIP   ${label}: needs a user name and display name to create a chat account`);
        summary.usersSkipped += 1;
        continue;
      }

      const existing = await findChatUser({ username });
      let chatUserId = existing?._id;
      let action = 'link  ';
      if (!chatUserId) {
        action = 'create';
        if (apply) {
          chatUserId = await createChatUser({ username, name, email: user.emails?.[0]?.address });
        }
      }

      console.log(`  ${apply ? '' : 'WOULD '}${action} ${label} (stale chat id ${user.chatUserId})`);
      if (action === 'link  ') summary.usersLinked += 1;
      else summary.usersCreated += 1;

      if (apply) {
        await users.updateOne({ _id: user._id }, { $set: { chatUserId }, $unset: { chatAuthToken: '' } });
      }
    } catch (error) {
      console.log(`  FAIL   ${label}: ${error.message}`);
      summary.usersFailed += 1;
    }
  }
};

const repairCommitteeGroups = async (committees, workspaces, users) => {
  const list = await committees.find({ features: DISCUSSIONS_FEATURE }).toArray();
  console.log(`\n== Committees with Discussions enabled: ${list.length}`);

  for (const committee of list) {
    summary.groupsChecked += 1;
    const label = committee.name ?? committee._id;
    try {
      const workspace = committee.discussionsWorkspaceId
        ? await workspaces.findOne({ _id: committee.discussionsWorkspaceId })
        : null;
      if (!workspace) {
        console.log(`  SKIP   ${label}: no discussions workspace (disable and re-enable Discussions in the ERP)`);
        summary.groupsSkipped += 1;
        continue;
      }
      if (workspace.deletedAt) {
        console.log(`  SKIP   ${label}: workspace is archived`);
        summary.groupsSkipped += 1;
        continue;
      }
      if (workspace.chatGroupId && (await findChatGroup(workspace.chatGroupId))) {
        summary.groupsValid += 1;
        continue;
      }

      const personIds = (committee.members ?? []).map(member => member.karkunId).filter(Boolean);
      const memberUsers = personIds.length
        ? await users.find({ personId: { $in: personIds }, chatUserId: { $exists: true, $nin: [null, ''] } }).toArray()
        : [];

      console.log(
        `  ${apply ? '' : 'WOULD '}create group for ${label} ` +
          `(stale group id ${workspace.chatGroupId}), adding ${memberUsers.length} member(s)`
      );
      summary.groupsCreated += 1;
      if (!apply) continue;

      const { group } = await chatRequest('POST', '/api/v1/groups.create', {
        body: { name: chatGroupName(workspace.name ?? committee.name), members: [] },
      });
      await workspaces.updateOne(
        { _id: workspace._id },
        { $set: { chatGroupId: group._id, updatedAt: new Date() } }
      );

      for (const member of memberUsers) {
        try {
          await chatRequest('POST', '/api/v1/groups.invite', {
            body: { roomId: group._id, userId: member.chatUserId },
          });
          summary.membersAdded += 1;
        } catch (error) {
          console.log(`    FAIL add ${member.username ?? member._id}: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`  FAIL   ${label}: ${error.message}`);
      summary.groupsFailed += 1;
    }
  }
};

const mongoUrl = process.env.MONGO_URL;
const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 10_000 });

console.log(`Mode: ${apply ? 'APPLY (changes will be made)' : 'DRY RUN (pass --apply to make changes)'}`);
console.log(`Database: ${mongoUrl.replace(/\/\/[^@/]*@/, '//***@')}`);
console.log(`Chat server: ${chatUrl}`);

try {
  await client.connect();
  const db = client.db();
  await chatRequest('GET', '/api/v1/me'); // fails fast on a bad service account

  await repairUsers(db.collection('users'));
  await repairCommitteeGroups(
    db.collection('hr-committees'),
    db.collection('discussions-workspaces'),
    db.collection('users')
  );

  console.log('\n== Summary');
  console.table(summary);
  if (!apply) console.log('Dry run only. Re-run with --apply to make these changes.');
  process.exitCode = summary.usersFailed || summary.groupsFailed ? 1 : 0;
} catch (error) {
  console.error(`\nAborted: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.close();
}
