import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DeliveryOrder as DeliveryOrderSchema } from 'meteor/idreesia-common/server/schemas/wazaif';

class DeliveryOrders extends AggregatableCollection {
  constructor(name = 'wazaif-management-delivery-orders', options = {}) {
    const deliveryOrders = super(name, options);
    deliveryOrders.attachSchema(DeliveryOrderSchema);
    return deliveryOrders;
  }
}

export default new DeliveryOrders();
