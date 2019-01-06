import { ItemTypes } from "/imports/lib/collections/inventory";
import { Karkuns } from "/imports/lib/collections/hr";

ItemTypes.rawCollection().createIndex({ name: "text", details: "text" });
Karkuns.rawCollection().createIndex({ firstName: "text", lastName: "text" });
