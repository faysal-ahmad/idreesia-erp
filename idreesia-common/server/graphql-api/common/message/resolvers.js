export default {
  MessageType: {
    msKarkunCount: messageType =>
      messageType.msKarkunIds ? messageType.msKarkunIds.length : 0,
    outstationKarkunCount: messageType =>
      messageType.outstationKarkunIds
        ? messageType.outstationKarkunIds.length
        : 0,
    visitorCount: messageType =>
      messageType.visitorIds ? messageType.visitorIds.length : 0,
  },
};
