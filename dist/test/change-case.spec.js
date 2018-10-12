"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const change_case_1 = require("../change-case");
describe("camelCase", () => {
    it("should not camel case a falsey value (pt 1)", () => {
        const result = change_case_1.camelCase(undefined);
        chai_1.expect(result).to.be.undefined;
    });
    it("should not camel case a falsey value (pt 2)", () => {
        const result = change_case_1.camelCase(false);
        chai_1.expect(result).to.equal(false);
    });
    it("should not camel case an * value", () => {
        const result = change_case_1.camelCase("*");
        chai_1.expect(result).to.equal("*");
    });
    it("should camel case a string", () => {
        const result = change_case_1.camelCase("test_me");
        chai_1.expect(result).to.equal("testMe");
    });
    it("should camel case each element of an array", () => {
        const result = change_case_1.camelCase(["test_a", "test_b", "test_c"]);
        chai_1.expect(result).to.deep.equal(["testA", "testB", "testC"]);
    });
    it("should camel case each key of an object", () => {
        const now = new Date();
        const result = change_case_1.camelCase({
            id: 1,
            created_at: now,
            updated_at: now,
        });
        chai_1.expect(result).to.deep.equal({
            id: 1,
            createdAt: now,
            updatedAt: now,
        });
    });
});
describe("snakeCase", () => {
    it("should not snake case a falsey value (pt 1)", () => {
        const result = change_case_1.snakeCase(undefined);
        chai_1.expect(result).to.equal(undefined);
    });
    it("should not snake case a falsey value (pt 2)", () => {
        const result = change_case_1.snakeCase(false);
        chai_1.expect(result).to.equal(false);
    });
    it("should not snake case an * value", () => {
        const result = change_case_1.snakeCase("*");
        chai_1.expect(result).to.equal("*");
    });
    it("should snake case a string", () => {
        const result = change_case_1.snakeCase("testMe");
        chai_1.expect(result).to.equal("test_me");
    });
    it("should snake case each element of an array", () => {
        const result = change_case_1.snakeCase(["testA", "testB", "testC"]);
        chai_1.expect(result).to.deep.equal(["test_a", "test_b", "test_c"]);
    });
    it("should snake case each key of an object", () => {
        const now = new Date();
        const result = change_case_1.snakeCase({
            id: 1,
            createdAt: now,
            updatedAt: now,
        });
        chai_1.expect(result).to.deep.equal({
            id: 1,
            created_at: now,
            updated_at: now,
        });
    });
});
