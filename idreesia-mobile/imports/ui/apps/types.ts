import type { ComponentType, ReactNode } from 'react';

/**
 * A use case inside a module (e.g. Security → Visitors). The feature owns
 * every route under `path`, so its component can render its own <Switch> for
 * list / detail / form screens.
 */
export interface FeatureDefinition {
  key: string;
  title: string;
  /** One line shown under the title in the module's feature list. */
  description: string;
  icon: ReactNode;
  /** Absolute route, always under the module's path. */
  path: string;
  /** The user needs at least one of these (Permissions from idreesia-common). */
  permissions: string[];
  component: ComponentType;
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
