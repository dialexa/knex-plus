"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const knex_1 = __importDefault(require("knex"));
const change_case_1 = require("../change-case");
const repository_1 = __importDefault(require("../repository"));
// Create a connection to a test database
const knex = knex_1.default({
    dialect: "sqlite3",
    connection: { filename: "./test.db" },
    useNullAsDefault: true,
});
// Test database table
const TABLE_NAME = "users";
// Repository for the user's database table
const repository = new repository_1.default(knex, TABLE_NAME);
// Utility function for clearing the user's table
const deleteUsers = () => knex.raw("DELETE FROM users");
// Utility function for creating a user
const createUser = (options = {}) => __awaiter(this, void 0, void 0, function* () {
    const defaults = { email, password, role };
    const data = Object.assign({}, defaults, options);
    yield knex("users").insert(data);
});
// Test data
const email = "luke@dialexa.com";
// tslint:disable-next-line:no-hardcoded-credentials
const password = "swordfish";
const role = "admin";
describe("Repository", () => {
    before(() => __awaiter(this, void 0, void 0, function* () {
        // Remove any stale data from previous test runs
        yield knex.schema.dropTableIfExists(TABLE_NAME);
        // Create a table to use for our tests
        yield knex.schema.createTable(TABLE_NAME, (table) => {
            table.increments("id");
            table.string("email").notNullable().unique();
            table.string("password").notNullable();
            table.string("role").notNullable();
            table.timestamp("created_at").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
            table.timestamp("updated_at").nullable();
        });
    }));
    after(() => knex.destroy());
    describe("create()", () => {
        beforeEach(() => deleteUsers());
        afterEach(() => deleteUsers());
        it("should camel case and persist a record", () => __awaiter(this, void 0, void 0, function* () {
            const actual = yield repository.create({ email, password, role });
            // Validate the returned object
            chai_1.expect(actual).to.not.be.undefined;
            chai_1.expect(actual.id).to.not.be.null;
            chai_1.expect(actual.email).to.equal(email);
            chai_1.expect(actual.password).to.equal(password);
            chai_1.expect(actual.role).to.equal(role);
            chai_1.expect(actual.createdAt).to.not.be.null;
            chai_1.expect(actual.updatedAt).to.be.null;
            // Validate the database record matches
            const record = yield knex(TABLE_NAME).first();
            const expected = change_case_1.camelCase(record);
            chai_1.expect(actual).to.deep.equal(expected);
        }));
    });
    describe("findBy()", () => {
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            yield deleteUsers();
            yield createUser();
        }));
        afterEach(() => deleteUsers());
        it("should find a user by their email", () => __awaiter(this, void 0, void 0, function* () {
            const record = yield knex("users").first();
            const actual = yield repository.findBy({ email });
            const expected = change_case_1.camelCase(record);
            chai_1.expect(actual).to.deep.equal(expected);
        }));
        it("should only return the specified fields", () => __awaiter(this, void 0, void 0, function* () {
            const actual = yield repository.findBy({ email }, ["id"]);
            chai_1.expect(actual).to.be.not.be.undefined;
            const keys = Object.keys(actual);
            chai_1.expect(keys.length).to.equal(1);
            chai_1.expect(keys).to.include("id");
        }));
        it("should only return a single user", () => __awaiter(this, void 0, void 0, function* () {
            yield knex("users").insert({ email: "luke+1@dialexa.com", password, role });
            const result = yield repository.findBy({ role });
            chai_1.expect(typeof result).to.equal("object");
        }));
        it("should return undefined if a user is not found", () => __awaiter(this, void 0, void 0, function* () {
            const actual = yield repository.findBy({ email: "doesnotexist" });
            chai_1.expect(actual).to.be.undefined;
        }));
    });
    describe("exists()", () => {
        beforeEach(() => __awaiter(this, void 0, void 0, function* () { return yield deleteUsers(); }));
        it("should return true if the record exists", () => __awaiter(this, void 0, void 0, function* () {
            yield createUser();
            const exists = yield repository.exists({ email });
            chai_1.expect(exists).to.be.true;
        }));
        it("should return false if the record does not exist", () => __awaiter(this, void 0, void 0, function* () {
            const exists = yield repository.exists({ email });
            chai_1.expect(exists).to.be.false;
        }));
    });
    describe("list()", () => {
        before(() => __awaiter(this, void 0, void 0, function* () {
            yield deleteUsers();
            // Create a few users
            for (let loop = 0; loop < 15; loop++) {
                ["admin", "customer"].forEach((userRole) => __awaiter(this, void 0, void 0, function* () {
                    yield createUser({ email: `luke+${userRole}+${loop + 1}@dialexa.com`, role: userRole });
                }));
            }
        }));
        after(() => deleteUsers());
        it("should return users who match the provided criteria", () => __awaiter(this, void 0, void 0, function* () {
            const criteria = { role: "admin" };
            const users = yield repository.list({ criteria });
            users.forEach((user) => chai_1.expect(user.role).to.equal("admin"));
        }));
        it("should default to the first page and 25 users", () => __awaiter(this, void 0, void 0, function* () {
            const users = yield repository.list();
            chai_1.expect(users.length).to.equal(25);
        }));
        it("should respect the page parameter", () => __awaiter(this, void 0, void 0, function* () {
            const users = yield repository.list({ page: 2 });
            chai_1.expect(users.length).to.equal(5);
        }));
        it("should respect the page size parameter", () => __awaiter(this, void 0, void 0, function* () {
            const pageSize = 5;
            const users = yield repository.list({ pageSize });
            chai_1.expect(users.length).to.equal(pageSize);
        }));
        it("should only return the specified fields", () => __awaiter(this, void 0, void 0, function* () {
            const users = yield repository.list({ fields: ["id"] });
            users.forEach((user) => {
                const keys = Object.keys(user);
                chai_1.expect(keys.length).to.equal(1);
                chai_1.expect(keys).to.include("id");
            });
        }));
        it("should sort the returned data appropriately (asc)", () => __awaiter(this, void 0, void 0, function* () {
            const users = yield repository.list({ orderBy: [{ field: "email" }] });
            const sorted = users.sort((a, b) => {
                if (a.email < b.email) {
                    return -1;
                }
                if (a.email > b.email) {
                    return 1;
                }
                return 0;
            });
            // Validate the users were returned in appropriate order
            chai_1.expect(users).to.deep.equal(sorted);
            // Validate the appropriate users were returned from the database
            const records = yield knex("users").orderBy("email").limit(25);
            chai_1.expect(users).to.deep.equal(change_case_1.camelCase(records));
        }));
        it("should sort the returned data appropriately (desc)", () => __awaiter(this, void 0, void 0, function* () {
            const users = yield repository.list({ orderBy: [{ field: "email", direction: "DESC" }] });
            const sorted = users.sort((a, b) => {
                if (a.email < b.email) {
                    return 1;
                }
                if (a.email > b.email) {
                    return -1;
                }
                return 0;
            });
            // Validate the users were returned in appropriate order
            chai_1.expect(users).to.deep.equal(sorted);
            // Validate the appropriate users were returned from the database
            const records = yield knex("users").orderBy("email", "desc").limit(25);
            chai_1.expect(users).to.deep.equal(change_case_1.camelCase(records));
        }));
    });
    describe("update()", () => {
        beforeEach(() => deleteUsers());
        afterEach(() => deleteUsers());
        it("should return true if a database record was updated", () => __awaiter(this, void 0, void 0, function* () {
            // Create a user
            yield createUser();
            // Update the user
            const newPassword = "newPassword";
            const criteria = { email };
            const result = yield repository.update(criteria, { password: newPassword });
            chai_1.expect(result).to.be.true;
            // Make sure the user was indeed updated
            const record = yield knex("users").first();
            chai_1.expect(record.password).to.equal(newPassword);
        }));
        it("should return false if a database record was not updated", () => __awaiter(this, void 0, void 0, function* () {
            // Create a user
            yield createUser();
            // Attempt to update a user (does not match)
            const newPassword = "newPassword";
            const criteria = { email: "doesnotexist" };
            const result = yield repository.update(criteria, { password: newPassword });
            chai_1.expect(result).to.be.false;
            // Make sure we didn't update the other user!
            const record = yield knex("users").first();
            chai_1.expect(record.password).to.not.equal(newPassword);
        }));
    });
    describe("updateAll()", () => {
        beforeEach(() => deleteUsers());
        afterEach(() => deleteUsers());
        it("should return the # of database records updated (exactly 1)", () => __awaiter(this, void 0, void 0, function* () {
            // Create a user
            yield createUser();
            // Update the user's password
            const newPassword = "newPassword";
            const criteria = { email };
            const result = yield repository.updateAll(criteria, { password: newPassword });
            chai_1.expect(result).to.equal(1);
            // Make sure the new password was persisted
            const record = yield knex("users").first();
            chai_1.expect(record.password).to.equal(newPassword);
        }));
        it("should return the # of database records updated (more than 1)", () => __awaiter(this, void 0, void 0, function* () {
            // Create a few users
            for (let loop = 0; loop < 10; loop++) {
                yield createUser({ email: `luke+${loop}@dialexa.com` });
            }
            // Update all of the users password to the same password
            const newPassword = "newPassword";
            const criteria = { role };
            const result = yield repository.updateAll(criteria, { password: newPassword });
            chai_1.expect(result).to.equal(10);
            // Make sure all of their passwords were updated
            const records = yield knex("users").where({ role });
            records.map((record) => chai_1.expect(record.password).to.equal(newPassword));
        }));
        it("should return the # of database records updated (no matches)", () => __awaiter(this, void 0, void 0, function* () {
            // Create a user (who should not be updated)
            yield createUser();
            // Attempt to update users where there are no matches
            const newPassword = "newPassword";
            const criteria = { email: "doesnotexist" };
            const result = yield repository.updateAll(criteria, { password: newPassword });
            chai_1.expect(result).to.equal(0);
            // Make sure we didn't update any of the other users
            const record = yield knex("users").first();
            chai_1.expect(record.password).to.not.equal(newPassword);
        }));
    });
    describe("destroy()", () => {
        beforeEach(() => deleteUsers());
        afterEach(() => deleteUsers());
        it("should return true if a database record was destroyed", () => __awaiter(this, void 0, void 0, function* () {
            // Create a user to destroy
            yield createUser();
            // Destroy the user
            const result = yield repository.destroy({ email });
            chai_1.expect(result).to.be.true;
            // Make sure the user was indeed destroyed
            const record = yield knex("users").first();
            chai_1.expect(record).to.be.undefined;
        }));
        it("should return false if a database record was not destroyed", () => __awaiter(this, void 0, void 0, function* () {
            // Create a user who does NOT match the criteria
            yield createUser();
            // Attempt to destroy a user who does not exist
            const result = yield repository.destroy({ email: "doesnotexist" });
            chai_1.expect(result).to.be.false;
            // Make sure we didn't touch the non-matching user
            const record = yield knex("users").first();
            chai_1.expect(record).to.not.be.undefined;
        }));
    });
    describe("destroyAll()", () => {
        beforeEach(() => deleteUsers());
        afterEach(() => deleteUsers());
        it("should return the # of database records destroyed (exactly 1)", () => __awaiter(this, void 0, void 0, function* () {
            // Create a user
            yield createUser();
            // Create a 2nd user who doesn't match the provided criteria
            yield createUser({ email: "luke+1@dialexa.com" });
            // Destroy the users who match the given email
            const result = yield repository.destroyAll({ email });
            chai_1.expect(result).to.equal(1);
            // Make sure we destroyed the right users!
            const records = yield knex("users");
            chai_1.expect(records.length).to.equal(1);
            chai_1.expect(records[0].email).to.equal("luke+1@dialexa.com");
        }));
        it("should return the # of database records destroyed (more than 1)", () => __awaiter(this, void 0, void 0, function* () {
            // Create a few users
            for (let loop = 0; loop < 10; loop++) {
                yield createUser({ email: `luke+${loop}@dialexa.com` });
            }
            // Create a user with a different role
            yield createUser({ email: "luke+customer@dialexa.com", role: "customer" });
            // Destroy all the users who match a given role
            const result = yield repository.destroyAll({ role });
            chai_1.expect(result).to.equal(10);
            // Make sure they were indeed deleted from the database
            let records = yield knex("users").where({ role });
            chai_1.expect(records.length).to.equal(0);
            // Make sure we didn't delete the other users!
            records = yield knex("users").where({ role: "customer" });
            chai_1.expect(records.length).to.equal(1);
        }));
        it("should return the # of database records destroyed (no matches)", () => __awaiter(this, void 0, void 0, function* () {
            // Create a user
            yield createUser();
            // Attempt to destroy some users (no matches)
            const result = yield repository.destroyAll({ email: "doesnotexist" });
            chai_1.expect(result).to.equal(0);
            // Make sure we didn't delete the other users!
            const record = yield knex("users").first();
            chai_1.expect(record).to.not.be.undefined;
        }));
    });
});
