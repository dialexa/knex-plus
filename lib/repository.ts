/**
 * @file
 * A flexible & lightweight repository class powered by Knex
 *
 * @author Luke Gordon <luke@dialexa.com>
 * @copyright Dialexa 2018
 */

import * as Knex from "knex";
import get from "lodash.get";
import merge from "lodash.merge";

import { camelCase, snakeCase} from "./change-case";
import { IPaginationParams, IRepository } from "./interfaces";

export default class Repository<T> implements IRepository<T> {

  constructor(protected knex: Knex, private table: string) { }

  public async createAll(data: object, fields?: string[]): Promise<T[]> {
    const obj = snakeCase(data);
    const cols = snakeCase(fields || "*");
    let records = [];

    const dialect = get(this.knex, ["client", "config", "client"], "sqlite3");

    if (dialect === "sqlite3") {
      const ids = await this.qb.insert(obj);
      records = await this.where({ id: ids }).select(cols);
    } else {
      records = await this.qb.insert(obj, cols);
    }

    return camelCase(records);
  }

  public async create(data: object, fields?: string[]): Promise<T> {
    const records = await this.createAll(data, fields);

    return records[0];
  }

  public async findBy<S>(criteria: S, fields?: string[]): Promise<T> {
    const cols = snakeCase(fields);

    const record = await this.where(criteria).select(cols).first();

    return camelCase(record);
  }

  public async list<S>(options?: IPaginationParams<S>): Promise<T[]> {
    const defaults: IPaginationParams<S> = { criteria: null, fields: [], page: 1, pageSize: 25, orderBy: [] };

    const params = merge({}, defaults, options);
    const { criteria, fields, page, pageSize, orderBy } = params;

    const cols = snakeCase(fields);
    const offset = (page - 1) * pageSize;

    const query = this.where(criteria)
      .select(cols)
      .offset(offset)
      .limit(pageSize);

    orderBy.map(({ field, direction }) => query.orderBy(field, direction || "ASC"));

    return query.map((record) => camelCase(record));
  }

  public async update<S>(criteria: S, data: object): Promise<boolean> {
    const changes = snakeCase(data);

    const updates = await this.where(criteria)
      .limit(1)
      .update(changes);

    return !!updates;
  }

  public async updateAll<S>(criteria: S, data: object): Promise<number> {
    const changes = snakeCase(data);

    return await this.where(criteria).update(changes);
  }

  public async destroy<S>(criteria: S): Promise<boolean> {
    const deletions = await this.where(criteria)
      .limit(1)
      .del();

    return !!deletions;
  }

  public async destroyAll<S>(criteria: S): Promise<number> {
    return await this.where(criteria).del();
  }

  public get qb(): Knex.QueryBuilder {
    return this.knex(this.table);
  }

  public where(criteria: any): Knex.QueryBuilder {
    const query = this.qb.clone();
    if (!criteria) { return query; }

    Object.keys(criteria).forEach((key) => {
      const column = snakeCase(key);
      const value = criteria[key];

      if (Array.isArray(value)) {
        query.whereIn(column, value);
      } else {
        query.where(column, value);
      }
    });

    return query;
  }
}
