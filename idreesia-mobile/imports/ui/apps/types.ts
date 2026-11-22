import type { ComponentType, ReactNode } from 'react';

/**
 * A use case inside a module (e.g. Security → Visitors). The feature owns
 * every route under `path`, so its component can render its own <Switch> for
 * list / detail / form screens.
 */
export interface FeatureDefinition {
  key: string;
  title: string;
  /** Optional line shown under the title in the module's feature list. */
  description?: string;
  icon: ReactNode;
  /** Class for the icon's wrapper; defaults to the plain `list-icon`. Use a coloured tile class to match Workspaces. */
  iconClassName?: string;
  /** Absolute route, always under the module's path. */
  path: string;
  /** The user needs at least one of these (Permissions from idreesia-common). Empty: any signed-in user. */
  permissions: string[];
  component: ComponentType;
  /** Placeholder: shown in the module's list, but tapping it goes nowhere yet. */
  comingSoon?: boolean;
}

/** A functional module, matching the web app's modules (ModuleNames). */
export interface ModuleDefinition {
  /** ModuleNames value, e.g. ModuleNames.security. */
  name: string;
  description: string;
  icon: ReactNode;
  /** ModulePaths value, e.g. ModulePaths.security. */
  path: string;
  features: FeatureDefinition[];
}
