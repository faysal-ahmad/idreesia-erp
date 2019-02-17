/* eslint "no-param-reassign": "off" */
import sql from "mssql";
import { Categories } from "meteor/idreesia-common/collections/accounts";

export default async function importCategoriesData(company, adminUser) {
  return new Promise((resolve, reject) => {
    const config = company.connectivitySettings;
    sql.connect(config, err => {
      if (err) reject(err);

      const sqlRequest = new sql.Request();
      sqlRequest.stream = true;
      sqlRequest.query("Select * from Accounts");

      let importedCategories = 0;
      const rowsToProcess = [];
      const processRows = () => {
        rowsToProcess.forEach(
          ({ Title, Type, Nature, AccountNo, Parent, Description }) => {
            const existingCategory = Categories.findOne({
              companyId: company._id,
              number: AccountNo,
            });

            if (!existingCategory) {
              importedCategories++;
              const date = new Date();
              Categories.insert(
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
                  console.log(error);
                }
              );
            }
          }
        );
      };

      sqlRequest.on("row", row => {
        rowsToProcess.push(row);
      });

      sqlRequest.on("done", () => {
        processRows();
        resolve(importedCategories);
      });
    });

    sql.on("error", err => {
      if (err) reject(err);
    });
  });
}
