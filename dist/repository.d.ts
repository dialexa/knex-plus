/**
 * @file
 * A flexible & lightweight repository class powered by Knex
 *
 * @author Luke Gordon <luke@dialexa.com>
 * @copyright Dialexa 2018
 */
import * as Knex from "knex";
import { IPaginationParams, IRepository } from "./interfaces";
export default class Repository<T> implements IRepository<T> {
    protected knex: Knex;
    private table;
    constructor(knex: Knex, table: string);
    createAll(data: object, fields?: string[]): Promise<T[]>;
    create(data: object, fields?: string[]): Promise<T>;
    findBy<S>(criteria: S, fields?: string[]): Promise<T>;
    exists<S>(criteria: S): Promise<boolean>;
    list<S>(options?: IPaginationParams<S>): Promise<T[]>;
    update<S>(criteria: S, data: object): Promise<boolean>;
    updateAll<S>(criteria: S, data: object): Promise<number>;
    destroy<S>(criteria: S): Promise<boolean>;
    destroyAll<S>(criteria: S): Promise<number>;
    readonly qb: Knex.QueryBuilder;
    where(criteria: any): Knex.QueryBuilder;
}
