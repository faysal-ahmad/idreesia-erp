import { ItemTypes } from "meteor/idreesia-common/collections/inventory";
import { Karkuns } from "meteor/idreesia-common/collections/hr";

ItemTypes.rawCollection().createIndex({ name: "text", details: "text" });
Karkuns.rawCollection().createIndex({ firstName: "text", lastName: "text" });
