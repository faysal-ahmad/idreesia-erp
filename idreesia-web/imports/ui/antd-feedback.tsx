import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { NotificationInstance } from 'antd/es/notification/interface';

type ModalInstance = Omit<ModalStaticFunctions, 'warn'>;

// Populated by AntdFeedbackBridge once antd <App> mounts (antd global-scene pattern).
let message!: MessageInstance;
let modal!: ModalInstance;
let notification!: NotificationInstance;

/**
 * Mount inside antd `<App>` so static feedback APIs use App context.
 * Call sites import `message` / `modal` / `notification` from this module.
 */
export const AntdFeedbackBridge = () => {
  const staticApi = App.useApp();
  message = staticApi.message;
  modal = staticApi.modal;
  notification = staticApi.notification;
  return null;
};

export { message, modal, notification };
