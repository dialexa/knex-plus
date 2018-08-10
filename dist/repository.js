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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_get_1 = __importDefault(require("lodash.get"));
const change_case_1 = require("./change-case");
class Repository {
    constructor(knex, table) {
        this.knex = knex;
        this.table = table;
    }
    createAll(data, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = change_case_1.snakeCase(data);
            const cols = change_case_1.snakeCase(fields || "*");
            let records = [];
            const dialect = lodash_get_1.default(this.knex, ['client', 'config', 'dialect'], 'sqlite3');
            if (dialect === 'sqlite3') {
                const ids = yield this.qb.insert(obj);
                records = yield this.where({ id: ids }).select(cols);
            }
            else {
                records = yield this.qb.insert(obj, cols);
            }
            return change_case_1.camelCase(records);
        });
    }
    create(data, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield this.createAll(data, fields);
            return records[0];
        });
    }
    findBy(criteria, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const cols = change_case_1.snakeCase(fields);
            const record = yield this.where(criteria).select(cols).first();
            return change_case_1.camelCase(record);
        });
    }
    list(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaults = { criteria: {}, fields: "*", page: 1, pageSize: 25, orderBy: [] };
            const params = Object.assign({}, defaults, options);
            const { criteria, fields, page, pageSize, orderBy } = params;
            const cols = change_case_1.snakeCase(fields);
            const offset = (page - 1) * pageSize;
            const query = this.where(criteria)
                .select(cols)
                .offset(offset)
                .limit(pageSize);
            orderBy.map((ordering) => {
                const columnName = change_case_1.snakeCase(ordering);
                const direction = ordering.startsWith("-") ? "DESC" : "ASC";
                query.orderBy(columnName, direction);
            });
            return query.map((record) => change_case_1.camelCase(record));
        });
    }
    update(criteria, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const changes = change_case_1.snakeCase(data);
            const updates = yield this.where(criteria)
                .limit(1)
                .update(changes);
            return !!updates;
        });
    }
    updateAll(criteria, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const changes = change_case_1.snakeCase(data);
            return yield this.where(criteria).update(changes);
        });
    }
    destroy(criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletions = yield this.where(criteria)
                .limit(1)
                .del();
            return !!deletions;
        });
    }
    destroyAll(criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.where(criteria).del();
        });
    }
    get qb() {
        return this.knex(this.table);
    }
    where(criteria) {
        const query = this.qb.clone();
        Object.keys(criteria).forEach((key) => {
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
