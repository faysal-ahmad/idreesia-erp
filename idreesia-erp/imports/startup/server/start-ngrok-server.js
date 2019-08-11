import ngrok from "ngrok";

import Configurations from "meteor/idreesia-common/collections/common/configurations";

Meteor.startup(async () => {
  if (Meteor.isProduction) {
    try {
      const url = await ngrok.connect({
        proto: "http",
        addr: 3000,
        bind_tls: true,
      });

      Configurations.upsert({ name: "ngrok_url" }, { $set: { value: url } });
      // eslint-disable-next-line no-console
      console.log(`Ngrok server started at url ${url}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
});
