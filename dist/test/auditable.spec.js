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
const auditable_1 = __importDefault(require("../auditable"));
const change_case_1 = require("../change-case");
// Create a connection to a test database
const knex = knex_1.default({
    dialect: "sqlite3",
    connection: { filename: "./test.db" },
    useNullAsDefault: true,
});
// Helper function for clearing the database
const deleteTables = () => __awaiter(this, void 0, void 0, function* () {
    yield knex.raw("DELETE FROM users");
    yield knex.raw("DELETE FROM organizations");
});
describe("AuditableRepository", () => {
    before(() => __awaiter(this, void 0, void 0, function* () {
        // Remove any stale data from previous test runs
        yield knex.schema.dropTableIfExists("users");
        yield knex.schema.dropTableIfExists("organizations");
        // Create a few tables to use for our tests
        yield knex.schema.createTable("users", (table) => {
            table.increments("id");
            table.string("email").notNullable();
            table.string("role").notNullable();
            table.timestamp("created_at").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
            table.timestamp("updated_at").nullable();
        });
        yield knex.schema.createTable("organizations", (table) => {
            table.increments("id");
            table.string("name").notNullable();
            table.string("city").notNullable();
            table.timestamp("created_at").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
            table.timestamp("modified_at").nullable();
        });
    }));
    beforeEach(() => deleteTables());
    afterEach(() => deleteTables());
    after(() => knex.destroy());
    describe("update()", () => {
        it("should update the default updatedAt column", () => __awaiter(this, void 0, void 0, function* () {
            const repository = new auditable_1.default(knex, "users");
            const email = "luke@dialexa.com";
            const role = "developer";
            const user = yield repository.create({ email, role });
            chai_1.expect(user.updatedAt).to.be.null;
            const criteria = { email };
            const result = yield repository.update(criteria, { email: "luke+1@dialexa.com" });
            chai_1.expect(result).to.be.true;
            const record = yield knex("users").first();
            chai_1.expect(change_case_1.camelCase(record).updatedAt).to.not.be.null;
        }));
        it("should update a custom updatedAt column", () => __awaiter(this, void 0, void 0, function* () {
            const repository = new auditable_1.default(knex, "organizations", "modifiedAt");
            const name = "Dialexa";
            const city = "Dallas";
            const org = yield repository.create({ name, city });
            chai_1.expect(org.modifiedAt).to.be.null;
            const criteria = { name };
            const result = yield repository.update(criteria, { name: "Vinli" });
            chai_1.expect(result).to.be.true;
            const record = yield knex("organizations").first();
            chai_1.expect(change_case_1.camelCase(record).modifiedAt).to.not.be.null;
        }));
    });
    describe("updateAll()", () => {
        it("should update the default updatedAt column", () => __awaiter(this, void 0, void 0, function* () {
            const repository = new auditable_1.default(knex, "users");
            const role = "developer";
            for (let loop = 0; loop < 25; loop++) {
                const email = `luke+${loop + 1}@dialexa.com`;
                const user = yield repository.create({ email, role });
                chai_1.expect(user.updatedAt).to.be.null;
            }
            const criteria = { role };
            const result = yield repository.updateAll(criteria, { role: "sales" });
            chai_1.expect(result).to.equal(25);
            const records = yield knex("users");
            records.map((record) => chai_1.expect(change_case_1.camelCase(record).updatedAt).to.not.be.null);
        }));
        it("should update a custom updatedAt column", () => __awaiter(this, void 0, void 0, function* () {
            const repository = new auditable_1.default(knex, "organizations", "modifiedAt");
            const city = "Dallas";
            for (let loop = 0; loop < 25; loop++) {
                const name = `Organization #${loop + 1}`;
                const org = yield repository.create({ name, city });
                chai_1.expect(org.modifiedAt).to.be.null;
            }
            const criteria = { city };
            const result = yield repository.updateAll(criteria, { city: "Austin" });
            chai_1.expect(result).to.equal(25);
            const records = yield knex("organizations");
            records.map((record) => chai_1.expect(change_case_1.camelCase(record).modifiedAt).to.not.be.null);
        }));
    });
});
