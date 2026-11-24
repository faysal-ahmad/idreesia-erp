import { Mongo } from 'meteor/mongo';

// System-level configuration. One document per settings group, keyed by a fixed _id (see
// business-logic/admin/system-settings.ts for the groups). Written only by that module, so no
// schema is attached. A missing document means the group's defaults apply.
export interface SystemSettingsDocument {
  /** The settings group, e.g. 'face-recognition-self-attendance'. */
  _id: string;
  values: Record<string, unknown>;
  updatedAt: Date;
  updatedBy: string;
}

const SystemSettings = new Mongo.Collection<SystemSettingsDocument>(
  'system-settings'
);

export default SystemSettings;
