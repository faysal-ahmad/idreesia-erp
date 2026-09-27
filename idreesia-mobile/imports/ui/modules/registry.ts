import { SecurityModule } from './security';
import type { ModuleDefinition } from './types';

/** Every module available in the mobile app, in the order they are listed. */
export const modules: ModuleDefinition[] = [SecurityModule];
