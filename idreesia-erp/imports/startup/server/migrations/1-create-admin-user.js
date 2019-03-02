import { Accounts } from "meteor/accounts-base";
import { Migrations } from "meteor/percolate:migrations";

Migrations.add({
  version: 1,
  up() {
    const adminUser = Accounts.findUserByUsername("erp-admin");
    if (!adminUser) {
      Accounts.createUser({
        username: "erp-admin",
        password: "p@ssw0rd",
      });
    }
  },
});
