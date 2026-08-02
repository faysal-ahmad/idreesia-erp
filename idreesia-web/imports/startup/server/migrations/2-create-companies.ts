import { Accounts } from 'meteor/accounts-base';
import { Migrations } from 'meteor/percolate:migrations';
import { Companies } from 'meteor/idreesia-common/server/collections/accounts';

const config = {
  user: 'erp-server',
  password: 'password',
  server: '192.168.1.249',
  options: {
    tdsVersion: '7_1',
  },
};

Migrations.add({
  version: 2,
  async up() {
    const adminUser = await Accounts.findUserByUsername('erp-admin');
    if (!adminUser) throw new Error('Admin user not found.');
    let company = await Companies.findOneAsync({ name: 'Anjuman Jamia Masjid' });
    if (!company) {
      const date = new Date();
      const connectivitySettings = JSON.stringify(
        Object.assign({}, config, {
          database: 'eduBS_Ent',
        })
      );

      await Companies.insertAsync({
        name: 'Anjuman Jamia Masjid',
        importData: true,
        connectivitySettings,
        createdAt: date,
        createdBy: adminUser._id,
        updatedAt: date,
        updatedBy: adminUser._id,
      });
    }

    company = await Companies.findOneAsync({ name: 'Eastern Breeze Foundation' });
    if (!company) {
      const date = new Date();
      const connectivitySettings = JSON.stringify(
        Object.assign({}, config, {
          database: 'EastereduBS_Ent',
        })
      );

      await Companies.insertAsync({
        name: 'Eastern Breeze Foundation',
        importData: true,
        connectivitySettings,
        createdAt: date,
        createdBy: adminUser._id,
        updatedAt: date,
        updatedBy: adminUser._id,
      });
    }
  },
});
