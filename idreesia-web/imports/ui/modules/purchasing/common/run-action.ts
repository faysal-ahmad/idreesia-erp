import { message } from '/imports/ui/antd-feedback';

/**
 * Runs a mutation and tells the user how it went. Resolves to whether it
 * worked, so the caller can close a dialog or navigate.
 */
export const runAction = (
  action: Promise<unknown>,
  successMessage: string
): Promise<boolean> =>
  action
    .then(() => {
      message.success(successMessage, 2);
      return true;
    })
    .catch((error: Error) => {
      message.error(error.message, 5);
      return false;
    });
