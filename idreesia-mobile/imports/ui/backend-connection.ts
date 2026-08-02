import { AccountsClient } from 'meteor/accounts-base';
import { DDP, type DDPConnection } from 'meteor/ddp-client';
import { Meteor } from 'meteor/meteor';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const runtimeConfig = globalThis.__meteor_runtime_config__ || {};
const settingsUrl = Meteor.settings.public?.backendUrl;
const runtimeUrl = runtimeConfig.DDP_DEFAULT_CONNECTION_URL;

export const backendUrl = trimTrailingSlash(settingsUrl || runtimeUrl || '');
export const hasBackendUrl = Boolean(backendUrl);

export const backendConnection: DDPConnection | null = hasBackendUrl
  ? DDP.connect(backendUrl)
  : null;

export const backendAccounts: AccountsClient | null = hasBackendUrl
  ? new AccountsClient({ connection: backendConnection })
  : null;
