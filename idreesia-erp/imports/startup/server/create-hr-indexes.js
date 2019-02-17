import { Karkuns } from "meteor/idreesia-common/collections/hr";

Karkuns.rawCollection().createIndex({ firstName: "text", lastName: "text" });
