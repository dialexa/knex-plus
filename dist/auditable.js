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
const repository_1 = __importDefault(require("./repository"));
class AuditableRepository extends repository_1.default {
    constructor(knex, table, col) {
        super(knex, table);
        // Updated at column
        this.col = col || 'updatedAt';
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
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            const updates = Object.assign({}, data, { [this.col]: new Date() });
            return _super("update").call(this, criteria, updates);
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
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            const updates = Object.assign({}, data, { [this.col]: new Date() });
            return _super("updateAll").call(this, criteria, updates);
        });
    }
}
exports.default = AuditableRepository;
