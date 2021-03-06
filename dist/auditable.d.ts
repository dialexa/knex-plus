/**
 * @file
 * A flexible & lightweight repository class powered by Knex
 *
 * @author Luke Gordon <luke@dialexa.com>
 * @copyright Dialexa 2018
 */
import * as Knex from "knex";
import Repository from "./repository";
export default class AuditableRepository<T> extends Repository<T> {
    private col;
    constructor(knex: Knex, table: string, col?: string);
    update<S>(criteria: S, data: object): Promise<boolean>;
    updateAll<S>(criteria: S, data: object): Promise<number>;
}
