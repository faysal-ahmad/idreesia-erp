import { assign } from 'lodash';

export default class Profile {
  constructor(doc) {
    assign(this, doc);
  }
}
