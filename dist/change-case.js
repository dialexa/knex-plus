"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_camelcase_1 = __importDefault(require("lodash.camelcase"));
const lodash_mapkeys_1 = __importDefault(require("lodash.mapkeys"));
const lodash_snakecase_1 = __importDefault(require("lodash.snakecase"));
const transform = (data, fn) => {
    if (!data || data === '*') {
        return data;
    }
    if (Array.isArray(data)) {
        return data.map(d => transform(d, fn));
    }
    if (typeof data === 'object') {
        return lodash_mapkeys_1.default(data, (_, k) => fn(k));
    }
    return fn(data);
};
exports.camelCase = (data) => transform(data, lodash_camelcase_1.default);
exports.snakeCase = (data) => transform(data, lodash_snakecase_1.default);
