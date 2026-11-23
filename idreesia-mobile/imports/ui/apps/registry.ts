import { MyDataModule } from './my-data';
import { PurchasingModule } from './purchasing';
import { SecurityModule } from './security';
import type { ModuleDefinition } from './types';

/** Every module available in the mobile app, in the order they are listed. */
export const modules: ModuleDefinition[] = [MyDataModule, SecurityModule, PurchasingModule];
