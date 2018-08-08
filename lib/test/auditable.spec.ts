import Knex from 'knex';
import { expect } from 'chai';

import AuditableRepository from '../auditable';
import { camelCase } from '../change-case';

// Create a connection to a test database
const knex = Knex({
  dialect: 'sqlite3',
  connection: { filename: './test.db' },
  useNullAsDefault: true
});

// Test interfaces for the repositories
interface IUser {
  id?: number,
  email: string,
  createdAt: Date,
  updatedAt: Date
}

interface IOrganization {
  id?: number,
  name: string,
  createdAt: Date,
  modifiedAt: Date
}

describe('AuditableRepository', () => {
  before(async () => {
    // Remove any stale data from previous test runs
    await knex.schema.dropTableIfExists('users');
    await knex.schema.dropTableIfExists('organizations');
    // Create a few tables to use for our tests
    await knex.schema.createTable('users', table => {
      table.increments('id');
      table.string('email').notNullable();
      table.string('role').notNullable();
      table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').nullable();
    });
    await knex.schema.createTable('organizations', table => {
      table.increments('id');
      table.string('name').notNullable();
      table.string('city').notNullable();
      table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('modified_at').nullable();
    });
  });

  after(() => knex.destroy());

  describe('update()', () => {
    it('should update the default updatedAt column', async () => {
      const repository = new AuditableRepository<IUser>(knex, 'users');
      const email = 'luke@dialexa.com';
      const role = 'developer';

      const user = await repository.create({ email, role });

      expect(user.updatedAt).to.be.null;

      const criteria = { email };

      const result = await repository.update(criteria, { email: 'luke+1@dialexa.com' });
      expect(result).to.be.true;

      const record = await knex('users').first();
      expect(camelCase(record).updatedAt).to.not.be.null;
    });

    it('should update a custom updatedAt column', async () => {
      const repository = new AuditableRepository<IOrganization>(knex, 'organizations', 'modifiedAt');
      const name = 'Dialexa';
      const city = 'Dallas';

      const org = await repository.create({ name, city });

      expect(org.modifiedAt).to.be.null;

      const criteria = { name };

      const result = await repository.update(criteria, { name: 'Vinli' });
      expect(result).to.be.true;

      const record = await knex('organizations').first();
      expect(camelCase(record).modifiedAt).to.not.be.null;
    });
  });

  describe('updateAll()', () => {
    it('should update the default updatedAt column', async () => {
      const repository = new AuditableRepository<IUser>(knex, 'users');
      const role = 'developer';

      for (let loop = 0; loop < 25; loop++) {
        const email = `luke+${loop+1}@dialexa.com`;

        const user = await repository.create({ email, role });
        expect(user.updatedAt).to.be.null;
      }

      const criteria = { role };

      const result = await repository.update(criteria, { role: 'sales' });
      expect(result).to.be.true;

      const records = await knex('users');
      records.map(record => expect(camelCase(record).updatedAt).to.not.be.null);
    });

    it('should update a custom updatedAt column', async () => {
      const repository = new AuditableRepository<IOrganization>(knex, 'organizations', 'modifiedAt');

      const name = 'Dialexa';
      const city = 'Dallas';

      const org = await repository.create({ name, city });

      expect(org.modifiedAt).to.be.null;

      const criteria = { city };

      const result = await repository.update(criteria, { city: 'Austin' });
      expect(result).to.be.true;

      const records = await knex('organizations');
      records.map(record => expect(camelCase(record).modifiedAt).to.not.be.null);
    });
  });
});
