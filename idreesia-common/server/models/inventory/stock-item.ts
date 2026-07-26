import { assign } from 'lodash';

export default class StockItem {
  _id?: string;
  name?: string;
  company?: string;
  details?: string;
  currentStockLevel?: number;

  constructor(doc: Partial<StockItem>) {
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
