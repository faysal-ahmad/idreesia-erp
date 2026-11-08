import type { FeatureDefinition, ModuleDefinition } from './types';

interface UserWithPermissions {
  permissions?: Array<string | null> | null;
}

export const canUseFeature = (
  user: UserWithPermissions | null | undefined,
  feature: FeatureDefinition
) => {
  const granted = user?.permissions ?? [];
  return feature.permissions.some(permission => granted.includes(permission));
};

export const getUsableFeatures = (
  user: UserWithPermissions | null | undefined,
  module: ModuleDefinition
) => module.features.filter(feature => canUseFeature(user, feature));

/**
 * A module is shown when the user can use at least one of its mobile
 * features. (The web shows a module for any permission with the module's
 * prefix; on mobile, a module with nothing usable in it would be a dead end.)
 */
export const getUsableModules = (
  user: UserWithPermissions | null | undefined,
  modules: ModuleDefinition[]
) => modules.filter(module => getUsableFeatures(user, module).length > 0);
