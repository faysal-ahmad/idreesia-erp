import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  wazeefaId: {
    type: String,
  },
  formattedName: {
    type: String,
  },
  packets: {
    type: Number,
  },
  wazaifCount: {
    type: Number,
  },
});
