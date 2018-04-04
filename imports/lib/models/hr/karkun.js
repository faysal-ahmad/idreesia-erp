import { assign } from 'lodash';

export default class Karkun {
  constructor(doc) {
    assign(this, doc);
  }

  get name() {
    return `${this.firstName} ${this.lastName}`;
  }
}
