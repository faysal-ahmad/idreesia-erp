import { ValidatedMethod } from "meteor/mdg:validated-method";

import Jobs from "imports/collections/jobs";

export function create({ type, params = {}, options = {} } = {}) {
  return Jobs.create(type, params, options);
}

export const validate = () => {};

export default new ValidatedMethod({
  name: "jobs.create",
  validate,
  run: create,
});
