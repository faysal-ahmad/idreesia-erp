import { assign } from "lodash";

export default class Visitor {
  constructor(doc) {
    assign(this, doc);
  }

  get name() {
    return `${this.firstName} ${this.lastName}`;
  }
}
