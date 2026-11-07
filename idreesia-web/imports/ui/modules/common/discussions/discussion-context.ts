import { createContext, useContext } from 'react';

import type { DiscussionDataProvider } from './types';

// Lets deeply nested pieces (e.g. attachments) reach the provider without
// threading it through every component.
export const DiscussionProviderContext =
  createContext<DiscussionDataProvider | null>(null);

export const useDiscussionProvider = (): DiscussionDataProvider => {
  const provider = useContext(DiscussionProviderContext);
  if (!provider) {
    throw new Error('Discussion components must be rendered inside <Discussion>.');
  }
  return provider;
};
