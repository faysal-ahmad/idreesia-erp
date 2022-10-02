import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  // Number of wazaif in a packet
  packetCount: {
    type: Number,
  },
  // Number of packets in a sub-carton
  subCartonCount: {
    type: Number,
  },
  // Number of sub-cartons in a carton
  cartonCount: {
    type: Number,
  },
});
