/* eslint "no-param-reassign": "off" */
import sql from "mssql";
import { AccountHeads } from "meteor/idreesia-common/collections/accounts";

export default async function importCategoriesData(company, adminUser) {
  return new Promise((resolve /* , reject */) => {
    const sqlRequest = new sql.Request();
    sqlRequest.stream = true;
    sqlRequest.query("Select * from Accounts");

    let importedAccountHeads = 0;
    const rowsToProcess = [];
    const processRows = () => {
      rowsToProcess.forEach(
        ({ Title, Type, Nature, AccountNo, Parent, Description }) => {
          const existingAccountHead = AccountHeads.findOne({
            companyId: company._id,
            number: AccountNo,
          });

          if (!existingAccountHead) {
            importedAccountHeads++;
            const date = new Date();
            AccountHeads.insert(
              {
                companyId: company._id,
                name: Title,
                description: Description,
                type: Type,
                nature: Nature,
                number: AccountNo,
                parent: Parent,
                createdAt: date,
                createdBy: adminUser._id,
                updatedAt: date,
                updatedBy: adminUser._id,
              },
              error => {
                if (error) {
                  // eslint-disable-next-line no-console
                  console.log(error);
                }
              }
            );
          }
        }
      );
    };

    sqlRequest.on("row", row => {
      rowsToProcess.push(row);
    });

    sqlRequest.on(
      "done",
      Meteor.bindEnvironment(() => {
        processRows();
        resolve(importedAccountHeads);
      })
    );
  });
}
