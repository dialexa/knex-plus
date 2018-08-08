import Knex from 'knex';
import { expect } from 'chai';

import Repository from '../repository';
import { camelCase } from '../change-case';

// Create a connection to a test database
const knex = Knex({
  dialect: 'sqlite3',
  connection: { filename: './test.db' },
  useNullAsDefault: true
});

// Test interface for the repository
interface IUser {
  id?: number,
  email: string,
  password: string,
  role: string,
  createdAt: Date,
  updatedAt: Date
}

// Test database table
const TABLE_NAME = 'users';
// Repository for the user's database table
const repository = new Repository<IUser>(knex, TABLE_NAME);

// Utility function for clearing the user's table
const deleteUsers = () => knex.raw('DELETE FROM users');

// Utility function for creating a user
const createUser = async (options = {}) => {
  const defaults = { email, password, role };
  const data = Object.assign({}, defaults, options);

  await knex('users').insert(data);
}

// Test data
const email = 'luke@dialexa.com';
const password = 'swordfish';
const role = 'admin';

describe('Repository', () => {
  before(async () => {
    // Remove any stale data from previous test runs
    await knex.schema.dropTableIfExists(TABLE_NAME);
    // Create a table to use for our tests
    await knex.schema.createTable(TABLE_NAME, table => {
      table.increments('id');
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.string('role').notNullable();
      table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').nullable();
    })
  });

  after(() => knex.destroy());

  describe('create()', () => {
    beforeEach(() => deleteUsers());

    afterEach(() => deleteUsers());

    it('should camel case and persist a record', async () => {
      const actual = await repository.create({ email, password, role });

      // Validate the returned object
      expect(actual).to.not.be.undefined;

      expect(actual.id).to.not.be.null;

      expect(actual.email).to.equal(email);
      expect(actual.password).to.equal(password);
      expect(actual.role).to.equal(role);

      expect(actual.createdAt).to.not.be.null;
      expect(actual.updatedAt).to.be.null;

      // Validate the database record matches
      const record = await knex(TABLE_NAME).first();
      const expected = camelCase(record);

      expect(actual).to.deep.equal(expected);
    });
  });

  describe('findBy()', () => {
    beforeEach(async () => {
      await deleteUsers()
      await createUser();
    });

    afterEach(() => deleteUsers());

    it('should find a user by their email', async () => {
      const record = await knex('users').first();
      const actual = await repository.findBy({ email });

      const expected = camelCase(record);

      expect(actual).to.deep.equal(expected);
    });

    it('should only return the specified fields', async () => {
      const actual = await repository.findBy({ email }, ['id']);

      expect(actual).to.be.not.be.undefined;

      const keys = Object.keys(actual);

      expect(keys.length).to.equal(1);
      expect(keys).to.include('id');
    });

    it('should only return a single user', async () => {
      await knex('users').insert({ email: 'luke+1@dialexa.com', password, role });

      const result = await repository.findBy({ role });

      expect(typeof result).to.equal('object');
    });

    it('should return undefined if a user is not found', async () => {
      const actual = await repository.findBy({ email: 'doesnotexist' });

      expect(actual).to.be.undefined;
    });
  });

  describe('list()', () => {
    before(async () => {
      await deleteUsers();

      // Create a few users
      for (let loop = 0; loop < 15; loop++) {
        ['admin', 'customer'].map(async role => {
          await createUser({ email: `luke+${role}+${loop + 1}@dialexa.com`, role });
        });
      }
    });

    after(() => deleteUsers());

    it('should return users who match the provided criteria', async () => {
      const criteria = { role: 'admin' };
      const users = await repository.list({ criteria });

      users.map(user => expect(user.role).to.equal('admin'));
    });

    it('should default to the first page and 25 users', async () => {
      const users = await repository.list();

      expect(users.length).to.equal(25);
    });

    it('should respect the page parameter', async () => {
      const users = await repository.list({ page: 2 });

      expect(users.length).to.equal(5);
    });

    it('should respect the page size parameter', async () => {
      const pageSize = 5;
      const users = await repository.list({ pageSize });

      expect(users.length).to.equal(pageSize);
    });

    it('should only return the specified fields', async () => {
      const users = await repository.list({ fields: ['id'] });

      users.map(user => {
        const keys = Object.keys(user);
        expect(keys.length).to.equal(1);
        expect(keys).to.include('id');
      });
    });

    it('should sort the returned data appropriately (asc)', async () => {
      const users = await repository.list({ orderBy: ['email'] });
      const sorted = users.sort((a, b) => {
        if (a.email < b.email) { return -1; }
        else if (a.email > b.email) { return 1; }
        return 0;
      });

      // Validate the users were returned in appropriate order
      expect(users).to.deep.equal(sorted);

      // Validate the appropriate users were returned from the database
      const records = await knex('users').orderBy('email').limit(25);
      expect(users).to.deep.equal(camelCase(records));
    });

    it('should sort the returned data appropriately (desc)', async () => {
      const users = await repository.list({ orderBy: ['-email'] });
      const sorted = users.sort((a, b) => {
        if (a.email < b.email) { return 1; }
        else if (a.email > b.email) { return -1; }
        return 0;
      });

      // Validate the users were returned in appropriate order
      expect(users).to.deep.equal(sorted);

      // Validate the appropriate users were returned from the database
      const records = await knex('users').orderBy('email', 'desc').limit(25);
      expect(users).to.deep.equal(camelCase(records));
    });
  });

  describe('update()', () => {
    beforeEach(() => deleteUsers());

    afterEach(() => deleteUsers());

    it('should return true if a database record was updated', async () => {
      // Create a user
      await createUser();

      // Update the user
      const newPassword = 'newPassword';
      const criteria = { email };
      const result = await repository.update(criteria, { password: newPassword });
      expect(result).to.be.true;

      // Make sure the user was indeed updated
      const record = await knex('users').first();
      expect(record.password).to.equal(newPassword);
    });

    it('should return false if a database record was not updated', async () => {
      // Create a user
      await createUser();

      // Attempt to update a user (does not match)
      const newPassword = 'newPassword';
      const criteria = { email: 'doesnotexist' };
      const result = await repository.update(criteria, { password: newPassword });
      expect(result).to.be.false;

      // Make sure we didn't update the other user!
      const record = await knex('users').first();
      expect(record.password).to.not.equal(newPassword);
    });
  });

  describe('updateAll()', () => {
    beforeEach(() => deleteUsers());

    afterEach(() => deleteUsers());

    it('should return the # of database records updated (exactly 1)', async () => {
      // Create a user
      await createUser();

      // Update the user's password
      const newPassword = 'newPassword';
      const criteria = { email };

      const result = await repository.updateAll(criteria, { password: newPassword });
      expect(result).to.equal(1);

      // Make sure the new password was persisted
      const record = await knex('users').first();
      expect(record.password).to.equal(newPassword);
    });

    it('should return the # of database records updated (more than 1)', async () => {
      // Create a few users
      for (let loop = 0; loop < 10; loop++) {
        await createUser({ email: `luke+${loop}@dialexa.com` });
      }

      // Update all of the users password to the same password
      const newPassword = 'newPassword';
      const criteria = { role };
      const result = await repository.updateAll(criteria, { password: newPassword });
      expect(result).to.equal(10);

      // Make sure all of their passwords were updated
      const records = await knex('users').where({ role });
      records.map(record => expect(record.password).to.equal(newPassword));
    });

    it('should return the # of database records updated (no matches)', async () => {
      // Create a user (who should not be updated)
      await createUser();

      // Attempt to update users where there are no matches
      const newPassword = 'newPassword';
      const criteria = { email: 'doesnotexist' };

      const result = await repository.updateAll(criteria, { password: newPassword });
      expect(result).to.equal(0);

      // Make sure we didn't update any of the other users
      const record = await knex('users').first();
      expect(record.password).to.not.equal(newPassword);
    });
  });

  describe('destroy()', () => {
    beforeEach(() => deleteUsers());

    afterEach(() => deleteUsers());

    it('should return true if a database record was destroyed', async () => {
      // Create a user to destroy
      await createUser();

      // Destroy the user
      const result = await repository.destroy({ email });
      expect(result).to.be.true;

      // Make sure the user was indeed destroyed
      const record = await knex('users').first();
      expect(record).to.be.undefined;
    });

    it('should return false if a database record was not destroyed', async () => {
      // Create a user who does NOT match the criteria
      await createUser();

      // Attempt to destroy a user who does not exist
      const result = await repository.destroy({ email: 'doesnotexist' });
      expect(result).to.be.false;

      // Make sure we didn't touch the non-matching user
      const record = await knex('users').first();
      expect(record).to.not.be.undefined;
    });
  });

  describe('destroyAll()', () => {
    beforeEach(() => deleteUsers());

    afterEach(() => deleteUsers());

    it('should return the # of database records destroyed (exactly 1)', async () => {
      // Create a user
      await createUser();
      // Create a 2nd user who doesn't match the provided criteria
      await createUser({ email: 'luke+1@dialexa.com' });

      // Destroy the users who match the given email
      const result = await repository.destroyAll({ email });
      expect(result).to.equal(1);

      // Make sure we destroyed the right users!
      const records = await knex('users');
      expect(records.length).to.equal(1);
      expect(records[0].email).to.equal('luke+1@dialexa.com');
    });

    it('should return the # of database records destroyed (more than 1)', async () => {
      // Create a few users
      for (let loop = 0; loop < 10; loop++) {
        await createUser({ email: `luke+${loop}@dialexa.com` });
      }
      // Create a user with a different role
      await createUser({ email: 'luke+customer@dialexa.com', role: 'customer' });

      // Destroy all the users who match a given role
      const result = await repository.destroyAll({ role });
      expect(result).to.equal(10);

      // Make sure they were indeed deleted from the database
      let records = await knex('users').where({ role });
      expect(records.length).to.equal(0);

      // Make sure we didn't delete the other users!
      records = await knex('users').where({ role: 'customer' });
      expect(records.length).to.equal(1);
    });

    it('should return the # of database records destroyed (no matches)', async () => {
      // Create a user
      await createUser();

      // Attempt to destroy some users (no matches)
      const result = await repository.destroyAll({ email: 'doesnotexist' });
      expect(result).to.equal(0);

      // Make sure we didn't delete the other users!
      const record = await knex('users').first();
      expect(record).to.not.be.undefined;
    });
  });
});
