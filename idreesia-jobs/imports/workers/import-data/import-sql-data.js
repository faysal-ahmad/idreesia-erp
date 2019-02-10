import { Accounts } from "meteor/accounts-base";
import { Companies } from "meteor/idreesia-common/collections/accounts";

import importCompanyData from './import-company-data';

const config = {
    user: 'erp-server',
    password: 'password',
    server: '192.168.1.249',
    database: 'eduConnectionDB',
    options: {
        tdsVersion: '7_1',
    },
};

Meteor.startup(async () => {
    const adminUser = Accounts.findUserByUsername("erp-admin");
    let company = Companies.findOne({name: "Anjuman Jamia Masjid"});
    if (!company) {
        const date = new Date();
        Companies.insert({
            name: "Anjuman Jamia Masjid",
            importTransactions: true,
            connectivitySettings: Object.assign({}, config, {
                database: "eduBS_Ent",
            }),
            createdAt: date,
            createdBy: adminUser._id,
            updatedAt: date,
            updatedBy: adminUser._id,
        });

        company = Companies.findOne({name: "Anjuman Jamia Masjid"});
    }
    await importCompanyData(company, adminUser);

    company = Companies.findOne({name: "Eastern Breeze Foundation"});
    if (!company) {
        const date = new Date();
        Companies.insert({
            name: "Eastern Breeze Foundation",
            importTransactions: true,
            connectivitySettings: Object.assign({}, config, {
                database: "EastereduBS_Ent",
            }),
            createdAt: date,
            createdBy: adminUser._id,
            updatedAt: date,
            updatedBy: adminUser._id,
        });

        company = Companies.findOne({name: "Eastern Breeze Foundation"});
    }
    await importCompanyData(company, adminUser);
});
