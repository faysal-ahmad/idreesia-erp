import type { HeadlessModule } from './types';

const modules = new Map<string, HeadlessModule>();

export const registerHeadlessModule = (module: HeadlessModule): void => {
  modules.set(module.name, module);
};

export const getHeadlessModule = (name: string): HeadlessModule | undefined =>
  modules.get(name);

export const getHeadlessModules = (): HeadlessModule[] => [...modules.values()];
