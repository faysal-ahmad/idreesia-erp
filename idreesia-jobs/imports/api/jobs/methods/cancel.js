import { ValidatedMethod } from 'meteor/mdg:validated-method';

import Jobs from '/imports/collections/jobs';

export function cancel({ selector }) {
  return Jobs.cancel(selector);
}

export const validate = () => {};

export default new ValidatedMethod({
  name: 'jobs.cancel',
  validate,
  run: cancel,
});
