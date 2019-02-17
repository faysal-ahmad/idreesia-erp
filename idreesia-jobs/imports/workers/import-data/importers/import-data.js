/* eslint "no-param-reassign": "off" */
import sql from "mssql";
import { Categories } from "meteor/idreesia-common/collections/accounts";

async function importAccountCategories(company, adminUser) {
  return new Promise((resolve, reject) => {
    const config = company.connectivitySettings;
    sql.connect(config, err => {
      if (err) reject(err);

      const sqlRequest = new sql.Request();
      sqlRequest.stream = true;
      sqlRequest.query("Select * from Accounts");

      const rowsToProcess = [];
      const processRows = () => {
        rowsToProcess.forEach(
          ({ Title, Type, Nature, AccountNo, Parent, Description }) => {
            const existingCategory = Categories.findOne({
              companyId: company._id,
              number: AccountNo,
            });

            if (!existingCategory) {
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
        resolve();
      });
    });

    sql.on("error", err => {
      if (err) reject(err);
    });
  });
}

export default async function importData(dataImport) {
  try {
    // console.dir(`Importing data for ${company.name}`);
    // await importAccountCategories(company, adminUser);
    dataImport.status = "completed";
  } catch (err) {
    dataImport.status = "errored";
    dataImport.errorDetails = err.message;
  } finally {
    sql.close();
  }
}
