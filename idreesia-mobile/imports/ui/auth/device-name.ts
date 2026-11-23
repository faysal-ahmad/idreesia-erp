import { cordovaPlatform } from '../utilities/capture-photo';

/** What to call this device in the list of trusted devices. */
export const getDeviceName = (): string => {
  switch (cordovaPlatform()) {
    case 'ios':
      return 'iPhone / iPad';
    case 'android':
      return 'Android device';
    default:
      return 'Web browser';
  }
};
