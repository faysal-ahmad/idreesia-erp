import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PrintingOrder as PrintingOrderSchema } from 'meteor/idreesia-common/server/schemas/wazaif';

class PrintingOrders extends AggregatableCollection {
  constructor(name = 'wazaif-management-printing-orders', options = {}) {
    const printingOrders = super(name, options);
    printingOrders.attachSchema(PrintingOrderSchema);
    return printingOrders;
  }
}

export default new PrintingOrders();
