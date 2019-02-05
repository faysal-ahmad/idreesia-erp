import { assign } from 'lodash';

export default class ItemType {
  constructor(doc) {
    assign(this, doc);
  }

  get formattedName() {
    const { name, company, details } = this;
    let formattedName = name;
    if (company) {
      formattedName = `${formattedName} - ${company}`;
    }
    if (details) {
      formattedName = `${formattedName} - ${details}`;
    }
  
    return formattedName;
  }
}
