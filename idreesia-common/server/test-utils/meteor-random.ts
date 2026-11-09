import { randomBytes } from 'node:crypto';

export const Random = {
  id: (length = 17) => randomBytes(length).toString('base64url').slice(0, length),
};
