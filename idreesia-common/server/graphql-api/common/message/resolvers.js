export default {
  MessageType: {
    karkunCount: messageType =>
      messageType.karkunIds ? messageType.karkunIds.length : 0,
    visitorCount: messageType =>
      messageType.visitorIds ? messageType.visitorIds.length : 0,
  },
};
