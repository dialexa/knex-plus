/**
 * @file
 * A flexible & lightweight repository class powered by Knex
 *
 * @author Luke Gordon <luke@dialexa.com>
 * @copyright Dialexa 2018
 */
import * as Knex from "knex";
import { IRepository } from "./interfaces";
export default class Repository<T> implements IRepository<T> {
    protected knex: Knex;
    private table;
    constructor(knex: Knex, table: string);
    createAll(data: object, fields?: string[]): Promise<T[]>;
    create(data: object, fields?: string[]): Promise<T>;
    findBy(criteria: object, fields?: string[]): Promise<T>;
    list(options?: {
        criteria?: object;
        page?: number;
        pageSize?: number;
        fields?: string[];
        orderBy?: string[];
    }): Promise<T[]>;
    update(criteria: object, data: object): Promise<boolean>;
    updateAll(criteria: object, data: object): Promise<number>;
    destroy(criteria: object): Promise<boolean>;
    destroyAll(criteria: object): Promise<number>;
    readonly qb: Knex.QueryBuilder;
    where(criteria: object): Knex.QueryBuilder;
}
