// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by idreesia-erp-common.js.
import { name as packageName } from "meteor/idreesia-erp-common";

// Write your tests here!
// Here is an example.
Tinytest.add('idreesia-erp-common - example', function (test) {
  test.equal(packageName, "idreesia-erp-common");
});
