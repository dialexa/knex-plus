"use strict";
/**
 * @file
 * A flexible & lightweight repository class powered by Knex
 *
 * @author Luke Gordon <luke@dialexa.com>
 * @copyright Dialexa 2018
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const change_case_1 = require("./change-case");
class Repository {
    /**
     *
     * @param knex a flexible query builder
     * @param table database table to use for this repository
     */
    constructor(knex, table) {
        this.knex = knex;
        this.table = table;
    }
    /**
     *
     * Creates database records in bulk
     *
     * @param data to persist to the database
     * @param fields to return from the persisted database records
     *
     * @returns the created database records
     * @throws if the provided data violates a database constraint
     */
    createAll(data, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = change_case_1.snakeCase(data);
            const cols = change_case_1.snakeCase(fields || '*');
            const ids = yield this.qb.insert(obj);
            const records = yield this.where({ id: ids }).select(cols);
            return change_case_1.camelCase(records);
        });
    }
    /**
     *
     * Creates a single database record
     *
     * @param data to persist to the database
     * @param fields to return from the persisted database record
     *
     * @returns the created database record
     * @throws if the provided data violates a database constraint
     */
    create(data, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield this.createAll(data, fields);
            return records[0];
        });
    }
    /**
     * Finds the first database record that matches the provided criteria
     *
     * @param criteria a database record must satisfy
     * @param fields from the database record to return
     *
     * @returns the fields from the database record if found, undefined otherwise
     */
    findBy(criteria, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const cols = change_case_1.snakeCase(fields);
            const record = yield this.where(criteria).select(cols).first();
            return change_case_1.camelCase(record);
        });
    }
    /**
     *
     * Returns a paginated array of database records that match the given criteria
     *
     * @param options to apply to the paginated list of database records
     *    - criteria returned database records must satisfy
     *    - page the starting page to fetch data from (1 based)
     *    - pageSize the maximum # of records to return
     *    - fields from the database record to fetch
     *    - orderBy how the data should be ordered.
     *       examples: -name, name, -email, email, etc.
     *
     * @returns a paginated array of database records that match the provided criteria
     */
    list(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaults = { criteria: {}, fields: '*', page: 1, pageSize: 25, orderBy: [] };
            const params = Object.assign({}, defaults, options);
            const { criteria, fields, page, pageSize, orderBy } = params;
            const cols = change_case_1.snakeCase(fields);
            const offset = (page - 1) * pageSize;
            const query = this.where(criteria)
                .select(cols)
                .offset(offset)
                .limit(pageSize);
            orderBy.map(ordering => {
                const columnName = change_case_1.snakeCase(ordering);
                const direction = ordering.startsWith('-') ? 'DESC' : 'ASC';
                query.orderBy(columnName, direction);
            });
            return query.map(record => change_case_1.camelCase(record));
        });
    }
    /**
     *
     * Updates the first database record that matches the provided criteria
     *
     * @param criteria the database record being updated must satisfy
     * @param data changes to apply to the matching database record
     *
     * @returns true if a database record was updated, false otherwise
     * @throws if a record update violates a database constraint
     */
    update(criteria, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const changes = change_case_1.snakeCase(data);
            const updates = yield this.where(criteria)
                .limit(1)
                .update(changes);
            return !!updates;
        });
    }
    /**
     *
     * Updates all database records that match the provided criteria
     *
     * @param criteria all updated records must satisfy
     * @param data changes to apply to records that match the provided criteria
     *
     * @returns the # of records updated in the database
     * @throws if a record update violates a database constraint
     */
    updateAll(criteria, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const changes = change_case_1.snakeCase(data);
            return yield this.where(criteria).update(changes);
        });
    }
    /**
     *
     * Destroys the first database record that matches the provided criteria
     *
     * @param criteria the database record being destroyed must satisfy
     *
     * @returns true if a database record was deleted, false otherwise
     * @throws if a record deletion violates a database constraint
     */
    destroy(criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletions = yield this.where(criteria)
                .limit(1)
                .del();
            return !!deletions;
        });
    }
    /**
     *
     * Destroys all database records that match the provided criteria
     *
     * @param criteria all destroyed records must satisfy
     *
     * @returns the # of records deleted from the database
     * @throws if a record deletion violates a database constraint
     */
    destroyAll(criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.where(criteria).del();
        });
    }
    /**
     * @returns a query builder for this repository's table
     */
    get qb() {
        return this.knex(this.table);
    }
    /**
     *
     * @param criteria to use for scoping a query
     *
     * @returns a query builder scoped to the provided criteria
     */
    where(criteria) {
        let query = this.qb.clone();
        Object.keys(criteria).map(key => {
            const column = change_case_1.snakeCase(key);
            const value = criteria[key];
            if (Array.isArray(value)) {
                query.whereIn(column, value);
            }
            else {
                query.where(column, value);
            }
        });
        return query;
    }
}
exports.default = Repository;
