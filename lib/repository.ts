/**
 * @file
 * A flexible & lightweight repository class powered by Knex
 *
 * @author Luke Gordon <luke@dialexa.com>
 * @copyright Dialexa 2018
 */

import * as Knex from 'knex';
import { camelCase, snakeCase} from './change-case';

export default class Repository<T> {

  /**
   *
   * @param knex a flexible query builder
   * @param table database table to use for this repository
   */
  constructor (protected knex: Knex, private table: string) { }

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
  public async createAll (data: object, fields?: string[]) : Promise<T[]> {
    const obj = snakeCase(data);
    const cols = snakeCase(fields || '*');

    const ids = await this.qb.insert(obj);
    const records = await this.where({ id: ids }).select(cols);

    return camelCase(records);
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
  public async create (data: object, fields?: string[]) : Promise<T> {
    const records = await this.createAll(data, fields);

    return records[0];
  }

  /**
   * Finds the first database record that matches the provided criteria
   *
   * @param criteria a database record must satisfy
   * @param fields from the database record to return
   *
   * @returns the fields from the database record if found, undefined otherwise
   */
  public async findBy (criteria: object, fields?: string[]) : Promise<T> {
    const cols = snakeCase(fields);

    const record = await this.where(criteria).select(cols).first();

    return camelCase(record);
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
  public async list (options?: { criteria?: object, page?: number, pageSize?: number, fields?: String[], orderBy?: String[] }) : Promise<T[]> {
    const defaults = { criteria: {}, fields: '*', page: 1, pageSize: 25, orderBy: [] };

    const params = Object.assign({}, defaults, options);
    const { criteria, fields, page, pageSize, orderBy } = params;

    const cols = snakeCase(fields);
    const offset = (page - 1) * pageSize;

    const query = this.where(criteria)
      .select(cols)
      .offset(offset)
      .limit(pageSize);

    orderBy.map(ordering => {
      const columnName: string = snakeCase(ordering);
      const direction: string = ordering.startsWith('-') ? 'DESC' : 'ASC';

      query.orderBy(columnName, direction);
    });

    return query.map(record => camelCase(record));
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
  public async update (criteria: object, data: object) : Promise<boolean> {
    const changes = snakeCase(data);

    const updates = await this.where(criteria)
      .limit(1)
      .update(changes);

    return !!updates;
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
  public async updateAll (criteria: object, data: object) : Promise<number> {
    const changes = snakeCase(data);

    return await this.where(criteria).update(changes);
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
  public async destroy (criteria: object) : Promise<boolean> {
    const deletions = await this.where(criteria)
      .limit(1)
      .del();

    return !!deletions;
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
  public async destroyAll (criteria: object) : Promise<number> {
    return await this.where(criteria).del();
  }

  /**
   * @returns a query builder for this repository's table
   */
  public get qb() : Knex.QueryBuilder {
    return this.knex(this.table);
  }

  /**
   *
   * @param criteria to use for scoping a query
   *
   * @returns a query builder scoped to the provided criteria
   */
  public where (criteria: object) : Knex.QueryBuilder {
    let query = this.qb.clone();

    Object.keys(criteria).map(key => {
      const column = snakeCase(key);
      const value = criteria[key];

      if (Array.isArray(value)) { query.whereIn(column, value); }
      else { query.where(column, value); }
    });

    return query;
  }
}
