import { Accounts } from "meteor/accounts-base";
import { Migrations } from "meteor/quave:migrations";

Migrations.add({
  version: 1,
  async up() {
    const adminUser = await Accounts.findUserByUsername("erp-admin");
    if (!adminUser) {
      await Accounts.createUserAsync({
        username: "erp-admin",
        password: "p@ssw0rd",
      });
    }
  },
});
