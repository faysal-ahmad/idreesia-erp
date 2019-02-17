import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Companies } from "meteor/idreesia-common/collections/accounts";

const config = {
  user: "erp-server",
  password: "password",
  server: "192.168.1.249",
  options: {
    tdsVersion: "7_1",
  },
};

Meteor.startup(() => {
  const adminUser = Accounts.findUserByUsername("erp-admin");
  let company = Companies.findOne({ name: "Anjuman Jamia Masjid" });
  if (!company) {
    const date = new Date();
    const connectivitySettings = JSON.stringify(
      Object.assign({}, config, {
        database: "eduBS_Ent",
      })
    );

    Companies.insert({
      name: "Anjuman Jamia Masjid",
      importData: true,
      connectivitySettings,
      createdAt: date,
      createdBy: adminUser._id,
      updatedAt: date,
      updatedBy: adminUser._id,
    });
  }

  company = Companies.findOne({ name: "Eastern Breeze Foundation" });
  if (!company) {
    const date = new Date();
    const connectivitySettings = JSON.stringify(
      Object.assign({}, config, {
        database: "EastereduBS_Ent",
      })
    );

    Companies.insert({
      name: "Eastern Breeze Foundation",
      importData: true,
      connectivitySettings,
      createdAt: date,
      createdBy: adminUser._id,
      updatedAt: date,
      updatedBy: adminUser._id,
    });
  }
});
