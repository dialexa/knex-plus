import * as Knex from "knex";
import IPaginationParams from "./pagination";
/**
 * @file
 * A flexible & lightweight repository class powered by Knex
 *
 * @author Luke Gordon <luke@dialexa.com>
 * @copyright Dialexa 2018
 */
export default interface IRepository<T> {
    /**
     * @returns a query builder for this repository's table
     */
    qb: Knex.QueryBuilder;
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
    createAll(data: object, fields?: string[]): Promise<T[]>;
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
    create(data: object, fields?: string[]): Promise<T>;
    /**
     * Finds the first database record that matches the provided criteria
     *
     * @param criteria a database record must satisfy
     * @param fields from the database record to return
     *
     * @returns the fields from the database record if found, undefined otherwise
     */
    findBy(criteria: object, fields?: string[]): Promise<T>;
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
    list(params?: IPaginationParams): Promise<T[]>;
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
    update(criteria: object, data: object): Promise<boolean>;
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
    updateAll(criteria: object, data: object): Promise<number>;
    /**
     *
     * Destroys the first database record that matches the provided criteria
     *
     * @param criteria the database record being destroyed must satisfy
     *
     * @returns true if a database record was deleted, false otherwise
     * @throws if a record deletion violates a database constraint
     */
    destroy(criteria: object): Promise<boolean>;
    /**
     *
     * Destroys all database records that match the provided criteria
     *
     * @param criteria all destroyed records must satisfy
     *
     * @returns the # of records deleted from the database
     * @throws if a record deletion violates a database constraint
     */
    destroyAll(criteria: object): Promise<number>;
    /**
     *
     * @param criteria to use for scoping a query
     *
     * @returns a query builder scoped to the provided criteria
     */
    where(criteria: object): Knex.QueryBuilder;
}
