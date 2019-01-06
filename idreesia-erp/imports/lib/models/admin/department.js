import { assign } from 'lodash';

export default class Department {
  constructor(doc) {
    assign(this, doc);
  }
}
