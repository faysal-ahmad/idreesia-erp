import { AccountHeads } from "meteor/idreesia-common/collections/accounts";

export default async function getAllAccounts(companyId) {
  const pipeline = [
    {
      $match: {
        companyId: { $eq: companyId }
      }
    },
    {
      $graphLookup: {
        from: "accounts-account-heads",
        startWith: "$number",
        connectFromField: "number",
        connectToField: "parent",
        as: "childAccounts",
        maxDepth: 1
      }
    },
    {
      $match: {
        childAccounts: { $size: 0 }
      }
    }
  ];

  return AccountHeads.aggregate(pipeline).toArray();
}
